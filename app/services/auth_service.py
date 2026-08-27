"""Authentication business logic: signup, login, token refresh, logout."""

import hashlib
from datetime import datetime, timedelta, timezone

from app.core.constants import UserRole
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import TokenType, create_token, decode_token, hash_password, verify_password
from app.core.config import get_settings
from app.models.user import User
from app.repositories.user_repository import UserRepository

settings = get_settings()


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


class AuthService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def signup(self, *, first_name: str, last_name: str, email: str, password: str) -> tuple[User, str, str]:
        if self.repo.get_by_email(email):
            raise ConflictError("An account with this email already exists.", code="EMAIL_TAKEN")
        name = f"{first_name} {last_name}".strip()
        user = self.repo.create(
            email=email, hashed_password=hash_password(password), name=name, role=UserRole.USER
        )
        return user, *self._issue_tokens(user)

    def login(self, *, email: str, password: str) -> tuple[User, str, str]:
        user = self.repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password.", code="INVALID_CREDENTIALS")
        if not user.is_active:
            raise UnauthorizedError("This account has been deactivated.", code="ACCOUNT_INACTIVE")
        return user, *self._issue_tokens(user)

    def refresh(self, refresh_token: str) -> tuple[User, str, str]:
        try:
            payload = decode_token(refresh_token)
        except ValueError as exc:
            raise UnauthorizedError("Invalid or expired refresh token.") from exc
        if payload.get("type") != TokenType.REFRESH.value:
            raise UnauthorizedError("Invalid token type.")

        stored = self.repo.get_refresh_token(_hash_token(refresh_token))
        expires_at = stored.expires_at if stored else None
        if expires_at is not None and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if not stored or expires_at < datetime.now(timezone.utc):
            raise UnauthorizedError("Refresh token has been revoked or expired.")

        user = self.repo.get(int(payload["sub"]))
        if not user:
            raise UnauthorizedError("User no longer exists.")

        # Rotate: revoke the used refresh token and issue a fresh pair.
        self.repo.revoke_refresh_token(stored)
        return user, *self._issue_tokens(user)

    def logout(self, refresh_token: str) -> None:
        stored = self.repo.get_refresh_token(_hash_token(refresh_token))
        if stored:
            self.repo.revoke_refresh_token(stored)

    def request_password_reset(self, email: str) -> str:
        # Intentionally generic response — never reveal whether an email exists.
        return "If this email exists, a password reset link has been sent."

    def _issue_tokens(self, user: User) -> tuple[str, str]:
        access_token = create_token(str(user.id), TokenType.ACCESS, {"role": user.role.value})
        refresh_token = create_token(str(user.id), TokenType.REFRESH)
        self.repo.store_refresh_token(
            user_id=user.id,
            token_hash=_hash_token(refresh_token),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days),
        )
        return access_token, refresh_token
