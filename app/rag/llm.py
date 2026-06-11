from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEndpoint,HuggingFacePipeline
from langchain_openrouter import ChatOpenRouter
from langchain_groq import ChatGroq
from app.config import settings
from dotenv import load_dotenv
load_dotenv()

class LLMModels:
    @staticmethod
    def get_google_llm():
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-flash-latest",
            verbose=True,
            temperature=0.7,
            google_api_key=settings.GOOGLE_API_KEY
        )
    @staticmethod
    def get_hf_llm():
        return HuggingFaceEndpoint(
            repo_id="Qwen/Qwen2.5-1.5B-Instruct",
            task="text-generation",
            verbose=True,
            temperature=0.7,
            huggingfacehub_api_token=settings.HUGGINGFACEHUB_ACCESS_TOKEN
        )
    @staticmethod
    def get_hf_local_llm():
        return HuggingFacePipeline.from_model_id(
            model_id="Qwen/Qwen2.5-0.5B-Instruct",
            task="text-generation",
            pipeline_kwargs=dict(
                temperature=0.5,
                max_new_tokens=100,
            )
        )

    @staticmethod
    def get_openrouter_llm():
        return ChatOpenRouter(
            model="google/gemma-4-31b-it:free",
            verbose=True,
            temperature=0.7,
            openrouter_api_key=settings.OPENROUTER_API_KEY
        )

    @staticmethod
    def get_groq_llm():
        return ChatGroq(
            model="groq/compound",
            verbose=True,
            temperature=0.3,
            groq_api_key=settings.GROQ_API_KEY
        )

    @staticmethod
    def get_fallback_router_llm():
        primary = LLMModels.get_groq_llm()

        fallbacks=[
            LLMModels.get_google_llm(),
            LLMModels.get_hf_llm(),
            LLMModels.get_openrouter_llm()
        ]
        return primary.with_fallbacks(fallbacks)
