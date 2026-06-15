from pydantic import BaseModel


class AIInsightResponse(BaseModel):
    summary: str
    key_takeaways: list[str]
