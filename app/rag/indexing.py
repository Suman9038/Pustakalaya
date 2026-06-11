from app.rag.ingestion import Ingestion
from app.rag.splitter import TextSplitter
from app.rag.vector_store import QdrantService
from uuid import UUID
import logging

logger = logging.getLogger(__name__)


class IndexingService:
    def __init__(self):
        self.ingestion = Ingestion()
        self.text_splitter = TextSplitter()
        self.qdrant = QdrantService()


    def index_book(self, book_id:UUID, file_id:str, title:str):
        # Fetch the book From Cloud
        docs = self.ingestion.get_pdf_docs(cloud_file_id=file_id)

        logger.info(f"Fetched {len(docs)} documents from cloud for book {book_id}")
        
        # Chunk/Split the books Into Small parts
        chunks = self.text_splitter.split_document(docs)

        logger.info(f"Split {len(chunks)} chunks from book {book_id}")

        for index, chunk in enumerate(chunks):
            chunk.metadata["book_id"] = str(book_id)
            chunk.metadata["title"] = title
            chunk.metadata["chunk_index"] = index
        
        logger.info(f"Metadata added to chunks for book {book_id}")

        self.qdrant.add_documents(documents=chunks)
        
        logger.info(f"Successfully indexed book {book_id}")

        return True
            
