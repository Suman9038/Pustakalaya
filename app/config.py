from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    DATABASE_URL: str
    ALEMBIC_DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int 
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379   
    RESEND_API_KEY:str
    # EMAIL_FROM:str
    VERIFICATION_URL:str
    REDIS_URL:str
    MAIL_USERNAME:str
    MAIL_PASSWORD:str
    MAIL_FROM:str
    MAIL_PORT:int
    MAIL_SERVER:str
    MAIL_FROM_NAME:str
    MAIL_STARTTLS:bool = True
    MAIL_SSL_TLS:bool = False

    PROJECT_ID:str
    APPWRITE_API_KEY:str
    APPWRITE_ENDPOINT:str
    APPWRITE_BUCKET_ID:str

    QDRANT_HOST:str
    QDRANT_PORT:int
    QDRANT_COLLECTION:str

    GOOGLE_API_KEY:str
    HUGGINGFACEHUB_ACCESS_TOKEN:str
    OPENROUTER_API_KEY:str
    GROQ_API_KEY:str
    CVOICE_API_KEY:str

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        extra="ignore"
    )

settings = Settings()

broker_url = settings.REDIS_URL
result_backend = settings.REDIS_URL
