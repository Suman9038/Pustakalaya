from dotenv import load_dotenv
load_dotenv()
from app.config import settings



class GetEmbeddingModels:
    _hf_model = None

    @classmethod
    def get_google_embedding_models(cls):
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        return GoogleGenerativeAIEmbeddings(
            model="gemini-embedding-001",
        )

    @classmethod
    def get_hf_embedding_models(cls):
        if cls._hf_model is None:
            from langchain_huggingface import HuggingFaceEmbeddings
            cls._hf_model = HuggingFaceEmbeddings(
               model_name="ibm-granite/granite-embedding-97m-multilingual-r2",
               cache_folder=".embeddings/.cache"
            )
        return cls._hf_model

