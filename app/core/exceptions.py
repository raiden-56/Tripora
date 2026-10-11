"""Application-wide exception types and FastAPI exception handlers."""

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger(__name__)


class AppError(Exception):
    """Base class for domain errors that map to a clean API error response."""

    status_code = status.HTTP_400_BAD_REQUEST
    code = "APP_ERROR"

    def __init__(self, message: str, code: str | None = None, status_code: int | None = None):
        super().__init__(message)
        self.message = message
        if code:
            self.code = code
        if status_code:
            self.status_code = status_code


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "NOT_FOUND"


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT
    code = "CONFLICT"


class PermissionDeniedError(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    code = "PERMISSION_DENIED"


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "UNAUTHORIZED"


class RateLimitedError(AppError):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    code = "RATE_LIMITED"


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    # Never leak internal stack traces to clients, but always log them server-side —
    # otherwise a 500 leaves no trace of what actually went wrong.
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred."}},
    )


async def integrity_error_handler(request: Request, exc: Exception) -> JSONResponse:
    # Last line of defence: schemas and services validate references and limits up
    # front, but a constraint the database still rejects (FK, unique, NOT NULL, value
    # too long) is the client's fault, not a server crash.
    logger.warning("Database rejected %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"error": {"code": "CONFLICT", "message": "That change conflicts with existing data."}},
    )


async def data_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.warning("Database rejected a value on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={"error": {"code": "VALIDATION_ERROR", "message": "One of the values is invalid or too long."}},
    )


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    message = errors[0]["msg"] if errors else "Invalid request."
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={"error": {"code": "VALIDATION_ERROR", "message": message}},
    )
