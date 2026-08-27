"""Authentication endpoints."""

from fastapi import APIRouter, Depends

from app.api.dependencies import DbSession
from app.core.config import get_settings
from app.middleware.rate_limit import RateLimiter
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    RefreshRequest,
    SignupRequest,
    TokenResponse,
)
from app.schemas.user import UserOut
from app.services.auth_service import AuthService

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["auth"])


def _service(db: DbSession) -> AuthService:
    return AuthService(UserRepository(db))


@router.post(
    "/signup",
    response_model=TokenResponse,
    dependencies=[Depends(RateLimiter(times=settings.rate_limit_login_per_minute, seconds=60))],
)
def signup(payload: SignupRequest, service: AuthService = Depends(_service)) -> TokenResponse:
    user, access_token, refresh_token = service.signup(
        first_name=payload.first_name, last_name=payload.last_name, email=payload.email, password=payload.password
    )
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserOut.model_validate(user))


@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(RateLimiter(times=settings.rate_limit_login_per_minute, seconds=60))],
)
def login(payload: LoginRequest, service: AuthService = Depends(_service)) -> TokenResponse:
    user, access_token, refresh_token = service.login(email=payload.email, password=payload.password)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserOut.model_validate(user))


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, service: AuthService = Depends(_service)) -> TokenResponse:
    user, access_token, refresh_token = service.refresh(payload.refresh_token)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserOut.model_validate(user))


@router.post("/logout", status_code=204)
def logout(payload: RefreshRequest, service: AuthService = Depends(_service)) -> None:
    service.logout(payload.refresh_token)


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    dependencies=[Depends(RateLimiter(times=settings.rate_limit_login_per_minute, seconds=60))],
)
def forgot_password(payload: ForgotPasswordRequest, service: AuthService = Depends(_service)) -> ForgotPasswordResponse:
    return ForgotPasswordResponse(message=service.request_password_reset(payload.email))
