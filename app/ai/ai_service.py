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

        docs = await retriever.ainvoke(
            f"Comprehensive summary, core themes, key takeaways, chapter outlines, and conclusions of {book.title} by {book.author}"
        )

        context = "\n\n".join(
            doc.page_content
            for doc in docs
        )

        llm = self.llm.get_fallback_router_llm()

        prompt = f"""You are an expert literary analyst and executive book summarizer.
Analyze the following book excerpts from '{book.title}' by {book.author}.

Generate:
1. "summary": A coherent, engaging executive summary (strictly maximum 400 characters) synthesizing the central thesis in clear language.
2. "key_takeaways": Exactly 5 actionable, deeply insightful key takeaways.

Return ONLY a valid JSON object without surrounding markdown blocks:
{{
    "summary": "Summary here...",
    "key_takeaways": [
        "Takeaway 1...",
        "Takeaway 2...",
        "Takeaway 3...",
        "Takeaway 4...",
        "Takeaway 5..."
    ]
}}

Book Context:
{context}
"""

        response = await llm.ainvoke(prompt)
        content = response.content.strip()

        start_idx = content.find('{')
        end_idx = content.rfind('}')
        if start_idx != -1 and end_idx != -1:
            clean_json = content[start_idx:end_idx + 1]
        else:
            clean_json = content.replace("```json", "").replace("```", "").strip()

        insights = json.loads(clean_json)
        book.summary = str(insights.get("summary", ""))[:400]
        book.key_takeaways = insights.get("key_takeaways", [])

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
        

