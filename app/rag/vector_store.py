from uuid import UUID
from qdrant_client import QdrantClient
from qdrant_client.models import (Distance,VectorParams,Filter,FieldCondition,MatchValue)
from langchain_qdrant import QdrantVectorStore
from app.rag.embeddings import GetEmbeddingModels
from app.config import settings


class QdrantService:
    def __init__(self):
        if hasattr(settings, "QDRANT_CLOUD_API") and settings.QDRANT_CLOUD_API:
            self.client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_CLOUD_API
            )
        else:
            self.client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT
            )
        self.embeddings = GetEmbeddingModels().get_hf_embedding_models()
        self.collection_name= settings.QDRANT_COLLECTION

    def create_collection(self):
        collection = self.client.get_collections()

        existing =[
            c.name for c in collection.collections
        ]

        if self.collection_name in existing:
            return
        
        self.client.create_collection(
            collection_name=self.collection_name,

            vectors_config=VectorParams(
                size= 384,
                distance= Distance.COSINE
            )
        )
    
    def add_documents(self, documents):
        vector_store = QdrantVectorStore(
            client= self.client,
            collection_name= self.collection_name,
            embedding= self.embeddings
        )

        vector_store.add_documents(
            documents
        )

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

    def get_book_retriever(self, book_id:UUID):
        vector_store = QdrantVectorStore(
            client=self.client,
            collection_name=self.collection_name,
            embedding=self.embeddings
        )
        retriever = vector_store.as_retriever(
        search_kwargs={
            "k": 5,
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

        return retriever

    def delete_book_vectors(self, book_id:UUID):
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


     
    

        