import threading
import logging
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
from app.config import settings
import os

load_dotenv()
logger = logging.getLogger(__name__)

if not os.path.exists(".cache"):
    os.makedirs(".cache")

EMBEDDING_MODEL = settings.LOCAL_EMBEDDING_MODEL


class GetEmbeddingModels:
    _hf_instance = None
    _google_instance = None
    _lock = threading.RLock()

    @classmethod
    def get_google_embedding_models(cls):
        """Thread-safe singleton for Google generative embeddings."""
        if cls._google_instance is None:
            with cls._lock:
                if cls._google_instance is None:
                    cls._google_instance = GoogleGenerativeAIEmbeddings(
                        model="gemini-embedding-001",
                    )
        return cls._google_instance

    @classmethod
    def get_hf_embedding_models(cls):
        """
        Thread-safe Singleton for HuggingFace embeddings.
        Loads the model weights into memory ONCE on first access and reuses the instance across all requests.
        Eliminates repeated disk I/O, progress bar stalls, and RAM fragmentation.
        """
        if cls._hf_instance is None:
            with cls._lock:
                if cls._hf_instance is None:
                    logger.info("Initializing HuggingFaceEmbeddings singleton (loading model weights once)...")
                    cls._hf_instance = HuggingFaceEmbeddings(
                        model_name=EMBEDDING_MODEL,
                        model_kwargs={
                            "device": "cpu",  # Strictly CPU par chalane ke liye
                        },
                        cache_folder=".embeddings/.cache"
                    )
                    logger.info("HuggingFaceEmbeddings singleton initialized successfully.")
        return cls._hf_instance
