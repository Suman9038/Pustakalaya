import redis.asyncio as redis
from app.config import settings


JTI_EXPIRY = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

redis_url = settings.REDIS_URL
# redis.asyncio ko CERT_NONE string samajh nahi aati, isliye hum usko hata kar explicitly pass kar rahe hain
if redis_url and "?ssl_cert_reqs=" in redis_url:
    redis_url = redis_url.split("?")[0]

redis_client = redis.from_url(
    redis_url, 
    decode_responses=True,
    ssl_cert_reqs="none" if redis_url and redis_url.startswith("rediss://") else None
)


async def add_token_jti_to_blocklist(jwt_id:str):
    await redis_client.set(
        name= f"block_{jwt_id}",
        value="blocked",
        ex= JTI_EXPIRY,
    )
async def token_in_blocklist(jwt_id:str)-> bool:
    return await redis_client.exists(f"block_{jwt_id}")


async def set_email_cooldown(user_id:str):
    await redis_client.set(
        f"email_cooldown:{user_id}",
        "1",
        ex=60
    ) 

async def email_cooldown_active(user_id:str):
    return bool(
        await redis_client.exists(
            f"email_cooldown:{user_id}"
        )
    )