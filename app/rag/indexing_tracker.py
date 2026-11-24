import json
import time
import threading
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class IndexingTracker:
    """
    Real-time indexing tracker.
    Stores live progress in memory and Redis.
    Uses Redis as the primary source of truth across processes (Celery + FastAPI).
    """
    _store: dict[str, dict] = {}
    _lock = threading.Lock()
    _sync_redis = None

    @classmethod
    def _get_redis(cls):
        if cls._sync_redis is None:
            try:
                import redis
                cls._sync_redis = redis.from_url(settings.LOCAL_REDIS_URL, decode_responses=True)
            except Exception as e:
                logger.warning(f"Sync Redis connection failed: {e}")
                cls._sync_redis = False
        return cls._sync_redis if cls._sync_redis else None

    @classmethod
    def update(
        cls,
        book_id: str,
        percent: int,
        message: str,
        completed: bool = False,
        error: str | None = None
    ) -> dict:
        key = str(book_id)
        data = {
            "book_id": key,
            "percent": min(max(percent, 0), 100),
            "message": message,
            "completed": completed,
            "error": error,
            "updated_at": time.time()
        }

        # Update in-memory dict
        with cls._lock:
            cls._store[key] = data

        # Push to Redis for cross-process visibility in Celery
        try:
            r = cls._get_redis() # getting redis config
            if r:
                r.set(f"book_progress:{key}", json.dumps(data), ex=3600) # setting in the redis with 3600s expiration time
        except Exception as e:
            logger.warning(f"Failed to update progress in Redis for book {key}: {e}")

        return data

    @classmethod
    async def get(cls, book_id: str) -> dict:
        key = str(book_id)

        # 1. ALWAYS query Redis first: Celery worker updates Redis in a separate process!
        try:
            from app.redis_service import redis_client
            cached = await redis_client.get(f"book_progress:{key}")
            if cached:
                data = json.loads(cached)
                with cls._lock:
                    cls._store[key] = data

                # If already complete in Redis, return immediately
                if data.get("completed"):
                    return data

                # Check Celery task state directly as a fallback
                task_id = await redis_client.get(f"book_celery_task:{key}")
                if task_id:
                    from celery.result import AsyncResult
                    from app.celery_client import celery_app
                    async_res = AsyncResult(task_id, app=celery_app)
                    if async_res.state == "SUCCESS":
                        data["completed"] = True
                        data["percent"] = 100
                        data["message"] = "Embedding complete! Launching chat..."
                        await redis_client.set(f"book_progress:{key}", json.dumps(data), ex=3600)
                        return data

                return data

            # If no cached progress in Redis yet, check if Celery task is already SUCCESS
            task_id = await redis_client.get(f"book_celery_task:{key}")
            if task_id:
                from celery.result import AsyncResult
                from app.celery_client import celery_app
                async_res = AsyncResult(task_id, app=celery_app)
                if async_res.state == "SUCCESS":
                    completed_data = {
                        "book_id": key,
                        "percent": 100,
                        "message": "Embedding complete! Launching chat...",
                        "completed": True,
                        "error": None
                    }
                    await redis_client.set(f"book_progress:{key}", json.dumps(completed_data), ex=3600)
                    return completed_data
        except Exception as e:
            logger.debug(f"Redis get failed: {e}")

        # 2. Check in-memory store as fallback
        with cls._lock:
            if key in cls._store:
                return cls._store[key]

        return {
            "book_id": key,
            "percent": 10,
            "message": "Preparing book embedding...",
            "completed": False,
            "error": None
        }
