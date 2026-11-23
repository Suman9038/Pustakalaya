from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openrouter import ChatOpenRouter
from langchain_groq import ChatGroq
from app.config import settings


class LLMModels:
    @staticmethod
    def get_ollama_llm():
        """Primary LLM using local Ollama - FastAPI backend standard"""
        return ChatOllama(
            model="qwen3:0.6b",
            temperature=0.3,
            verbose=False
        )

    @staticmethod
    def get_google_llm():
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-flash-latest",
            verbose=True,
            temperature=0.7,
            google_api_key=settings.GOOGLE_API_KEY
        )

    @staticmethod
    def get_openrouter_llm():
        return ChatOpenRouter(
            model="nvidia/nemotron-3.5-lightning:free",
            verbose=True,
            temperature=0.7,
            openrouter_api_key=settings.OPENROUTER_API_KEY
        )

    @staticmethod
    def get_groq_llm():
        return ChatGroq(
            model="openai/gpt-oss-120b",
            verbose=True,
            temperature=0.3,
            groq_api_key=settings.GROQ_API_KEY
        )

    @staticmethod
    def get_fallback_router_llm():
        """Primary: Ollama local, fallback: Google -> OpenRouter"""
        primary = LLMModels.get_ollama_llm()

        fallbacks=[
            LLMModels.get_google_llm(),
            LLMModels.get_openrouter_llm()
        ]
        return primary.with_fallbacks(fallbacks)