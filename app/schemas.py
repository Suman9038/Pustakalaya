from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional,List
from app.reviews.reviews_schema import ReviewSchemaInBook
from fastapi import UploadFile, Form

class BookSchema(BaseModel):
    book_id: UUID
    title: str
    author: str
    publisher: str
    publisher_date: datetime
    language: str
    number_of_pages: int
    file_id: str | None = None
    file_name: str | None = None
    file_size: int | None = None
    mime_type: str | None = None
    uploaded_by: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BookDetailSchema(BookSchema):
    reviews: List[ReviewSchemaInBook] = Field(default_factory=list)
    class Config:
        from_attributes = True

class BookUpdateSchema(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    publisher_date: Optional[datetime] = None
    language: Optional[str] = None
    number_of_pages: Optional[int] = None

class BookCreateSchema(BaseModel):
    title: str 
    author: str 
    publisher: str 
    publisher_date: datetime 
    language: str 
    number_of_pages: int 

    @classmethod
    def as_form(
        cls,
        title: str = Form(...),
        author: str = Form(...),
        publisher: str = Form(...),
        publisher_date: datetime = Form(...),
        language: str = Form(...),
        number_of_pages: int = Form(...),
    ):
        return cls(
            title=title,
            author=author,
            publisher=publisher,
            publisher_date=publisher_date,
            language=language,
            number_of_pages=number_of_pages,
        )
    
