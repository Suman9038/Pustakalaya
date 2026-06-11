from app.config import settings
from appwrite.client import Client
from appwrite.services.storage import Storage
from fastapi import HTTPException, status
from appwrite.id import ID
from appwrite.input_file import InputFile
import os
import logging


logger = logging.getLogger(__name__)

client = Client()

client.set_endpoint(settings.APPWRITE_ENDPOINT)
client.set_project(settings.PROJECT_ID)
client.set_key(settings.APPWRITE_API_KEY)

storage = Storage(client)


class CloudService:

    @staticmethod
    def upload_file(file):
        try:
            file_bytes = file.file.read()
            logger.info(f"File size: {len(file_bytes)} bytes")
            response = storage.create_file(
                file_id=ID.unique(),
                bucket_id=settings.APPWRITE_BUCKET_ID,
                file=InputFile.from_bytes(
                    file_bytes,
                    file.filename
                )
            )
            logger.info(f"File uploaded successfully: {response}")
            # return response
            return {
                "file_id": response.id,
                "file_name": response.name,
                "file_size": response.sizeoriginal,
                "mime_type": response.mimetype,
            }   
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to upload file: {str(e)}")

    @staticmethod
    def delete_file(file_id:str):
        try:
            response = storage.delete_file(
                bucket_id=settings.APPWRITE_BUCKET_ID,
                file_id=file_id
            )
            return response
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    @staticmethod
    def get_file_preview(file_id:str):
        try:
            response = storage.get_file_preview(
                bucket_id=settings.APPWRITE_BUCKET_ID,
                file_id=file_id
            )
            return response
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
    @staticmethod 
    def get_file_view(file_id:str):
        try:
            response = storage.get_file_view(
                bucket_id=settings.APPWRITE_BUCKET_ID,
                file_id=file_id
            )
            return response
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    
        