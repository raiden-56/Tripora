"""FastAPI application entrypoint."""

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints.health import router as health_router
from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import (
    AppError,
    app_error_handler,
    unhandled_error_handler,
    validation_error_handler,
)
from app.core.logging import configure_logging
from app.middleware.request_logging import RequestLoggingMiddleware

settings = get_settings()
configure_logging()

app = FastAPI(
    title=settings.app_name,
    description=(
        "Travel Diaries backend API — destinations, trips, memories, photo sharing, "
        "guide bookings, AI trip planning, AI travel stories, pricing, and admin."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(Exception, unhandled_error_handler)

app.include_router(health_router)
app.include_router(api_router, prefix=settings.api_v1_prefix)
