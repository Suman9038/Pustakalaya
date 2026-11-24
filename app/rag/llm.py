import threading
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openrouter import ChatOpenRouter
from langchain_groq import ChatGroq
from langchain_ollama import ChatOllama
from app.config import settings
from dotenv import load_dotenv
import os

load_dotenv()

LOCAL_MODEL= settings.LOCAL_TEXT_MODEL

class LLMModels:
    _google_llm = None
    _ollama_llm = None
    _openrouter_llm = None
    _groq_llm = None
    _fallback_router_llm = None
    _lock = threading.RLock()

    @classmethod
    def get_google_llm(cls):
        if cls._google_llm is None:
            with cls._lock:
                if cls._google_llm is None:
                    cls._google_llm = ChatGoogleGenerativeAI(
                        model="gemini-1.5-flash-latest",
                        verbose=False,
                        temperature=0.7,
                        google_api_key=settings.GOOGLE_API_KEY
                    )
        return cls._google_llm

    @classmethod
    def get_ollama_llm(cls):
        """Primary LLM using local Ollama - FastAPI backend standard"""
        if cls._ollama_llm is None:
            with cls._lock:
                if cls._ollama_llm is None:
                    cls._ollama_llm = ChatOllama(
                        model=LOCAL_MODEL,
                        temperature=0.3,
                        verbose=False
                    )
        return cls._ollama_llm

    @classmethod
    def get_openrouter_llm(cls):
        if cls._openrouter_llm is None:
            with cls._lock:
                if cls._openrouter_llm is None:
                    cls._openrouter_llm = ChatOpenRouter(
                        model="nvidia/nemotron-3.5-lightning:free",
                        verbose=False,
                        temperature=0.7,
                        openrouter_api_key=settings.OPENROUTER_API_KEY
                    )
        return cls._openrouter_llm

    @classmethod
    def get_groq_llm(cls):
        if cls._groq_llm is None:
            with cls._lock:
                if cls._groq_llm is None:
                    cls._groq_llm = ChatGroq(
                        model="openai/gpt-oss-120b",
                        verbose=False,
                        temperature=0.3,
                        groq_api_key=settings.GROQ_API_KEY
                    )
        return cls._groq_llm

    @classmethod
    def get_fallback_router_llm(cls):
        """Thread-safe singleton for fallback LLM router."""
        if cls._fallback_router_llm is None:
            primary = cls.get_groq_llm()
            fallbacks = [
                cls.get_ollama_llm(),
                cls.get_google_llm(),
                cls.get_openrouter_llm()
            ]
            with cls._lock:
                if cls._fallback_router_llm is None:
                    cls._fallback_router_llm = primary.with_fallbacks(fallbacks)
        return cls._fallback_router_llm
