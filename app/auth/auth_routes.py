from app.auth.auth_schema import CurrentUserResponseSchema
from app.auth.dependencies import AccessTokenBearer,get_current_user
from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth.auth_schema import UserCreateSchema, UserResponseSchema, UserLoginSchema,TokenSchema,UserResponseSchemaWithMessage
from app.validators import EmailValidator, PasswordValidator, UsernameValidator
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from sqlalchemy import select
from app.models import User,UserRole
from app.auth.utils import hash_password, create_access_token, verify_password, create_url_safe_token, verify_url_safe_token,create_password_reset_token,verify_password_reset_token
from app.config import settings
from app.auth.dependencies import RefreshTokenBearer, RoleChecker
from app.redis_service import add_token_jti_to_blocklist, set_email_cooldown, email_cooldown_active
from fastapi.responses import JSONResponse
from app.errors import (
    UserAlreadyExists,
    UserNotExists,
    InvalidCredentials,
    TokenGenerationFailed,
    InvalidToken,
    EmailCooldownActive,
    AccountNotVerified,
    PustakalayaException
)
from app.mail import MailService,ResendVerificationSchema,ResetPasswordSchema,ForgotPasswordSchema
from app.celery_client import send_verification_email_task,send_welcome_email_task,send_password_reset_email_task

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

access_token_bearer = AccessTokenBearer()
refresh_token_bearer = RefreshTokenBearer()
role_checker = RoleChecker(["admin", "user"])

@router.post("/signup", response_model=UserResponseSchemaWithMessage, status_code=status.HTTP_201_CREATED)
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
        raise UserAlreadyExists()

    user_data = request.model_dump()
    new_user = User(**user_data) # "**" --> Unpacking the user_data dictionary and passing it to the User model
    new_user.password = hash_password(user_data["password"])
    new_user.role = UserRole.USER
    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        token = create_url_safe_token({"email":new_user.email})
        verification_url = settings.VERIFICATION_URL.format(token=token)

        send_verification_email_task.delay(
            username=new_user.first_name,
            email=new_user.email,
            verification_url=verification_url
        )

        return {
            "message":"Account Created! Now check your email to verify your account!",
            "user":new_user
        }
    except Exception as e:
        await db.rollback() # if anything goes wrong we have to rollback the changes made in the database
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(token:str, db:AsyncSession= Depends(get_db)):
    data = verify_url_safe_token(token)
    email = data.get("email")
    if not email:
        raise InvalidToken()

    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise UserNotExists()

    if user.is_verified:
        return{
            "User is already verified"
        }
    first_name = user.first_name
    email = user.email
    user.is_verified= True
    await db.commit()
    send_welcome_email_task.delay(
        username= first_name,
        to_email=email
    )
    return {
        "message": "Email verified successfully"
    }

@router.post("/signup/admin", response_model=UserResponseSchema, status_code=status.HTTP_201_CREATED)
async def signup(request:UserCreateSchema, db:AsyncSession = Depends(get_db)):
    # Validate email
    EmailValidator.validate(request.email)
    # Validate Password
    PasswordValidator.validate(request.password) 
    # Validate Username
    UsernameValidator.validate(request.username)
    
    print(f"Attempted signup for admin {request.email}")
    
    existing_user = await db.execute(select(User).where(User.email == request.email))
    existing_user = existing_user.scalars().first()
    if existing_user:
        raise UserAlreadyExists()

    user_data = request.model_dump()
    new_user = User(**user_data) # "**" --> Unpacking the user_data dictionary and passing it to the User model
    new_user.password = hash_password(user_data["password"])
    new_user.role = UserRole.ADMIN
    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        token = create_url_safe_token({"email":new_user.email})
        verification_url = settings.VERIFICATION_URL.format(token=token)

        send_verification_email_task.delay(
            username=new_user.first_name,
            email=new_user.email,
            verification_url=verification_url
        )
        return new_user
    except Exception as e:
        await db.rollback() # if anything goes wrong we have to rollback the changes made in the database
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
            raise UserNotExists()

        # If user found check the password 
        if not verify_password(password, user.password):
            raise InvalidCredentials()

        if not user.is_verified:
            raise AccountNotVerified()

        user_data = {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.role,
            "is_verified": user.is_verified
        }
        access_token = create_access_token(user_data)
        refresh_token = create_access_token(
            user_data,
            refresh=True,
            expiry= timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            )

        if not access_token or not refresh_token:
            raise TokenGenerationFailed()
        
        return TokenSchema(message="Login Successful", access_token=access_token, token_type="bearer", refresh_token=refresh_token)

    except PustakalayaException:
        raise
    except Exception as e:
        raise InvalidCredentials()

@router.get("/refresh_token", response_model=TokenSchema)
async def refresh_access_token(token_details: dict = Depends(refresh_token_bearer)):
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
    raise InvalidToken()

@router.post("/login/admin", response_model=TokenSchema)
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
            raise UserNotExists()

        # If user found check the password 
        if not verify_password(password, user.password):
            raise InvalidCredentials()

        if not user.is_verified:
            raise AccountNotVerified()

        user_data = {
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "role": user.role,
            "is_verified": user.is_verified
        }
        access_token = create_access_token(user_data)
        refresh_token = create_access_token(
            user_data,
            refresh=True,
            expiry= timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            )

        if not access_token or not refresh_token:
            raise TokenGenerationFailed()
        
        return TokenSchema(message="Login Successful", access_token=access_token, token_type="bearer", refresh_token=refresh_token)
    except PustakalayaException:
        raise 
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/me", response_model=CurrentUserResponseSchema)
async def get_me(user= Depends(get_current_user),_:bool = Depends(role_checker)):
    return user


@router.get("/logout")
async def logout(token_details: dict = Depends(access_token_bearer)):
    jwt_id = token_details["jwt_id"]
    expiry_timestamp = token_details["exp"]

    await add_token_jti_to_blocklist(jwt_id)

    return JSONResponse(
        content={
            "message": "Logged Out Successfully"
        },
        status_code= status.HTTP_200_OK
    )

@router.post("/resend-verification")
async def resend_verification(request:ResendVerificationSchema,
db:AsyncSession= Depends(get_db)):
    user_result= await db.execute(select(User).where(User.email == request.email))
    user = user_result.scalar_one_or_none()

    if not user:
        raise UserNotExists()

    if user.is_verified:
        return{
            "message": "Email is already Verified"
        }
    
    token = create_url_safe_token({
        "email": user.email
    })

    verification_url = settings.VERIFICATION_URL.format(token=token)

    if await email_cooldown_active(user.id):
        raise EmailCooldownActive()

    send_verification_email_task.delay(
            username=user.first_name,
            email=user.email,
            verification_url=verification_url
        )
    await set_email_cooldown(user.id)

    return{
        "message": "Verification email sent successfully"
    }


@router.post("forgot-password")
async def forgot_password(request:ForgotPasswordSchema, db:AsyncSession= Depends(get_db)):
    user_result = await db.execute(select(User).where(User.email == request.email))
    user = user_result.scalar_one_or_none()

    if not user:
        raise UserNotExists()
    
    if await email_cooldown_active(user.id):
        raise EmailCooldownActive()
    
    password_reset_url = create_password_reset_token({
        "email":user.email
    })

    send_password_reset_email_task.delay(
        username=user.first_name,
        email=user.email,
        reset_url=password_reset_url
    )

    await set_email_cooldown(user.id)

    return{
        "message": "Password reset email sent successfully"
    }

@router.post("/reset-password")
async def reset_password(request:ResetPasswordSchema, db:AsyncSession= Depends(get_db)):
    try:
        token_data = verify_password_reset_token(request.token)
        user_result = await db.execute(select(User).where(User.email == token_data["email"]))
        user = user_result.scalar_one_or_none()

        if not user:
            raise UserNotExists()

        PasswordValidator.validate(
            request.new_password
        )
        user.password = hash_password(request.password)
        await db.commit()

        return{
            "message": "Password reset successful"
        }
    except PustakalayaException:
        raise 
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/test-email")
async def test_email():

    await MailService.send_mail(
        to_email="reversed713@gmail.com",
        subject="SMTP Test",
        html="<h1>Hello from Pustakalaya</h1>"
    )

    return {
        "message": "Email sent"
    }