from fastapi import APIRouter, Depends, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from .database import get_db
from typing import List
from . import schemas, models
from app.auth.dependencies import (
    AccessTokenBearer,
    RoleChecker, 
    BookOwnerOrAdmin, 
    get_current_user
)
from app.models import UserRole
from uuid import UUID
from app.books_service import BookService
from fastapi.responses import Response
from app.cloud_service import CloudService
from app.ai.ai_service import AIService
from app.ai.ai_schema import AIInsightResponse

router = APIRouter(prefix="/books", tags=["Books Route"])
access_token_bearer = AccessTokenBearer()
allow_admin = RoleChecker([UserRole.ADMIN])
allow_admin_or_user = RoleChecker([UserRole.ADMIN, UserRole.USER])
book_owner_or_admin = BookOwnerOrAdmin()
book_service = BookService()
ai_service = AIService()

@router.get("/",response_model=List[schemas.BookSchema], status_code=status.HTTP_200_OK)
async def get_all_books(db: AsyncSession = Depends(get_db), current_user: models.User= Depends(access_token_bearer), _:bool= Depends(allow_admin_or_user)):

    return await book_service.get_all_books(db, current_user)

@router.get("/search")
async def search_books(q:str, db:AsyncSession= Depends(get_db),current_user:models.User = Depends(get_current_user), _:bool= Depends(allow_admin_or_user)):
    return await book_service.search_book(q, db, current_user)

    
@router.get("/{book_id}", response_model=schemas.BookDetailSchema, status_code=status.HTTP_200_OK)
async def get_book(book_id: UUID, db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), _:bool= Depends(allow_admin_or_user)):
    return await book_service.get_book_by_id(book_id, db, current_user)

@router.post("/create", response_model=schemas.BookSchema, status_code=status.HTTP_201_CREATED)
async def create_book(book_data: schemas.BookCreateSchema=Depends(schemas.BookCreateSchema.as_form),file:UploadFile= File(...), db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), _:bool= Depends(allow_admin_or_user)):
    return await book_service.create_book(book_data,file, current_user, db)


@router.get("/user/{user_id}",response_model=List[schemas.BookSchema])
async def get_user_books(user_id: UUID, db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), _:bool= Depends(allow_admin_or_user)):
    return await book_service.get_user_books(user_id, db, current_user)


@router.put("/{book_id}/update", response_model=schemas.BookSchema, status_code=status.HTTP_200_OK)
async def update_book(book_id: UUID, book_data: schemas.BookUpdateSchema,file:UploadFile= File(None), db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), book:models.Book = Depends(book_owner_or_admin)):
    return await book_service.update_book(book_id, book_data, file, db, current_user, book)

@router.delete("/{book_id}/delete", status_code=status.HTTP_200_OK)
async def delete_book(book_id: UUID, db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), book: models.Book= Depends(book_owner_or_admin)):
    return await book_service.delete_book(book_id, db, current_user, book)

@router.get("/{book_id}/view", status_code=status.HTTP_200_OK)
async def get_file_view(book_id: UUID, db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), _:bool= Depends(allow_admin_or_user)):
    result = await book_service.get_file_view(book_id, db, current_user)
    return Response(
        content=result["file_bytes"],
        media_type=result["mime_type"],
    )

@router.get("/{book_id}/ai-insight", response_model=AIInsightResponse)
async def get_ai_insight(book_id: UUID, db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), _:bool= Depends(allow_admin_or_user)):
    return await ai_service.get_ai_insights(book_id, db, current_user)

@router.post("/{book_id}/ai-podcast/{lang}")
async def get_ai_podcast(book_id: UUID, lang:str, db: AsyncSession = Depends(get_db), current_user:models.User = Depends(get_current_user), _:bool= Depends(allow_admin_or_user)):
    return await ai_service.generate_summary_podcast(book_id, db, lang, current_user)

@router.post("/test-upload")
async def test_upload(
    file: UploadFile = File(...)
):
    response = CloudService.upload_file(file)

    return {
        "type": str(type(response)),
        "string": str(response),
        "dir": dir(response)
    }