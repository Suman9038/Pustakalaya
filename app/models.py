from sqlalchemy.orm import relationship
from sqlalchemy import (Column,
 Integer, String, DateTime, UUID, ForeignKey,Boolean, CheckConstraint, Float, UniqueConstraint, BigInteger,Index,Text,JSON)
from .database import Base
import uuid
from enum import Enum
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.sql import func

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
    summary = Column(Text, nullable=True)
    key_takeaways = Column(JSON, nullable=True)
    podcast_url_en = Column(String, nullable=True)
    podcast_url_hi = Column(String, nullable=True)
    podcast_generated_at = Column(DateTime(timezone=True), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="books")
    reviews = relationship("Review", back_populates="book", lazy="selectin",cascade="all, delete-orphan",passive_deletes=True   )
    file_id = Column(String, nullable=True)
    file_name = Column(String, nullable=True)
    file_size = Column(BigInteger, nullable=True)
    mime_type = Column(String, nullable=True)
    conversations = relationship(
    "Conversation",
    back_populates="book",
    cascade="all, delete-orphan"
    )
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

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
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
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
    conversations = relationship(
    "Conversation",
    back_populates="user",
    cascade="all, delete-orphan"
)

    def __repr__(self):
        return f"User(id={self.id}, username={self.username}, email={self.email}, fullname={self.first_name + ' ' + self.last_name}, is_verified={self.is_verified})"


class Review(Base):
    __tablename__ = "reviews"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    rating = Column(Float, CheckConstraint("rating >= 1 and rating <= 5", name="valid_rating_range"), nullable=False)
    comment = Column(String(250), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="reviews")
    book_id = Column(UUID(as_uuid=True), ForeignKey("books.book_id", ondelete="CASCADE"), nullable=False)
    book = relationship("Book", back_populates="reviews")
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "book_id",
            name="unique_user_book_review"
        ),
    )

    def __repr__(self):
        return f"Review(id={self.id}, rating={self.rating}, comment={self.comment}, user_id={self.user_id}, book_id={self.book_id})"

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )

    book_id = Column(
        UUID(as_uuid=True),
        ForeignKey("books.book_id", ondelete="CASCADE"),
        index=True
    )

    title = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    user= relationship("User", back_populates="conversations")
    
    book = relationship("Book", back_populates="conversations")

    messages= relationship("Message", back_populates="conversation", cascade="all, delete-orphan",lazy="selectin",passive_deletes=True)

    # Composite index for the most common query pattern
    __table_args__ = (
        Index("ix_conversation_user_book", "user_id", "book_id"),
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "conversations.id",
            ondelete="CASCADE"
        ),
        index=True
    )

    role = Column(String(50), nullable=False)

    content = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), default=func.now()) 
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    conversation = relationship("Conversation", back_populates="messages")

    # Composite index: conversation ke messages ko time order mein fetch karne ke liye
    __table_args__ = (
        Index("ix_message_convo_created", "conversation_id", "created_at"),
    )

    