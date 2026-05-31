from app.errors import PustakalayaException
from app.models import Review
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db
from typing import List
from . import schemas, models
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.auth.dependencies import (
    AccessTokenBearer,
    RoleChecker, 
    BookOwnerOrAdmin, 
    get_current_user
)
from app.models import UserRole
from uuid import UUID
from app.errors import (
    BookNotFound
)

router = APIRouter(prefix="/books", tags=["Books Route"])
access_token_bearer = AccessTokenBearer()
allow_admin = RoleChecker([UserRole.ADMIN])
allow_admin_or_user = RoleChecker([UserRole.ADMIN, UserRole.USER])
book_owner_or_admin = BookOwnerOrAdmin()

@router.get("/",response_model=List[schemas.BookSchema], status_code=status.HTTP_200_OK)
async def get_all_books(db: AsyncSession = Depends(get_db), current_user= Depends(access_token_bearer), _:bool= Depends(allow_admin_or_user)):
    try :
        result = await db.execute(select(models.Book).options(selectinload(models.Book.user)).order_by(models.Book.created_at.desc()))
        books = result.scalars().all()
        if not books:
            raise BookNotFound()
        return [
        schemas.BookSchema(
            book_id=book.book_id,
            title=book.title,
            author=book.author,
            publisher=book.publisher,
            publisher_date=book.publisher_date,
            language=book.language,
            number_of_pages=book.number_of_pages,
            uploaded_by=book.user.username if book.user else None,
            created_at=book.created_at,
            updated_at=book.updated_at
        )
        for book in books
]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{book_id}", response_model=schemas.BookDetailSchema, status_code=status.HTTP_200_OK)
async def get_book(book_id: UUID, db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), _:bool= Depends(allow_admin_or_user)):
    try:
        result = await db.execute(select(models.Book).options(selectinload(models.Book.reviews).selectinload(Review.user),selectinload(models.Book.user)).where(models.Book.book_id == book_id))
        book = result.scalar_one_or_none()
        if not book:
            raise BookNotFound()
        return schemas.BookDetailSchema(
        book_id=book.book_id,
        title=book.title,
        author=book.author,
        publisher=book.publisher,
        publisher_date=book.publisher_date,
        language=book.language,
        number_of_pages=book.number_of_pages,
        uploaded_by=book.user.username if book.user else None,
        created_at=book.created_at,
        updated_at=book.updated_at,
        reviews=[
        schemas.ReviewSchemaInBook(
        id=review.id,
        rating=review.rating,
        comment=review.comment,
        username=review.user.username
    )
    for review in book.reviews
]
    )
    except PustakalayaException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/create", response_model=schemas.BookSchema, status_code=status.HTTP_201_CREATED)
async def create_book(book_data: schemas.BookCreateSchema, db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), _:bool= Depends(allow_admin_or_user)):
    try:
        user_id= current_user.id
        new_book = models.Book(**book_data.model_dump(),user_id = user_id)
        db.add(new_book)
        await db.commit()
        await db.refresh(new_book)
        return schemas.BookSchema(
        book_id=new_book.book_id,
        title=new_book.title,
        author=new_book.author,
        publisher=new_book.publisher,
        publisher_date=new_book.publisher_date,
        language=new_book.language,
        number_of_pages=new_book.number_of_pages,
        uploaded_by=current_user.username,
        created_at=new_book.created_at,
        updated_at=new_book.updated_at
    )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/user/{user_id}",response_model=List[schemas.BookSchema])
async def get_user_books(user_id: str, db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), _:bool= Depends(allow_admin_or_user)):
    try :
        result = await db.execute(select(models.Book).where(models.Book.user_id == user_id).order_by(models.Book.created_at.desc()))
        books = result.scalars().all()
        if not books:
            raise BookNotFound()
        return books
    except PustakalayaException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))



@router.put("/{book_id}/update", response_model=schemas.BookSchema, status_code=status.HTTP_200_OK)
async def update_book(book_id: str, book_data: schemas.BookUpdateSchema, db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), book:models.Book = Depends(book_owner_or_admin)):
    try:
        # user_id= token_details.get("user")["id"]
        # result = await db.execute(select(models.Book).where(models.Book.book_id == book_id, models.Book.user_id == user_id))
        # book = result.scalars().first()
        # if not book:
        #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
        
        # Update book data
        for field, value in book_data.model_dump(exclude_unset=True).items():
            setattr(book, field, value)
        
        await db.commit()
        await db.refresh(book)
        return book
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{book_id}/delete", response_model=schemas.BookSchema, status_code=status.HTTP_200_OK)
async def delete_book(book_id: str, db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), book: models.Book= Depends(book_owner_or_admin)):
    try:
        # result = await db.execute(select(models.Book).where(models.Book.book_id == book_id, models.Book.user_id == user_id))
        # book = result.scalars().first()
        # if not book:
        #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
        await db.delete(book)
        await db.commit()
        return f"Book with ID {book_id} deleted successfully"
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

