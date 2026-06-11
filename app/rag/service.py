from langchain_core.messages import HumanMessage, AIMessage
from app.models import Conversation, Message,Book
from app.rag.vector_store import QdrantService
from app.rag.llm import LLMModels
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from sqlalchemy import select
from app.errors import (BookNotFound)
from app.rag.chains import RagChain
from app.models import User


class RagService:
    def __init__(self):
        self.qdrant_service = QdrantService()
        self.llm = LLMModels()

    
    async def create_conversation(self, user_id:UUID, book_id:UUID, db:AsyncSession):
        result = await db.execute(select(Book).where(Book.book_id == book_id))
        book = result.scalar_one_or_none()
        if not book:
            raise BookNotFound()

        conversation = Conversation(
            user_id= user_id,
            book_id= book_id,
            title= None
        )

        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)
        return conversation
        
    async def get_user_conversation(self, user_id:UUID, book_id:UUID, db:AsyncSession):
        result = await db.execute(select(Conversation).where(
            Conversation.user_id == user_id, 
            Conversation.book_id == book_id 
        ).order_by(Conversation.created_at.desc()))

        return result.scalars().all()

    async def _get_conversation(self, conversation_id:UUID, user_id:UUID, db:AsyncSession):
        result = await db.execute(select(Conversation).where(
            Conversation.user_id == user_id,
            Conversation.id == conversation_id
        ))
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail= "Conversation Not Found"
            )
        return conversation

    async def get_chat_history(self, conversation_id:UUID, user_id:UUID, db:AsyncSession, verify_ownership: bool = True):
        if verify_ownership:
            await self._get_conversation(conversation_id, user_id, db)
        result = await db.execute(select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).limit(10))

        messages = list(result.scalars().all())

        history = []

        for msg in messages:
            if msg.role == "user":
                history.append(HumanMessage(content=msg.content))
            else:
                history.append(AIMessage(content=msg.content))

        return history

    async def get_messages(
    self,
    conversation_id: UUID,
    user_id: UUID,
    db: AsyncSession,
    ):
        await self._get_conversation(
                conversation_id,
                user_id,
                db
            )

        result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )

        return result.scalars().all()

    async def save_message(self, db: AsyncSession, conversation_id: UUID,question: str,answer: str):
        try:
            user_message = Message(
                conversation_id= conversation_id,
                role="user",
                content=question
            )

            ai_message= Message(
                conversation_id= conversation_id,
                role="assistant",
                content= answer
            )

            db.add(user_message)
            db.add(ai_message)
            await db.commit()
        except Exception:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save message"
            )
    
    async def delete_conversation(
    self,
    conversation_id: UUID,
    user_id: UUID,
    db: AsyncSession
    ):
        conversation = await self._get_conversation(
            conversation_id,
            user_id,
            db
        )

        await db.delete(conversation)
        await db.commit()

        return {
            "message": "Conversation deleted successfully"
        }

    async def ask_question(self, conversation_id:UUID, user_id:UUID, question:str, db:AsyncSession):

        # Fetch the convo
        try:
            conversation = await(
                self._get_conversation(
                    conversation_id,
                    user_id,
                    db
                )
            )
            
            if not conversation.title:
                conversation.title = question[:80].strip()
                await db.commit()
                await db.refresh(conversation)
                
            chat_history = await(
                self.get_chat_history(
                    conversation_id,
                    user_id,
                    db,
                    verify_ownership=False
                )
            )
            retriever = self.qdrant_service.get_book_retriever(
                conversation.book_id
            )
            llm = self.llm.get_fallback_router_llm()
            rag_chain = (
                RagChain.build_chain(
                    llm,retriever
                )
            )
            # Used ainvoke() function to make it asynchrounous as invoke() is synchrounous
            response = await rag_chain.ainvoke(
                {
                    "input": question,
                    "chat_history": chat_history
                }
            )

            answer = response.get(
                "answer",
                "No response generated."
            )

            await self.save_message(
                db,
                conversation_id,
                question,
                answer
            )

            return {
                "answer": answer
            }
        except HTTPException:
            raise
        except Exception as e:
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail= f"Unable to generate response {str(e)}"
            )

    async def ask_question_streaming(self, conversation_id:UUID, user_id:UUID, question:str, db:AsyncSession):
        full_answer= ""
        
        conversation = await(
            self._get_conversation(
                conversation_id,
                user_id,
                db
            )
        )

        if not conversation.title:
            conversation.title = question[:80].strip()
            await db.commit()
            await db.refresh(conversation)

        chat_history = await(
            self.get_chat_history(
                conversation_id,
                user_id,
                db,
                verify_ownership=False
            )
        )
        
        retriever = self.qdrant_service.get_book_retriever(
            conversation.book_id
        )
        
        llm = self.llm.get_fallback_router_llm()

        rag_chain = (
            RagChain.build_chain(
                llm,retriever
            )
        )

        try:
        # streaming using astream
            async for chunk in rag_chain.astream(
                {
                    "input": question,
                    "chat_history": chat_history
                }
            ):
                print(chunk)
                if "answer" in chunk:
                    token= chunk["answer"]
                    if token:
                        full_answer+=token
                        
                        yield f"data: {token}\n\n"
            
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"
            yield "data: [DONE]\n\n"
            raise e
            
        finally:
            if full_answer:
                await self.save_message(
                    db,
                    conversation_id,
                    question,
                    full_answer
                )
            
                