import fitz
import io
import logging
from langchain_core.documents import Document
from langchain_community.document_loaders.parsers import PyMuPDFParser
from langchain_core.documents.base import Blob
from app.cloud_service import CloudService

logger = logging.getLogger(__name__)


class Ingestion:
    def get_docs(self, cloud_file_id: str, mime_type: str | None = None) -> list[Document]:
        file_bytes = CloudService.get_file_view(file_id=cloud_file_id)
        if not file_bytes:
            raise ValueError("Empty file retrieved from cloud storage.")

        docs = []

        # 1. Try PyMuPDF direct stream inspection (supports PDF, EPUB, XPS, MOBI, etc.)
        for filetype in ["pdf", "epub", "xps", None]:
            try:
                doc = fitz.open(stream=file_bytes, filetype=filetype) if filetype else fitz.open(stream=file_bytes)
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    text = page.get_text()
                    if text and text.strip():
                        docs.append(
                            Document(
                                page_content=text.strip(),
                                metadata={"page": page_num + 1, "source": cloud_file_id}
                            )
                        )
                doc.close()
                if docs:
                    return docs
            except Exception:
                continue

        # 2. Try parsing as DOCX if PyMuPDF didn't extract
        try:
            import docx
            doc_file = io.BytesIO(file_bytes)
            docx_doc = docx.Document(doc_file)
            full_text = []
            for para in docx_doc.paragraphs:
                if para.text.strip():
                    full_text.append(para.text.strip())
            for table in docx_doc.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        full_text.append(row_text)
            if full_text:
                docs.append(
                    Document(
                        page_content="\n\n".join(full_text),
                        metadata={"source": cloud_file_id, "type": "docx"}
                    )
                )
                return docs
        except Exception:
            pass

        # 3. Fallback to PyMuPDFParser Blob
        try:
            blob = Blob.from_data(file_bytes, mime_type="application/pdf")
            parser = PyMuPDFParser()
            docs = list(parser.lazy_parse(blob))
            if docs:
                return docs
        except Exception as e:
            logger.error(f"Fallback parser failed for {cloud_file_id}: {e}")

        if not docs:
            raise ValueError("No content extracted from document.")
        return docs

    def get_pdf_docs(self, cloud_file_id: str, mime_type: str | None = None) -> list[Document]:
        return self.get_docs(cloud_file_id=cloud_file_id, mime_type=mime_type)
