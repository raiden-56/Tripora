"""User + refresh-token persistence."""

from datetime import datetime, timezone

from sqlalchemy import select

from app.models.user import RefreshToken, User, UserProfile
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email.lower())
        return self.db.scalar(stmt)

    def create(self, *, email: str, hashed_password: str, name: str, role) -> User:
        user = User(email=email.lower(), hashed_password=hashed_password, name=name, role=role)
        user.profile = UserProfile()
        return self.add(user)

    def store_refresh_token(self, *, user_id: int, token_hash: str, expires_at: datetime) -> RefreshToken:
        token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(token)
        self.db.commit()
        self.db.refresh(token)
        return token

    def get_refresh_token(self, token_hash: str) -> RefreshToken | None:
        stmt = select(RefreshToken).where(RefreshToken.token_hash == token_hash, RefreshToken.revoked.is_(False))
        return self.db.scalar(stmt)

    def revoke_refresh_token(self, token: RefreshToken) -> None:
        token.revoked = True
        self.db.commit()
