from app.models import Book,Review,User,UserRole
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.reviews.reviews_schema import ReviewCreateSchema
from sqlalchemy import select
from app.errors import BookNotFound,AlreadyReviewed,ReviewNotFound,InsufficentPermission
from fastapi import HTTPException,status

class ReviewService:
    async def add_review(self, book_id:UUID, review:ReviewCreateSchema, db:AsyncSession, current_user:User):
        try:
            book_obj = await db.execute(select(Book).where(Book.book_id == book_id))
            book = book_obj.scalar_one_or_none()
            if not book:
                raise BookNotFound()
            existing_review = await db.execute(
                select(Review).where(
                    Review.user_id == current_user.id,
                    Review.book_id == book.book_id
                )
            )

            if existing_review.scalar_one_or_none():
                raise AlreadyReviewed()

            review_data = review.model_dump()
            new_review = Review(
                **review_data,
                user_id = current_user.id,
                book_id = book.book_id
            )
            db.add(new_review)
            await db.commit()
            await db.refresh(new_review)
            return new_review

        except Exception as e:
            raise HTTPException(
                status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Oops... Something went wrong while adding review {str(e)}",
            )

    async def delete_review(self, review_id:UUID, db:AsyncSession, current_user:User):
        try:
            review_obj = await db.execute(select(Review).where(Review.id == review_id))
            review = review_obj.scalar_one_or_none()
            if not review:
                raise ReviewNotFound()
            if review.user_id != current_user.id:
                raise InsufficentPermission()
            await db.delete(review)
            await db.commit()
        except Exception as e:
            raise HTTPException(
                status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Oops... Something went wrong while deleting review {str(e)}",
            )
    
    async def get_review(self,review_id:UUID, db:AsyncSession, current_user:User):
        try:
            review_obj = await db.execute(select(Review).where(Review.id == review_id))
            review = review_obj.scalar_one_or_none()
            if not review:
                raise ReviewNotFound()
            return review
        except Exception as e:
            raise HTTPException(
                status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Oops... Something went wrong while getting review {str(e)}",
            )
    
    async def update_review(self,review_id:UUID, review_data:ReviewCreateSchema, db:AsyncSession, current_user:User):
        try:
            review_obj = await db.execute(select(Review).where(Review.id == review_id))
            review = review_obj.scalar_one_or_none()
            if not review:
                raise ReviewNotFound()
            if (
                current_user.role != UserRole.ADMIN
                and review.user_id != current_user.id
            ):
                raise InsufficentPermission()
            review.rating = review_data.rating
            review.comment = review_data.comment
            await db.commit()
            await db.refresh(review)
            return review
        except Exception as e:
            raise HTTPException(
                status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Oops... Something went wrong while updating review {str(e)}",
            )