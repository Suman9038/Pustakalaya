import logging
import redis.asyncio as redis
from app.config import settings

logger = logging.getLogger(__name__)

JTI_EXPIRY = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

redis_client = redis.from_url(settings.LOCAL_REDIS_URL, decode_responses=True)


async def add_token_jti_to_blocklist(jwt_id: str, expiry_timestamp: int | None = None):
    try:
        if expiry_timestamp:
            import time
            now = int(time.time())
            ttl = max(int(expiry_timestamp - now), 60)
        else:
            ttl = JTI_EXPIRY

        await redis_client.set(
            name=f"block_{jwt_id}",
            value="blocked",
            ex=ttl,
        )
    except Exception as e:
        logger.error(f"Failed to add token {jwt_id} to blocklist in Redis: {e}")


async def token_in_blocklist(jwt_id: str) -> bool:
    try:
        return bool(await redis_client.exists(f"block_{jwt_id}"))
    except Exception as e:
        logger.error(f"Failed to check token {jwt_id} blocklist in Redis: {e}")
        return False


async def set_email_cooldown(user_id: str):
    try:
        await redis_client.set(
            f"email_cooldown:{user_id}",
            "1",
            ex=60,
        )
    except Exception as e:
        logger.error(f"Failed to set email cooldown in Redis for user {user_id}: {e}")


async def email_cooldown_active(user_id: str) -> bool:
    try:
        return bool(
            await redis_client.exists(
                f"email_cooldown:{user_id}"
            )
        )
    except Exception as e:
        logger.error(f"Failed to check email cooldown in Redis for user {user_id}: {e}")
        return False
