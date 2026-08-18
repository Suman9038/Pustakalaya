from fastapi import FastAPI
from contextlib import asynccontextmanager
from .database import engine, Base
from .models import Book
from .routes import router as book_routes
from app.rag.vector_store import QdrantService
from .auth.auth_routes import router as auth_routes
from .reviews.reviews_routes import router as reviews_routes
from .errors import register_exception_handlers
from app.middleware import register_middleware
from app.rag.rag_routes import router as rag_routes
from app.admin_dashboard.dashboard_routes import router as dashboard_routes

# Lifespan event ye batata hai ki FastAPI server ke start hone par
# aur stop hone par kaun sa code execute hoga.
# Start ke time par database connection test, table creation,
# model loading, etc. kiya ja sakta hai.
# Stop ke time par cleanup operations kiye ja sakte hain.
import subprocess

@asynccontextmanager
async def life_span(app: FastAPI):
    import threading
    print("Starting Celery worker in background...")
    celery_process = subprocess.Popen(["celery", "-A", "app.celery_client", "worker", "-P", "solo", "-l", "info"])

    def init_qdrant():
        try:
            print("Initializing Qdrant...")
            qdrant = QdrantService()
            qdrant.create_collection()
            print("Qdrant initialized.")
        except Exception as e:
            print(f"Qdrant initialization failed: {e}")

    # Run in background to prevent blocking Uvicorn startup (Render port timeout)
    threading.Thread(target=init_qdrant, daemon=True).start()

    yield                              
    await engine.dispose() 
    
    if celery_process:
        print("Stopping Celery worker...")
        celery_process.terminate()



app = FastAPI(lifespan=life_span)

from app.rag.embeddings import GetEmbeddingModels
# from fastapi import APIRouter

# router = APIRouter()

@app.get("/test-embedding")
def test_embedding():

    embedding_model = (
        GetEmbeddingModels()
        .get_hf_embedding_models()
    )

    vector = embedding_model.embed_query(
        "Hello"
    )

    return {
        "dimension": len(vector)
    }

register_exception_handlers(app)
register_middleware(app)
app.include_router(book_routes)
app.include_router(auth_routes)
app.include_router(reviews_routes)
app.include_router(rag_routes)
app.include_router(dashboard_routes)