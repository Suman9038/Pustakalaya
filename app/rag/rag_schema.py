from pydantic import BaseModel
from typing import List
from uuid import UUID
from datetime import datetime



class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class ConversationResponse(BaseModel):
    id: UUID
    book_id:UUID
    title: str | None
    messages: List[MessageResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class AskQuestionRequestSchema(BaseModel):
    question: str


