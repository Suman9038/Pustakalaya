from fastapi import FastAPI
from contextlib import asynccontextmanager
from .database import engine, Base
from .models import Book
from .routes import router as book_routes
from .auth.auth_routes import router as auth_routes

# Lifespan event ye batata hai ki FastAPI server ke start hone par
# aur stop hone par kaun sa code execute hoga.
# Start ke time par database connection test, table creation,
# model loading, etc. kiya ja sakta hai.
# Stop ke time par cleanup operations kiye ja sakte hain.
@asynccontextmanager
async def life_span(app: FastAPI):
    print("Server is Starting...")
    # Yahan par startup codSe likkha ja skta hai 
    # Jaise ki database connection test karna, tables create karna, 
    # models ko load karna, etc. 
    # Toh maina database connection ka likha hai
    print("Starting database connection....")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    print("Closing all connections....")
    # Database session ko clean up karne ke liye
    await engine.dispose()
    print("Server has been Stopped..")



app = FastAPI()

app.include_router(book_routes)
app.include_router(auth_routes)