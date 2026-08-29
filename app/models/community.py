"""Community feed: posts wrap a shared photo album or an animation (media-first —
no free-text-only posts), plus likes and comments. There's no follower graph yet,
so visibility is binary: public (shows in everyone's feed) or private (author-only,
e.g. kept as a personal keepsake without publishing it)."""

from sqlalchemy import Boolean, Enum, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import PostVisibility
from app.db.base import Base, TimestampMixin


class CommunityPost(Base, TimestampMixin):
    __tablename__ = "community_posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    photo_share_id: Mapped[int | None] = mapped_column(
        ForeignKey("photo_shares.id", ondelete="CASCADE"), nullable=True
    )
    photo_animation_id: Mapped[int | None] = mapped_column(
        ForeignKey("photo_animations.id", ondelete="CASCADE"), nullable=True
    )
    caption: Mapped[str | None] = mapped_column(String(500), nullable=True)
    visibility: Mapped[PostVisibility] = mapped_column(Enum(PostVisibility), default=PostVisibility.PUBLIC, index=True)

    user: Mapped["User"] = relationship()
    photo_share: Mapped["PhotoShare"] = relationship()
    photo_animation: Mapped["PhotoAnimation"] = relationship()
    likes: Mapped[list["PostLike"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    comments: Mapped[list["PostComment"]] = relationship(
        back_populates="post", cascade="all, delete-orphan", order_by="PostComment.created_at"
    )


class PostLike(Base, TimestampMixin):
    __tablename__ = "post_likes"
    __table_args__ = (Index("ix_post_likes_post_user", "post_id", "user_id", unique=True),)

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("community_posts.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    post: Mapped["CommunityPost"] = relationship(back_populates="likes")


class PostComment(Base, TimestampMixin):
    __tablename__ = "post_comments"
    __table_args__ = (Index("ix_post_comments_post", "post_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("community_posts.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    body: Mapped[str] = mapped_column(String(500))
    is_reported: Mapped[bool] = mapped_column(Boolean, default=False)

    post: Mapped["CommunityPost"] = relationship(back_populates="comments")
    user: Mapped["User"] = relationship()
