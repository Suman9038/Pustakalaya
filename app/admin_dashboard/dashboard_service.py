import logging
from uuid import UUID
from fastapi import HTTPException
from app.errors import UserNotExists
from app.models import (
    User,
    Book,
    Review,
    Conversation,
    Message,
    UserRole
)
from sqlalchemy import select,func,desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.admin_dashboard.dashboard_schema import (
    DashboardStatsResponse,
    RecentUserResponse,
    RecentBookResponse,
    TopUserResponse,
    TopBookResponse,
    DashboardResponse
)

logger = logging.getLogger(__name__)


class DashboardService:
    async def get_dashboard(self, db:AsyncSession):
        total_users = await db.scalar(select(func.count(User.id)).where(User.role==UserRole.USER))
        total_books = await db.scalar(select(func.count(Book.book_id)))
        total_reviews = await db.scalar(select(func.count(Review.id)))
        total_conversations = await db.scalar(select(func.count(Conversation.id)))
        total_messages = await db.scalar(select(func.count(Message.id)))

        return DashboardStatsResponse(
            total_users=total_users or 0,
            total_books=total_books or 0,
            total_reviews=total_reviews or 0,
            total_conversations=total_conversations or 0,
            total_messages=total_messages or 0,
        ) 

    async def get_recent_users(self, db:AsyncSession,limit:int=10):
        result= await db.execute(select(User).order_by(User.created_at.desc()).limit(limit))
        users = result.scalars().all()

        return [
            RecentUserResponse(
                user_id=str(user.id),
                email=user.email,
                username=user.username,
                is_verified=user.is_verified,
                role=user.role.value if hasattr(user.role, "value") else str(user.role),
                created_at=user.created_at
            )
            for user in users
        ]

    async def update_user_role(
        self,
        user_id: UUID,
        new_role: UserRole,
        db: AsyncSession,
        current_admin: User
    ):
        result = await db.execute(select(User).where(User.id == user_id))
        target_user = result.scalar_one_or_none()
        if not target_user:
            raise UserNotExists()

        if str(target_user.id) == str(current_admin.id) and new_role != UserRole.ADMIN:
            raise HTTPException(
                status_code=400,
                detail="You cannot remove your own admin privileges."
            )

        target_user.role = new_role
        await db.commit()
        await db.refresh(target_user)

        return RecentUserResponse(
            user_id=str(target_user.id),
            email=target_user.email,
            username=target_user.username,
            is_verified=target_user.is_verified,
            role=target_user.role.value if hasattr(target_user.role, "value") else str(target_user.role),
            created_at=target_user.created_at
        )

    async def delete_user(
        self,
        user_id: UUID,
        db: AsyncSession,
        current_admin: User
    ):
        result = await db.execute(select(User).where(User.id == user_id))
        target_user = result.scalar_one_or_none()
        if not target_user:
            raise UserNotExists()

        if str(target_user.id) == str(current_admin.id):
            raise HTTPException(
                status_code=400,
                detail="You cannot delete your own admin account."
            )

        # 1. Fetch user's books to cascade Appwrite and Qdrant cleanup
        books_result = await db.execute(select(Book).where(Book.user_id == target_user.id))
        user_books = books_result.scalars().all()

        for book in user_books:
            if book.file_id:
                try:
                    from app.cloud_service import CloudService
                    CloudService.delete_file(book.file_id)
                except Exception as e:
                    logger.error(f"Failed to delete cloud file for book {book.book_id}: {e}")

            try:
                from app.rag.vector_store import QdrantService
                QdrantService().delete_book_vectors(book.book_id)
            except Exception as e:
                logger.error(f"Failed to delete vectors for book {book.book_id}: {e}")

            await db.delete(book)

        # 2. Delete all reviews written by this user
        user_reviews = await db.execute(select(Review).where(Review.user_id == target_user.id))
        for review in user_reviews.scalars().all():
            await db.delete(review)

        # 3. Delete all conversations created by this user
        user_convos = await db.execute(select(Conversation).where(Conversation.user_id == target_user.id))
        for convo in user_convos.scalars().all():
            await db.delete(convo)

        # 4. Delete the target user
        await db.delete(target_user)
        await db.commit()

        return {
            "message": f"User @{target_user.username} deleted successfully",
            "deleted_user_id": str(target_user.id),
            "deleted_books_count": len(user_books)
        }
    async def get_recent_books(self, db:AsyncSession,limit:int=10):
        result= await db.execute(select(Book).order_by(Book.created_at.desc()).limit(limit))
        books = result.scalars().all()

        return [
            RecentBookResponse(
                book_id=str(book.book_id),
                title=book.title,
                author=book.author,
                created_at=book.created_at
            )
            for book in books
        ]
    
    async def get_top_users(
        self,
        db: AsyncSession,
        limit: int = 10
    ):

        result = await db.execute(
            select(
                User.username,
                func.count(Message.id).label(
                    "message_count"
                )
            )
            .join(
                Conversation,
                Conversation.user_id == User.id
            )
            .join(
                Message,
                Message.conversation_id == Conversation.id
            )
            .group_by(
                User.id,
                User.username
            )
            .order_by(
                desc("message_count")
            )
            .limit(limit)
        )

        rows = result.all()

        return [
            TopUserResponse(
                username=row.username,
                message_count=row.message_count
            )
            for row in rows
        ]
    
    async def get_top_books(
        self,
        db: AsyncSession,
        limit: int = 10
    ):

        result = await db.execute(
            select(
                Book.title,
                func.count(
                    Conversation.id
                ).label(
                    "conversation_count"
                )
            )
            .join(
                Conversation,
                Conversation.book_id == Book.book_id
            )
            .group_by(
                Book.book_id,
                Book.title
            )
            .order_by(
                desc("conversation_count")
            )
            .limit(limit)
        )

        rows = result.all()

        return [
            TopBookResponse(
                title=row.title,
                conversation_count=row.conversation_count
            )
            for row in rows
        ]
    
    async def get_dashboard_overview(
    self,
    db: AsyncSession
    ):
        stats = await self.get_dashboard(db)

        recent_users = await self.get_recent_users(db)

        recent_books = await self.get_recent_books(db)

        top_users = await self.get_top_users(db)

        top_books = await self.get_top_books(db)

        return DashboardResponse(
            stats=stats,
            recent_users=recent_users,
            recent_books=recent_books,
            top_users=top_users,
            top_books=top_books
        )

        
    