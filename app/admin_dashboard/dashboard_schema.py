from pydantic import BaseModel
from datetime import datetime
from app.models import UserRole


class DashboardStatsResponse(BaseModel):
    total_users: int
    total_books: int
    total_reviews: int
    total_conversations: int
    total_messages: int


class RecentUserResponse(BaseModel):
    user_id: str
    email: str
    username: str
    is_verified: bool
    role: str = "user"
    created_at: datetime


class UpdateUserRoleRequest(BaseModel):
    role: UserRole


class RecentBookResponse(BaseModel):
    book_id: str
    title: str
    author: str
    created_at: datetime


class TopUserResponse(BaseModel):
    username: str
    message_count: int


class TopBookResponse(BaseModel):
    title: str
    conversation_count: int


class DashboardResponse(BaseModel):
    stats: DashboardStatsResponse
    recent_users: list[RecentUserResponse]
    recent_books: list[RecentBookResponse]
    top_users: list[TopUserResponse]
    top_books: list[TopBookResponse]
