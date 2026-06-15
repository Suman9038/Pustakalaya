from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Book
from app.errors import BookNotFound
from app.ai.ai_schema import AIInsightResponse
from app.rag.vector_store import QdrantService
from app.rag.llm import LLMModels
import json
from uuid import UUID
from fastapi import HTTPException, status
from deep_translator import GoogleTranslator
import httpx
from datetime import datetime,timezone
from app.config import settings

class AIService:
    def __init__(self):
        self.qdrant = QdrantService()
        self.llm = LLMModels()
        
    async def get_ai_insights(self, book_id:UUID, db:AsyncSession, current_user):
        result = await db.execute(select(Book).where(Book.book_id==book_id))
        book = result.scalar_one_or_none()
        if not book:
            raise BookNotFound()

        if book.summary and book.key_takeaways:
            return AIInsightResponse(
                summary=book.summary,
                key_takeaways=book.key_takeaways
            )

        retriever = self.qdrant.get_book_retriever(
            book.book_id
        )

        docs = await retriever.ainvoke("Summarize the entire book including all important topics")

        context = "\n\n".join(
            doc.page_content
            for doc in docs
        )

        llm = self.llm.get_fallback_router_llm()

        prompt = f"""
            You are an expert book analyst.

            Analyze the following book content.

            Return ONLY valid JSON.

            {{
                "summary": "Generate a strictly Maximum 400 characters Summary for the book with simple Language",
                "key_takeaways": [
                    "Takeaway1 must be insightful and practical",
                    "Takeaway2 must be insightful and practical",
                    "Takeaway3 must be insightful and practical",
                    "Takeaway4 must be insightful and practical",
                    "Takeaway5 must be insightful and practical"
                ]
            }}
            Book Context:
            
            {context}
            """

        response = await llm.ainvoke(prompt)

        content = response.content

        if "```json" in content:
            content = (
                content
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

        insights = json.loads(content)
        book.summary = insights["summary"]
        book.key_takeaways = insights["key_takeaways"]

        await db.commit()
        await db.refresh(book)

        return AIInsightResponse(
            summary=book.summary,
            key_takeaways=book.key_takeaways
        )

    async def generate_summary_podcast(self, book_id:UUID, db:AsyncSession, lang:str, current_user):
        result = await db.execute(select(Book).where(Book.book_id==book_id))
        book = result.scalar_one_or_none()
        if not book:
            raise BookNotFound()

        if not book.summary:
            raise HTTPException(
                status_code= status.HTTP_400_BAD_REQUEST,
                detail="Generate AI Insight First"
            )
        
        language = lang.lower()

        if language == "english" and book.podcast_url_en:
            return{
                "language": "en",
                "audio_url": book.podcast_url_en,
                "cached": True
            }

        if language == "hindi" and book.podcast_url_hi:
            return{
                "language": "hi",
                "audio_url": book.podcast_url_hi,
                "cached": True
            }
        text = book.summary

        if language == "hindi":
            text = GoogleTranslator(
                source="en",
                target="hi"
            ).translate(text)

        elif language != "english":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supported languages: english, hindi"
            )

        async with httpx.AsyncClient(
            timeout=120
        ) as client:
            response = await client.post(
                "https://cvoice.ai/api/tts",
                headers={
                    "Content-Type": "application/json",
                    "X-API-Key": settings.CVOICE_API_KEY
                },
                json={
                    'text': text,
                    'voice_id': "5ed587b3-01ca-4233-aea2-c73138df73a1"
                }
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to generate podcast"
                )

            data = response.json()
            audio_url = data["url"]

            if language == "english":
                book.podcast_url_en = audio_url
            elif language == "hindi":
                book.podcast_url_hi = audio_url

            book.podcast_generated_at = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(book)

            return {
                "audio_url": audio_url,
                "cached": False,
                "language": language
            }
        

