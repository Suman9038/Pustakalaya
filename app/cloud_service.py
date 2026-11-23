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
    def get_file_view(file_id: str):
        try:
            response = storage.get_file_view(
                bucket_id=settings.APPWRITE_BUCKET_ID,
                file_id=file_id
            )
            if isinstance(response, (bytes, bytearray)):
                return response
            elif isinstance(response, dict):
                logger.error(f"Appwrite returned dict instead of bytes: {response}")
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=response.get("message", "File not found in storage bucket")
                )
            elif isinstance(response, str):
                return response.encode("utf-8")
            return response
        except HTTPException:
            raise
        except Exception as e:
            err_msg = str(e)
            logger.error(f"Error fetching file view for {file_id}: {err_msg}")
            if "404" in err_msg or "not found" in err_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File not found in storage bucket"
                )
            # Fallback to get_file_download if get_file_view failed
            try:
                dl_response = storage.get_file_download(
                    bucket_id=settings.APPWRITE_BUCKET_ID,
                    file_id=file_id
                )
                if isinstance(dl_response, (bytes, bytearray)):
                    return dl_response
            except Exception:
                pass
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Storage error: {err_msg}")
    
        