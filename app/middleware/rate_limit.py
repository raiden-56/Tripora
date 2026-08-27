"""Redis-backed, per-route rate limiting dependency.

Usage:
    @router.post("/login", dependencies=[Depends(RateLimiter(times=5, seconds=60))])

Falls back to allowing all requests (with a warning logged once) if Redis is
unreachable, so a down cache never takes the whole API down with it.
"""

import time

import redis

from app.core.config import get_settings
from app.core.exceptions import RateLimitedError
from app.core.logging import get_logger
from fastapi import Request

logger = get_logger(__name__)
settings = get_settings()

_redis_client: redis.Redis | None = None
_redis_unavailable_logged = False


def _get_redis() -> redis.Redis | None:
    global _redis_client, _redis_unavailable_logged
    if _redis_client is not None:
        return _redis_client
    try:
        client = redis.from_url(settings.redis_url, socket_connect_timeout=0.5)
        client.ping()
        _redis_client = client
        return client
    except Exception:  # noqa: BLE001 - deliberately broad: caching must never crash the API
        if not _redis_unavailable_logged:
            logger.warning("Redis unavailable — rate limiting is disabled for this process.")
            _redis_unavailable_logged = True
        return None


class RateLimiter:
    def __init__(self, times: int, seconds: int):
        self.times = times
        self.seconds = seconds

    async def __call__(self, request: Request) -> None:
        client = _get_redis()
        if client is None:
            return  # degrade gracefully instead of failing closed

        identity = request.client.host if request.client else "unknown"
        bucket = f"ratelimit:{request.url.path}:{identity}:{int(time.time() // self.seconds)}"

        current = client.incr(bucket)
        if current == 1:
            client.expire(bucket, self.seconds)
        if current > self.times:
            raise RateLimitedError("Too many requests. Try again in a moment.")
