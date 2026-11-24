from typing import List, Any
import threading
from uuid import UUID
import logging
from qdrant_client import QdrantClient
from qdrant_client.models import (Distance, VectorParams, Filter, FieldCondition, MatchValue, Range)
from langchain_qdrant import QdrantVectorStore
from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever
from app.rag.embeddings import GetEmbeddingModels
from app.config import settings

logger = logging.getLogger(__name__)


class BookAwareRetriever(BaseRetriever):
    """
    Retriever that seamlessly combines semantic vector search with front-matter enrichment.
    Ensures Table of Contents, Chapter 1, Chapter 2, and overview structures are never omitted.
    """
    vector_retriever: Any
    qdrant_client: Any
    collection_name: str
    book_id: str

    class Config:
        arbitrary_types_allowed = True

    def _get_relevant_documents(self, query: str) -> List[Document]:
        base_docs = self.vector_retriever.invoke(query)
        return self._enrich_docs(query, base_docs)

    async def _aget_relevant_documents(self, query: str) -> List[Document]:
        base_docs = await self.vector_retriever.ainvoke(query)
        return self._enrich_docs(query, base_docs)

    def _enrich_docs(self, query: str, base_docs: List[Document]) -> List[Document]:
        q_lower = query.lower()
        needs_toc = any(k in q_lower for k in [
            "table of content", "contents", "chapter", "outline", "syllabus", 
            "index", "overview", "what is this book", "all chapters", "summary"
        ])
        if not needs_toc:
            return base_docs

        try:
            # Scroll first 6 chunks of the book (TOC, Chapter 1, Chapter 2)
            toc_filter = Filter(
                must=[
                    FieldCondition(key="metadata.book_id", match=MatchValue(value=self.book_id)),
                    FieldCondition(key="metadata.chunk_index", range=Range(gte=0, lte=5))
                ]
            )
            records, _ = self.qdrant_client.scroll(
                collection_name=self.collection_name,
                scroll_filter=toc_filter,
                limit=6,
                with_payload=True
            )
            front_docs = []
            for r in records:
                p = r.payload or {}
                content = p.get("page_content") or ""
                meta = p.get("metadata") or {}
                if content:
                    front_docs.append(Document(page_content=content, metadata=meta))

            front_docs.sort(key=lambda d: d.metadata.get("chunk_index", 0))

            seen_indices = set()
            merged = []
            for d in front_docs + base_docs:
                idx = d.metadata.get("chunk_index")
                if idx is not None and idx in seen_indices:
                    continue
                if idx is not None:
                    seen_indices.add(idx)
                merged.append(d)
            return merged
        except Exception as e:
            logger.debug(f"Front docs enrichment failed: {e}")
            return base_docs


class QdrantService:
    _instance = None
    _lock = threading.RLock()

    def __new__(cls, *args, **kwargs):
        """Thread-safe Singleton pattern: only one QdrantService instance exists per process."""
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(QdrantService, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.client = QdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT
        )
        self.collection_name = settings.QDRANT_COLLECTION
        self._embeddings = None
        self._initialized = True

    @property
    def embeddings(self):
        """
        Lazy-loaded singleton embedding model.
        Vector deletions and collection creations never load weights.
        Only operations that actually embed text will access this property.
        """
        if self._embeddings is None:
            self._embeddings = GetEmbeddingModels.get_hf_embedding_models()
        return self._embeddings

    def create_collection(self):
        collection = self.client.get_collections()

        existing = [
            c.name for c in collection.collections
        ]

        if self.collection_name in existing:
            return

        self.client.create_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE
            )
        )

    def add_documents(self, documents, batch_size: int = 100, progress_callback=None):
        """
        Embeds and indexes documents into Qdrant in controlled batches.
        Prevents memory spikes, socket timeouts, and batch payload limit rejections.
        """
        if not documents:
            return

        vector_store = QdrantVectorStore(
            client=self.client,
            collection_name=self.collection_name,
            embedding=self.embeddings
        )

        total_docs = len(documents)
        total_batches = (total_docs + batch_size - 1) // batch_size
        logger.info(f"Indexing {total_docs} chunks into Qdrant in {total_batches} batches (batch_size={batch_size})")

        for i in range(0, total_docs, batch_size):
            batch = documents[i : i + batch_size]
            batch_num = (i // batch_size) + 1
            if progress_callback:
                try:
                    progress_callback(batch_num, total_batches, len(batch), "started")
                except Exception as cb_err:
                    logger.debug(f"Progress callback error: {cb_err}")

            logger.info(f"Uploading embedding batch {batch_num}/{total_batches} ({len(batch)} chunks)...")
            vector_store.add_documents(batch)

            if progress_callback:
                try:
                    progress_callback(batch_num, total_batches, len(batch), "completed")
                except Exception as cb_err:
                    logger.debug(f"Progress callback error: {cb_err}")

        logger.info(f"Successfully finished indexing all {total_docs} chunks into Qdrant.")

    def get_retriever(self):
        vector_store = QdrantVectorStore(
            client=self.client,
            collection_name=self.collection_name,
            embedding=self.embeddings
        )

        retriever = vector_store.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 5,
                "fetch_k": 10
            }
        )

        return retriever

    def get_book_retriever(self, book_id: UUID):
        vector_store = QdrantVectorStore(
            client=self.client,
            collection_name=self.collection_name,
            embedding=self.embeddings
        )
        base_retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={
                "k": 10,
                "filter": Filter(
                    must=[
                        FieldCondition(
                            key="metadata.book_id",
                            match=MatchValue(
                                value=str(book_id)
                            )
                        )
                    ]
                )
            }
        )

        return BookAwareRetriever(
            vector_retriever=base_retriever,
            qdrant_client=self.client,
            collection_name=self.collection_name,
            book_id=str(book_id)
        )

    def delete_book_vectors(self, book_id: UUID):
        """Deletes vectors directly by filter. Does NOT touch embeddings or load weights!"""
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="metadata.book_id",
                        match=MatchValue(
                            value=str(book_id)
                        )
                    )
                ]
            )
        )
