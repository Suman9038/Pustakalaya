from app.rag.ingestion import Ingestion
from app.rag.splitter import TextSplitter
from app.rag.vector_store import QdrantService
from app.rag.indexing_tracker import IndexingTracker
from uuid import UUID
import logging

logger = logging.getLogger(__name__)


class IndexingService:
    def __init__(self):
        self.ingestion = Ingestion()
        self.text_splitter = TextSplitter()
        self.qdrant = QdrantService()

    def index_book(self, book_id: UUID, file_id: str, title: str):
        book_id_str = str(book_id)
        try:
            # 1. Fetch document
            IndexingTracker.update(book_id_str, percent=15, message="Reading document from storage...")
            docs = self.ingestion.get_pdf_docs(cloud_file_id=file_id)

            # 2. Chunk document
            IndexingTracker.update(book_id_str, percent=35, message=f"Extracted {len(docs)} pages. Splitting into passages...")
            chunks = self.text_splitter.split_document(docs)

            for index, chunk in enumerate(chunks):
                chunk.metadata["book_id"] = book_id_str
                chunk.metadata["title"] = title
                chunk.metadata["chunk_index"] = index

            total_chunks = len(chunks)
            batch_size = 100
            total_batches = (total_chunks + batch_size - 1) // batch_size

            # 3. Vector Embeddings
            IndexingTracker.update(
                book_id_str,
                percent=40,
                message=f"Generating embeddings for {total_chunks} passages..."
            )

            def on_batch(batch_num, total_b, count, status="completed"):
                if status == "started":
                    pct = 40 + int(((batch_num - 1) / total_b) * 55)
                    msg = f"Embedding batch {batch_num} of {total_b} ({count} passages)..."
                else:
                    pct = 40 + int((batch_num / total_b) * 55)
                    msg = f"Indexed batch {batch_num} of {total_b} ({pct}%)"
                IndexingTracker.update(
                    book_id_str,
                    percent=pct,
                    message=msg
                )

            self.qdrant.add_documents(
                documents=chunks,
                batch_size=batch_size,
                progress_callback=on_batch
            )

            # 4. Success
            IndexingTracker.update(
                book_id_str,
                percent=100,
                message="Embedding complete! Launching chat...",
                completed=True
            )
            logger.info(f"Successfully finished indexing book {book_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to index book {book_id}: {str(e)}", exc_info=True)
            IndexingTracker.update(
                book_id_str,
                percent=0,
                message=f"Indexing failed: {str(e)}",
                error=str(e)
            )
            raise e
