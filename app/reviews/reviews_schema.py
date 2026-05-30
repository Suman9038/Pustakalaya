from pydantic import BaseModel,Field, UUID4
from datetime import datetime



class ReviewCreateSchema(BaseModel):
    rating:float = Field(...,ge=1,le=5,description="Rating must be between 1 and 5",example=4.5)
    comment:str = Field(...,min_length=10,max_length=250,description="Comment must be between 10 and 250 characters",example="This is a great book!")



class ReviewResponseSchema(BaseModel):
    id: UUID4
    book_id: UUID4
    user_id: UUID4
    rating:float = Field( description="Rating given by the user")
    comment:str = Field( description="Comment given by the user")
    created_at:datetime 
    updated_at:datetime 

    class Config:
        from_attributes = True

class ReviewSchemaInBook(BaseModel):
    id: UUID4
    rating:float
    comment:str
    username: str = Field(description="Username of the user who added the review")

    class Config:
        from_attributes = True

class UserReviewSchema(BaseModel):
    id: UUID4
    rating: float
    comment: str
    book_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

    

        