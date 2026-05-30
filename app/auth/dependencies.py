from app.models import User
from sqlalchemy import select
from fastapi import Depends
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from fastapi import Request, HTTPException, status
from app.auth.utils import decode_jwt
from app.redis_service import token_in_blocklist
from app.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
from app.models import User, UserRole
from app.models import Book


class TokenBearer(HTTPBearer):
    # This is basically we are overwriting the __init__ method of HTTPBearer class
    # so that we can add our own custom logic to it like here we kept auto_error = True so that if any error occurs it will raise an HTTP 401 error if we keep false then it will not show error
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    # Overwriting the __call__ method of HTTPBearer class
    # Here we will able to access the access token and will able to work on it as well as the refresh token
    # Ye sabse important method hai Dependency use hone par ye method automatically execute hota hai
    async def __call__(self, request: Request)-> HTTPAuthorizationCredentials | None:
        # Extract Credentials
        creds = await super().__call__(request)

        token = creds.credentials
        token_data = decode_jwt(token)

        if not self.token_valid(token):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={
                "error": "Token is Invalid or expired",
                "Resolve": "Please get new tokens"
            })

        if await token_in_blocklist(token_data["jwt_id"]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={
                "error": "Token has been Revoked or Invalid",
                "Resolve": "You have been Logout, Please Login again"
            })

        self.verify_token_data(token_data)

        return token_data

    def token_valid(self, token:str)-> bool :
        token_data = decode_jwt(token)

        if token_data is None:
           return False
        return True

    def verify_token_data(self, token_data):
        raise NotImplementedError("Subclasses must implement this method")

# Sirf access token allow karta hai
class AccessTokenBearer(TokenBearer):
    def verify_token_data(self, token_data:dict) -> None:
        if token_data and token_data["refresh"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Please provide valid Access Token and not Refresh Token") 

# Sirf refresh token allow karta hai
class RefreshTokenBearer(TokenBearer):
    def verify_token_data(self, token_data:dict) -> None:
        if token_data and not token_data["refresh"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Please provide valid Refresh Token") 

async def get_current_user(token_details:dict= Depends(AccessTokenBearer()), db: AsyncSession = Depends(get_db)):
    user_id = token_details["user"]["id"]

    user = await db.execute(select(User).where(User.id == user_id))
    user = user.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={
            "error": "User Not Found",
            "Resolve": "Please Login again"
        })
    return user


class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]) -> None:
        self.allowed_roles = set(allowed_roles)

    async def __call__(self, current_user:User = Depends(get_current_user)) -> Any:
        if current_user.role in self.allowed_roles:
            return current_user
        
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=
        {
        "error": "Unauthorized", 
        "Resolve": "You do not have permission to access this resource"
        }
        )

class BookOwnerOrAdmin:
    async def __call__(self, book_id:str, db:AsyncSession = Depends(get_db), current_user:User = Depends(get_current_user)):
        result = await db.execute(select(Book).where(Book.id == book_id))
        book = result.scalar_one_or_none()
        
        if book is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
        
        # admin can access everything
        if current_user.role == UserRole.ADMIN:
            return book
        
        # user can access only their own books
        if str(book.user_id) == str(current_user.id):
            return book
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Unauthorized",
                "Resolve": "You do not have permission to access this resource"
            }
        )
    