from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials
from fastapi import Request, HTTPException, status
from app.auth.utils import decode_jwt


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
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Access Token or Token is Expired")

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
