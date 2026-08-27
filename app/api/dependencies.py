"""Shared FastAPI dependencies: DB session passthrough, current-user resolution,
role guards, and small service factories."""

from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.constants import UserRole
from app.core.exceptions import PermissionDeniedError, UnauthorizedError
from app.core.security import TokenType, decode_token
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository

_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(token: Annotated[str | None, Depends(_oauth2_scheme)], db: DbSession) -> User:
    if not token:
        raise UnauthorizedError("Missing authentication token.")
    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise UnauthorizedError("Invalid or expired token.") from exc
    if payload.get("type") != TokenType.ACCESS.value:
        raise UnauthorizedError("Invalid token type.")

    user = UserRepository(db).get(int(payload["sub"]))
    if not user or not user.is_active:
        raise UnauthorizedError("User not found or inactive.")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: UserRole):
    def _dependency(user: CurrentUser) -> User:
        if user.role not in roles:
            raise PermissionDeniedError("You do not have permission to perform this action.")
        return user

    return _dependency
