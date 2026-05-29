from enum import Enum
from pydantic import BaseModel, EmailStr, Field
import uuid
from app.auth.auth_models import UserRole
from typing import List
from app.schemas import BookSchema

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
    books: List[BookSchema]