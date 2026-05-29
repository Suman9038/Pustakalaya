from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db
from typing import List
from . import schemas, models
from sqlalchemy import select
from app.auth.dependencies import AccessTokenBearer,RoleChecker, BookOwnerOrAdmin
from app.auth.auth_models import UserRole

router = APIRouter(prefix="/books", tags=["Books Route"])
access_token_bearer = AccessTokenBearer()
allow_admin = RoleChecker([UserRole.ADMIN])
allow_admin_or_user = RoleChecker([UserRole.ADMIN, UserRole.USER])
book_owner_or_admin = BookOwnerOrAdmin()

@router.get("/",response_model=List[schemas.BookSchema])
async def get_all_books(db: AsyncSession = Depends(get_db), token_details= Depends(access_token_bearer), _:bool= Depends(allow_admin_or_user)):
    try :
        # print(current_user)
        result = await db.execute(select(models.Book).order_by(models.Book.created_at.desc()))
        books = result.scalars().all()
        if not books:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No books found")
        return books
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{book_id}", response_model=schemas.BookSchema)
async def get_book(book_id: str, db: AsyncSession = Depends(get_db), token_details = Depends(access_token_bearer), _:bool= Depends(allow_admin_or_user)):
    try:
        owner_id= token_details.get("user")["id"]
        result = await db.execute(select(models.Book).where(models.Book.book_id == book_id, models.Book.owner_id == owner_id))
        book = result.scalars().first()
        if not book:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
        return book
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/create", response_model=schemas.BookSchema, status_code=status.HTTP_201_CREATED)
async def create_book(book_data: schemas.BookCreateSchema, db: AsyncSession = Depends(get_db), token_details = Depends(access_token_bearer), _:bool= Depends(allow_admin_or_user)):
    try:
        owner_id= token_details.get("user")["id"]
        new_book = models.Book(**book_data.model_dump(),owner_id = owner_id)
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
        uploaded_by=token_details.get("user")["username"],
        created_at=new_book.created_at,
        updated_at=new_book.updated_at
    )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/user/{owner_id}",response_model=List[schemas.BookSchema])
async def get_user_books(owner_id: str, db: AsyncSession = Depends(get_db), token_details= Depends(access_token_bearer), _:bool= Depends(allow_admin_or_user)):
    try :
        result = await db.execute(select(models.Book).where(models.Book.owner_id == owner_id).order_by(models.Book.created_at.desc()))
        books = result.scalars().all()
        if not books:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No books found")
        return books
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))



@router.put("/{book_id}/update", response_model=schemas.BookSchema, status_code=status.HTTP_200_OK)
async def update_book(book_id: str, book_data: schemas.BookUpdateSchema, db: AsyncSession = Depends(get_db), token_details = Depends(access_token_bearer), book:models.Book = Depends(book_owner_or_admin)):
    try:
        # owner_id= token_details.get("user")["id"]
        # result = await db.execute(select(models.Book).where(models.Book.book_id == book_id, models.Book.owner_id == owner_id))
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
async def delete_book(book_id: str, db: AsyncSession = Depends(get_db), token_details = Depends(access_token_bearer), book: models.Book= Depends(book_owner_or_admin)):
    try:
        # result = await db.execute(select(models.Book).where(models.Book.book_id == book_id, models.Book.owner_id == owner_id))
        # book = result.scalars().first()
        # if not book:
        #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
        await db.delete(book)
        await db.commit()
        return f"Book with ID {book_id} deleted successfully"
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

