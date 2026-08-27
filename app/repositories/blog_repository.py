"""Blog persistence."""

from sqlalchemy import select

from app.models.blog import Blog
from app.repositories.base import BaseRepository


class BlogRepository(BaseRepository[Blog]):
    model = Blog

    def list_for_user(self, user_id: int) -> list[Blog]:
        stmt = select(Blog).where(Blog.user_id == user_id).order_by(Blog.created_at.desc())
        return list(self.db.scalars(stmt).all())
