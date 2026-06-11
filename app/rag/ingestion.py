from langchain_community.document_loaders.parsers import PyMuPDFParser
from langchain_core.documents.base import Blob
from app.cloud_service import CloudService



class Ingestion:
    def get_pdf_docs(self, cloud_file_id: str):
        file_bytes = CloudService.get_file_view(file_id=cloud_file_id)
        
        # Create Blob
        blob = Blob.from_data(file_bytes, mime_type="application/pdf")
        
        # Parse Blob directly using the parser
        parser = PyMuPDFParser()
        docs = list(parser.lazy_parse(blob))
        if not docs:
            raise ValueError(
                "No content extracted from document."
            )
        
        return docs
