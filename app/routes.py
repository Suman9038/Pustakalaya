from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db
from typing import List
from . import schemas, models
from sqlalchemy import select
from app.auth.dependencies import AccessTokenBearer

router = APIRouter(prefix="/books", tags=["Books Route"])
access_token_bearer = AccessTokenBearer()

@router.get("/",response_model=List[schemas.BookSchema])
async def get_all_books(db: AsyncSession = Depends(get_db), current_user= Depends(access_token_bearer)):
    try :
        print(current_user)
        result = await db.execute(select(models.Book).order_by(models.Book.created_at.desc()))
        books = result.scalars().all()
        if not books:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No books found")
        return books
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{book_id}", response_model=schemas.BookSchema)
async def get_book(book_id: str, db: AsyncSession = Depends(get_db), current_user = Depends(access_token_bearer)):
    try:
        result = await db.execute(select(models.Book).where(models.Book.book_id == book_id))
        book = result.scalars().first()
        if not book:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
        return book
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/create", response_model=schemas.BookSchema, status_code=status.HTTP_201_CREATED)
async def create_book(book_data: schemas.BookCreateSchema, db: AsyncSession = Depends(get_db), current_user = Depends(access_token_bearer)):
    try:
        new_book = models.Book(**book_data.model_dump())
        db.add(new_book)
        await db.commit()
        await db.refresh(new_book)
        return new_book
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{book_id}/update", response_model=schemas.BookSchema, status_code=status.HTTP_200_OK)
async def update_book(book_id: str, book_data: schemas.BookUpdateSchema, db: AsyncSession = Depends(get_db),current_user = Depends(access_token_bearer)):
    try:
        result = await db.execute(select(models.Book).where(models.Book.book_id == book_id))
        book = result.scalars().first()
        if not book:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
        
        # Update book data
        for field, value in book_data.dict(exclude_unset=True).items():
            setattr(book, field, value)
        
        await db.commit()
        await db.refresh(book)
        return book
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{book_id}/delete", response_model=schemas.BookSchema, status_code=status.HTTP_200_OK)
async def delete_book(book_id: str, db: AsyncSession = Depends(get_db), current_user = Depends(access_token_bearer)):
    try:
        result = await db.execute(select(models.Book).where(models.Book.book_id == book_id))
        book = result.scalars().first()
        if not book:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
        await db.delete(book)
        await db.commit()
        return f"Book with ID {book_id} deleted successfully"
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

