"""Redis-backed, per-route rate limiting dependency.

Usage:
    @router.post("/login", dependencies=[Depends(RateLimiter(times=5, seconds=60))])

Falls back to allowing all requests if Redis is unreachable (see
app/core/redis_client.py), so a down cache never takes the whole API down with it.
"""

import time

from fastapi import Request

from app.core.exceptions import RateLimitedError
from app.core.redis_client import get_redis, mark_failed


def client_identity(request: Request) -> str:
    """The caller's IP. Honours X-Forwarded-For only when uvicorn was started with
    --proxy-headers (which rewrites request.client), so it can't be spoofed directly."""
    return request.client.host if request.client else "unknown"


class RateLimiter:
    def __init__(self, times: int, seconds: int):
        self.times = times
        self.seconds = seconds

    # Sync on purpose: FastAPI runs sync dependencies in a threadpool, so the
    # blocking Redis calls below never stall the event loop.
    def __call__(self, request: Request) -> None:
        client = get_redis()
        if client is None:
            return  # degrade gracefully instead of failing closed

        bucket = f"ratelimit:{request.url.path}:{client_identity(request)}:{int(time.time() // self.seconds)}"
        try:
            current = client.incr(bucket)
            if current == 1:
                client.expire(bucket, self.seconds)
        except Exception:  # noqa: BLE001
            mark_failed()
            return
        if current > self.times:
            raise RateLimitedError("Too many requests. Try again in a moment.")
