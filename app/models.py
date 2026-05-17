from sqlalchemy import Column, Integer, String, DateTime, UUID
from .database import Base
import uuid
from datetime import datetime

class Book(Base):
    __tablename__ = "books"
    book_id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    title = Column(String, nullable=False, index=True)
    author = Column(String, nullable=False, index=True)
    publisher = Column(String, nullable=False)
    publisher_date = Column(DateTime, nullable=False)
    language = Column(String, nullable=False)
    number_of_pages = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def __repr__(self):
        return f"Book(id={self.book_id}, title={self.title}, author={self.author}, publisher={self.publisher}, publisher_date={self.publisher_date}, language={self.language}, number_of_pages={self.number_of_pages})"