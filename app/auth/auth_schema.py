from enum import Enum
from pydantic import BaseModel, EmailStr, Field
import uuid
from app.models import UserRole
from typing import List
from app.schemas import BookSchema
from app.reviews.reviews_schema import UserReviewSchema

class UserCreateSchema(BaseModel):
    username: str = Field(..., description="Enter Username")
    email: EmailStr = Field(..., description="Enter Email")
    password: str = Field(..., description="Enter Password")
    first_name: str = Field(..., description="Enter First Name")
    last_name: str = Field(..., description="Enter Last Name")

class UserResponseSchema(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    is_verified: bool


    class Config:
        from_attributes = True

class UserLoginSchema(BaseModel):
    email: EmailStr = Field(..., description="Enter Email")
    password: str = Field(..., description="Enter Password")

class TokenSchema(BaseModel):
    message: str
    access_token: str | None = None
    token_type: str = "bearer"
    refresh_token: str | None = None
    token_refresh_success: bool | None = None

class CurrentUserResponseSchema(UserResponseSchema):
    books: List[BookSchema] = Field(default_factory=list)
    reviews: List[UserReviewSchema] = Field(default_factory=list)