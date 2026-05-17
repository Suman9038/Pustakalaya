from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class BookSchema(BaseModel):
    book_id: UUID
    title: str
    author: str
    publisher: str
    publisher_date: datetime
    language: str
    number_of_pages: int
    created_at: datetime
    updated_at: datetime

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
    
