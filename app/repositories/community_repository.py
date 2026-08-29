"""Community feed persistence: posts, likes, comments."""

from sqlalchemy import select

from app.core.constants import PostVisibility
from app.models.community import CommunityPost, PostComment, PostLike
from app.repositories.base import BaseRepository


class CommunityPostRepository(BaseRepository[CommunityPost]):
    model = CommunityPost

    def list_feed(self, *, viewer_id: int, page: int, page_size: int) -> tuple[list[CommunityPost], int]:
        """Every public post, plus the viewer's own private ones."""
        stmt = select(CommunityPost).where(
            (CommunityPost.visibility == PostVisibility.PUBLIC) | (CommunityPost.user_id == viewer_id)
        )
        total = len(self.db.scalars(stmt).all())
        stmt = stmt.order_by(CommunityPost.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        return list(self.db.scalars(stmt).all()), total


class PostLikeRepository(BaseRepository[PostLike]):
    model = PostLike

    def get_for_post_and_user(self, post_id: int, user_id: int) -> PostLike | None:
        stmt = select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == user_id)
        return self.db.scalar(stmt)


class PostCommentRepository(BaseRepository[PostComment]):
    model = PostComment
