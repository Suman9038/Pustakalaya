from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings,HuggingFacePipeline
from dotenv import load_dotenv
load_dotenv()
from app.config import settings



class GetEmbeddingModels:
    @staticmethod
    def get_google_embedding_models():
        return GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-001",
        )

    @staticmethod
    def get_hf_embedding_models():
        return HuggingFaceEmbeddings(
           model_name="ibm-granite/granite-embedding-97m-multilingual-r2",
           cache_folder=".embeddings/.cache"
        )

