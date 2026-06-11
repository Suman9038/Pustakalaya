from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.reviews.reviews_schema import ReviewResponseSchema,ReviewCreateSchema
from app.database import get_db
from app.models import User
from uuid import UUID
from app.auth.dependencies import get_current_user
from app.reviews.reviews_service import ReviewService


router = APIRouter(
    prefix="/books/reviews",
    tags=["Reviews"] 
)
review_service = ReviewService()

@router.post("/{book_id}/add-review", response_model=ReviewResponseSchema, status_code=status.HTTP_201_CREATED)
async def add_review(book_id:UUID, review:ReviewCreateSchema, db:AsyncSession=Depends(get_db), current_user:User = Depends(get_current_user)):
    return await review_service.add_review(book_id, review, db, current_user)
    

@router.delete("/{review_id}/delete-review", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(review_id:UUID, db:AsyncSession=Depends(get_db), current_user:User = Depends(get_current_user)):
    return await review_service.delete_review(review_id, db, current_user)

@router.get("/{review_id}/get-review", response_model=ReviewResponseSchema)
async def get_review(review_id:UUID, db:AsyncSession=Depends(get_db), current_user:User = Depends(get_current_user)):
    return await review_service.get_review(review_id, db, current_user)

@router.put("/{review_id}/update-review", response_model=ReviewResponseSchema)
async def update_review(review_id:UUID, review_data:ReviewCreateSchema, db:AsyncSession=Depends(get_db), current_user:User = Depends(get_current_user)):
    return await review_service.update_review(review_id, review_data, db, current_user)