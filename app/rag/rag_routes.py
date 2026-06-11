from fastapi import (
    APIRouter,
    status,
    Depends
)
from app.rag.service import RagService
from app.auth.dependencies import get_current_user
from app.database import get_db
from app.rag.rag_schema import (
    AskQuestionRequestSchema,
    ConversationResponse,
    MessageResponse
)
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse
from app.models import User


rag_service = RagService()
router = APIRouter(prefix="/chat",tags=["RAG Routes"])

@router.post("/book/{book_id}", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_chats(
    book_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create new conversation for a book
    """
    user_id = current_user.id
    return await rag_service.create_conversation(user_id=user_id, book_id=book_id, db=db)


@router.get("/book/{book_id}", response_model=list[ConversationResponse], status_code=status.HTTP_200_OK)
async def get_user_conversation(book_id:UUID, db:AsyncSession= Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Get all conversation for a book
    """
    return await rag_service.get_user_conversation(
        user_id=current_user.id,
        book_id=book_id,
        db=db
    )

@router.post("/ask/{conversation_id}", status_code= status.HTTP_200_OK)
async def ask_question(
    payload: AskQuestionRequestSchema,
    conversation_id:UUID,
    current_user: User = Depends(get_current_user),
    db:AsyncSession= Depends(get_db)
):
    """
    Ask question to the book it is non streamed
    """
    return await rag_service.ask_question(
        conversation_id=conversation_id,
        user_id=current_user.id,
        question=payload.question,
        db=db
    )


@router.post("/ask/stream/{conversation_id}", status_code= status.HTTP_200_OK)
async def ask_question_streaming(
    payload: AskQuestionRequestSchema,
    conversation_id:UUID,
    current_user: User = Depends(get_current_user),
    db:AsyncSession= Depends(get_db)
):
    """
    Ask question to the book it is streamed
    """
    generator = rag_service.ask_question_streaming(
        conversation_id=conversation_id,
        user_id=current_user.id,
        question=payload.question,
        db=db
    )

    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/history/{conversation_id}", response_model=list[MessageResponse])
async def get_chat_history(
    conversation_id:UUID,
    current_user: User = Depends(get_current_user),
    db:AsyncSession= Depends(get_db)
):
    """
    Get chat history for a conversation
    """
    return await rag_service.get_messages(
        conversation_id=conversation_id,
        user_id=current_user.id,
        db=db
    )

@router.delete(
    "/{conversation_id}",
    status_code=status.HTTP_200_OK
)
async def delete_conversation(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await rag_service.delete_conversation(
        conversation_id=conversation_id,
        user_id=current_user.id,
        db=db
    )