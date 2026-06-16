from fastapi import HTTPException,status, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from . import schemas, models
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from uuid import UUID
from app.errors import (
    BookNotFound,
    PustakalayaException
)
from app.cloud_service import CloudService
from app.celery_client import index_book_task
from app.rag.vector_store import QdrantService

MAX_FILE_SIZE = 50 * 1024 * 1024 # 50MB in Bytes


class BookService:

    async def create_book(self,book_data: schemas.BookCreateSchema,file:UploadFile, current_user:models.User ,db:AsyncSession):
        uploaded_file = None
        try:
            # File type check 
            if file.content_type not in ["application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/epub+zip"]:
                raise HTTPException(
                    status_code= status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file type. Only PDF, DOCX, and EPUB files are allowed."
                ) 
            
            file_content = await file.read()

            if not file_content:
                raise HTTPException(
                    status_code= status.HTTP_400_BAD_REQUEST,
                    detail=f"Uploaded file is empty."
                )
            
            # File validation
            if len(file_content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code= status.HTTP_400_BAD_REQUEST,
                    detail=f"File size exceeds the limit of {MAX_FILE_SIZE/1024/1024} MB."
                )

            await file.seek(0) # Ye is liye hai taaki hum fir se file ko read kar sake isliye
            
            user_id= current_user.id
            username = current_user.username
            # Uploading the book in Appwrite
            uploaded_file = CloudService.upload_file(file)

            # Creating the book in Database
            new_book = models.Book(
            **book_data.model_dump(),
            user_id = user_id,
            file_id=uploaded_file["file_id"],
            file_name=uploaded_file["file_name"],
            file_size=uploaded_file["file_size"],
            mime_type=uploaded_file["mime_type"],
            )
            db.add(new_book)
            await db.commit()   
            await db.refresh(new_book)
            if new_book.file_id:
                index_book_task.delay(
                    book_id=str(new_book.book_id),
                    file_id=new_book.file_id,
                    title=new_book.title
                )

            return schemas.BookSchema(
            book_id=new_book.book_id,
            title=new_book.title,
            author=new_book.author,
            publisher=new_book.publisher,
            publisher_date=new_book.publisher_date,
            language=new_book.language,
            number_of_pages=new_book.number_of_pages,
            uploaded_by=username,
            file_id=new_book.file_id,
            file_name=new_book.file_name,
            file_size=new_book.file_size,
            mime_type=new_book.mime_type,
            created_at=new_book.created_at,
            updated_at=new_book.updated_at
        )
        except HTTPException:
            raise

        except Exception as e:
            await db.rollback()
            if uploaded_file:
                try:
                    CloudService.delete_file(uploaded_file.get('file_id'))
                except HTTPException:
                    pass
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create Book:{str(e)}")

    async def get_all_books(self,db:AsyncSession,current_user:models.User):
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
                file_id=book.file_id,
                file_name=book.file_name,
                file_size=book.file_size,
                mime_type=book.mime_type,
                created_at=book.created_at,
                updated_at=book.updated_at
            )
            for book in books
        ]
        except PustakalayaException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    async def get_book_by_id(self,book_id: UUID,db:AsyncSession,current_user:models.User):
        try:
            result = await db.execute(select(models.Book).options(selectinload(models.Book.reviews).selectinload(models.Review.user),selectinload(models.Book.user)).where(models.Book.book_id == book_id))
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


    async def get_user_books(self,user_id: str,db:AsyncSession,current_user:models.User):
        try:
            result = await db.execute(select(models.Book).options(selectinload(models.Book.user),selectinload(models.Book.reviews).selectinload(models.Review.user)).where(models.Book.user_id == user_id).order_by(models.Book.created_at.desc()))
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
        except PustakalayaException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    async def update_book(self,book_id: UUID,book_data: schemas.BookUpdateSchema, file: UploadFile | None, db:AsyncSession,current_user:models.User, book: models.Book):
        uploaded_file = None
        try:
            for field, value in book_data.model_dump(exclude_unset=True).items():
                setattr(book, field, value)
            old_file = book.file_id

            if file: 
                uploaded_file = CloudService.upload_file(file)
                book.file_id = uploaded_file["file_id"]
                book.file_name = uploaded_file["file_name"]
                book.file_size = uploaded_file["file_size"]
                book.mime_type = uploaded_file["mime_type"]

            await db.commit()
            await db.refresh(book)
            if file and old_file:
                CloudService.delete_file(old_file)
            return book
        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            if uploaded_file:
                try:
                    CloudService.delete_file(uploaded_file["file_id"])
                except HTTPException:
                    pass
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    async def delete_book(self,book_id: UUID,db:AsyncSession,current_user:models.User, book:models.Book):
        try:
            file_id = book.file_id
            if file_id:
                CloudService.delete_file(file_id)
            
            # Delete vectors from Qdrant cluster
            try:
                QdrantService().delete_book_vectors(book_id)
            except Exception as e:
                # We can log this, but we shouldn't stop the DB deletion if Qdrant is temporarily down
                print(f"Failed to delete book vectors from Qdrant: {str(e)}")

            await db.delete(book)
            await db.commit()
            return {"message": "Book deleted successfully"}
        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    async def get_file_view(self, book_id:UUID, db:AsyncSession, current_user:models.User):
        try:
            result = await db.execute(select(models.Book).where(models.Book.book_id == book_id))
            book = result.scalar_one_or_none()
            if not book:
                raise BookNotFound()
            if not book.file_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No file associated with this book."
                )
            file_bytes= CloudService.get_file_view(book.file_id)
            mime_type=book.mime_type
            return {
                'file_bytes': file_bytes,
                'mime_type': mime_type or "application/octet-stream"
            }
        except PustakalayaException:
            raise
        except Exception:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    async def search_book(self, search_query:str, db:AsyncSession, current_user:models.User):
        try:
            result = await db.execute(
                select(models.Book)
                .options(selectinload(models.Book.user))
                .where(
                    or_(
                        models.Book.title.ilike(f"%{search_query}%"),
                        models.Book.author.ilike(f"%{search_query}%"),
                        models.Book.publisher.ilike(f"%{search_query}%")
                    )
                )
                .order_by(models.Book.created_at.desc())
            )

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
        except PustakalayaException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    