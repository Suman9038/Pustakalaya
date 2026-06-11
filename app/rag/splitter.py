from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document


class TextSplitter:
    def __init__(self):
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size= 1000,
            chunk_overlap= 200,
            length_function=len,
            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                ""
            ]
        )
    
    def split_document(self,docs)-> list[Document]:
        return self.splitter.split_documents(docs)