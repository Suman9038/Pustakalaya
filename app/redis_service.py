import redis.asyncio as redis
from app.config import settings


JTI_EXPIRY = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

token_blocklist= redis.Redis(
    host= settings.REDIS_HOST,
    port= settings.REDIS_PORT,
    db= 0,
    decode_responses= True
)

async def add_token_jti_to_blocklist(jwt_id:str):
    await token_blocklist.set(
        name= f"block_{jwt_id}",
        value="",
        ex= JTI_EXPIRY,
    )
async def token_in_blocklist(jwt_id:str)-> bool:
    return await token_blocklist.exists(f"block_{jwt_id}")