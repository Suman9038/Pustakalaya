from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, DateTime, UUID, ForeignKey,Boolean, CheckConstraint, Float, UniqueConstraint
from .database import Base
from datetime import datetime
import uuid
from enum import Enum
from sqlalchemy import Enum as SqlEnum

class UserRole(str,Enum):
    USER = "user"
    ADMIN = "admin"

class Book(Base):
    __tablename__ = "books"
    book_id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    title = Column(String, nullable=False, index=True)
    author = Column(String, nullable=False, index=True)
    publisher = Column(String, nullable=False)
    publisher_date = Column(DateTime, nullable=False)
    language = Column(String, nullable=False)
    number_of_pages = Column(Integer, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="books")
    reviews = relationship("Review", back_populates="book", lazy="selectin")
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def __repr__(self):
        return f"Book(id={self.book_id}, title={self.title}, author={self.author}, publisher={self.publisher}, publisher_date={self.publisher_date}, language={self.language}, number_of_pages={self.number_of_pages})"

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(SqlEnum(UserRole,values_callable=lambda obj:[e.value for e in obj], name="user_role"), default=UserRole.USER, nullable=False, server_default=UserRole.USER.value)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    books = relationship(
    "Book",
    back_populates="user",
    lazy="selectin"
    )
    reviews = relationship(
    "Review",
    back_populates="user",
    lazy="selectin"
    )

    def __repr__(self):
        return f"User(id={self.id}, username={self.username}, email={self.email}, fullname={self.first_name + ' ' + self.last_name}, is_verified={self.is_verified})"


class Review(Base):
    __tablename__ = "reviews"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    rating = Column(Float, CheckConstraint("rating >= 1 and rating <= 5", name="valid_rating_range"), nullable=True)
    comment = Column(String, nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="reviews")
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.book_id"), nullable=False)
    book = relationship("Book", back_populates="reviews")
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "book_id",
            name="unique_user_book_review"
        ),
    )

    def __repr__(self):
        return f"Review(id={self.id}, rating={self.rating}, comment={self.comment}, user_id={self.user_id}, book_id={self.book_id})"
