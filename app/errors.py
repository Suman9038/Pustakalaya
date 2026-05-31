from fastapi import FastAPI, status
from typing import Any, Callable
from fastapi.requests import Request
from fastapi.responses import JSONResponse


class PustakalayaException(Exception):
    """
    Base class for all exceptions in the Pustakalaya app
    """
    def __init__(self, message: str | None = None, status_code: int = 400):
        self.message = message
        self.status_code = status_code

class InvalidToken(PustakalayaException):
    """
    Custom exception for invalid tokens.
    """
    pass

class RevokedToken(PustakalayaException):
    """
    User has provided a token that has been revoked.
    """
    pass

class AccessTokenRequired(PustakalayaException):
    """
    User has provided a refresh token when an access token is required.
    """
    pass

class RefreshTokenRequired(PustakalayaException):
    """
    User has provided an access token when a refresh token is required.
    """
    pass

class UserAlreadyExists(PustakalayaException):
    """
    User has provided an email for that a user with same email already exists.
    """
    pass

class UserNotExists(PustakalayaException):
    """
    User has provided an email for that a user with same email not exists.
    """
    pass

class TokenGenerationFailed(PustakalayaException):
    """
    An Error Occured while generating token.
    """
    pass

class InvalidCredentials(PustakalayaException):
    """
    User has provided a email or password that is not valid.
    """
    pass

class InsufficentPermission(PustakalayaException):
    """
    User does not have the neccessary permissions to perform an action.
    """
    pass

class BookNotFound(PustakalayaException):
    """
    Book with the provided ID was not found.
    """
    pass

class ReviewNotFound(PustakalayaException):
    """
    Review with the provided ID was not found.
    """
    pass

class AlreadyReviewed(PustakalayaException):
    """
    User has already reviewed the book.
    """
    pass

def create_exception_handler(status_code: int, initial_detail: Any) -> Callable[[Request, Exception], JSONResponse]:
    
    async def exception_handler(request:Request, exc:PustakalayaException):
        return JSONResponse(
            status_code=status_code,
            content={
               **initial_detail,
               "detail": str(exc)
            }
        )
    return exception_handler


def register_exception_handlers(app: FastAPI):
    app.add_exception_handler(
        UserAlreadyExists,
        create_exception_handler(
            status_code=status.HTTP_403_FORBIDDEN,
            initial_detail={
                "message":"User with Email already exists",
                "error_code": "ERR_USER_ALREADY_EXISTS"
            }
        )
    )

    app.add_exception_handler(
        UserNotExists,
        create_exception_handler(
            status_code=status.HTTP_403_FORBIDDEN,
            initial_detail={
                "message":"User with Email not exists",
                "error_code": "ERR_USER_NOT_EXISTS"
            }
        )
    )

    app.add_exception_handler(
        TokenGenerationFailed,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message":"Token Generation Failed",
                "error_code": "ERR_TOKEN_GENERATION_FAILED"
            }
        )
    )

    app.add_exception_handler(
        InvalidCredentials,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message":"Invalid email or password",
                "error_code": "ERR_INVALID_CREDENTIALS"
            }
        )
    )

    app.add_exception_handler(
        InsufficentPermission,
        create_exception_handler(
            status_code=status.HTTP_403_FORBIDDEN,
            initial_detail={
                "message":"You don't have permission to perform this action",
                "error_code": "ERR_INSUFFICIENT_PERMISSION"
            }
        )
    )

    app.add_exception_handler(
        InvalidToken,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message":"Token is Invalid or expired",
                "error_code": "ERR_INVALID_TOKEN"
            }
        )
    )

    app.add_exception_handler(
        BookNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message":"Book not found",
                "error_code": "ERR_BOOK_NOT_FOUND"
            }
        )
    )

    app.add_exception_handler(
        ReviewNotFound,
        create_exception_handler(
            status_code=status.HTTP_404_NOT_FOUND,
            initial_detail={
                "message":"Review not found",
                "error_code": "ERR_REVIEW_NOT_FOUND"
            }
        )
    )

    app.add_exception_handler(
        AlreadyReviewed,
        create_exception_handler(
            status_code=status.HTTP_400_BAD_REQUEST,
            initial_detail={
                "message":"You have already reviewed this book",
                "error_code": "ERR_ALREADY_REVIEWED"
            }
        )
    )

    app.add_exception_handler(
        RevokedToken,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message":"Token is invalid or has been revoked",
                "error_code": "ERR_REVOKED_TOKEN"
            }
        )
    )  

    app.add_exception_handler(
        AccessTokenRequired,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message":"Please provide a valid access token. A refresh token was provided instead.",
                "error_code": "ERR_ACCESS_TOKEN_REQUIRED"
            }
        )
    )

    app.add_exception_handler(
        RefreshTokenRequired,
        create_exception_handler(
            status_code=status.HTTP_401_UNAUTHORIZED,
            initial_detail={
                "message":"Please provide a valid refresh token. An access token was provided instead.",
                "error_code": "ERR_REFRESH_TOKEN_REQUIRED"
            }
        )
    )

    @app.exception_handler(Exception)
    async def global_exception_handler(request:Request, exc:Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message":"Oops! Something went wrong, please try again later.",
                "error_code": "ERR_UNEXPECTED_ERROR"
            }
        )   

