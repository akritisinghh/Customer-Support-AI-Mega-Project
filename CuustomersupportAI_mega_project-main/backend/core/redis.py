from __future__ import annotations

from redis.asyncio import Redis, from_url

from backend.core.config import settings

_redis_client: Redis | None = None


async def get_redis() -> Redis:
    """Return the shared async Redis connection, creating it on first call."""
    global _redis_client
    if _redis_client is None:
        _redis_client = from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )
    return _redis_client


async def close_redis() -> None:
    """Gracefully close the Redis connection pool."""
    global _redis_client
    if _redis_client is not None:
        await _redis_client.aclose()
        _redis_client = None
