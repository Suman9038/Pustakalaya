from sqlalchemy import Column, UUID, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import uuid
from enum import Enum
from sqlalchemy import Enum as SqlEnum

class UserRole(str,Enum):
    USER = "user"
    ADMIN = "admin"


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
    back_populates="owner",
    lazy="selectin"
    )

    def __repr__(self):
        return f"User(id={self.id}, username={self.username}, email={self.email}, fullname={self.first_name + ' ' + self.last_name}, is_verified={self.is_verified})"
