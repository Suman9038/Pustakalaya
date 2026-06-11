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

from app.auth.dependencies import RoleChecker

role_checker = RoleChecker(UserRole.ADMIN)


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
                created_at=user.created_at
            )
            for user in users
        ]
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

        
    