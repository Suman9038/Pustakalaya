from celery import Celery
from app.config import settings
from app.mail import MailService
from app.rag.indexing import IndexingService
from asgiref.sync import async_to_sync
from uuid import UUID


celery_app = Celery(
    "pustakalaya",
    broker=settings.LOCAL_REDIS_URL,
    backend=settings.LOCAL_REDIS_URL
)

@celery_app.task()
def send_verification_email_task(username:str,email:str,verification_url:str):
    async_to_sync(MailService.send_verification_email)(
        username=username,
        to_email=email,
        verification_url=verification_url
    )

@celery_app.task()
def send_welcome_email_task(username:str,to_email:str):
    async_to_sync(MailService.send_welcome_email)(
        username=username,
        to_email=to_email
    )

@celery_app.task()
def send_password_reset_email_task(username:str,email:str,reset_url:str):
    async_to_sync(MailService.send_password_reset_email)(
        username=username,
        to_email=email,
        reset_url=reset_url
    )

@celery_app.task()
def index_book_task(book_id:str,file_id:str,title:str):
    service = IndexingService()
    service.index_book(
        book_id=UUID(book_id),
        file_id=file_id,
        title=title
    )