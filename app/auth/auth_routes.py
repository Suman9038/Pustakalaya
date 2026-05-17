from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth.auth_schema import UserCreateSchema, UserResponseSchema, UserLoginSchema,TokenSchema
from app.validators import EmailValidator, PasswordValidator, UsernameValidator
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from sqlalchemy import select
from app.auth.auth_models import User
from app.auth.utils import hash_password, create_access_token, verify_password
from app.config import settings
from app.auth.dependencies import RefreshTokenBearer


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/signup", response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
async def signup(request:UserCreateSchema, db:AsyncSession = Depends(get_db)):
    # Validate email
    EmailValidator.validate(request.email)
    # Validate Password
    PasswordValidator.validate(request.password) 
    # Validate Username
    UsernameValidator.validate(request.username)
    
    print(f"Attempted signup for user {request.email}")
    
    existing_user = await db.execute(select(User).where(User.email == request.email))
    existing_user = existing_user.scalars().first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists, Please Try with new Email Address")

    user_data = request.model_dump()
    new_user = User(**user_data)
    new_user.password = hash_password(user_data["password"])
    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/login", response_model=TokenSchema)
async def login(request: UserLoginSchema, db:AsyncSession = Depends(get_db)):
    try:
        # Extracting credentials from the request body
        email = request.email
        password = request.password

        # Validating the email and password its correct or its present in db or not 
        user = await db.execute(select(User).where(User.email == email))
        user = user.scalars().first()

        print(f"Attempting login for user {user.email}")

        # If user not found raise an error 
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User with this Email ID not Found, Please Signup or Give a valid Email Address")

        # If user found check the password 
        if not verify_password(password, user.password):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=" Invalid Password")

        user_data = {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "is_verified": user.is_verified
        }
        access_token = create_access_token(user_data)
        refresh_token = create_access_token(
            user_data,
            refresh=True,
            expiry= timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            )

        if not access_token or not refresh_token:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate access token.")
        
        return TokenSchema(message="Login Successful", access_token=access_token, token_type="bearer", refresh_token=refresh_token)

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/refresh_token", response_model=TokenSchema)
async def refresh_access_token(token_details: dict = Depends(RefreshTokenBearer())):
    expiry_timestamp = token_details["exp"]
    
    if datetime.fromtimestamp(expiry_timestamp) > datetime.now():
        new_access_token = create_access_token(
            user_data= token_details["user"]
            )
        
        return TokenSchema(
            message= "Token Refreshed Successfully",
            access_token= new_access_token,
            token_type= "bearer",
            token_refresh_success=token_details["refresh"]
        )
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Refresh Token or Token is Expired")
