"""Community feed schemas — posts wrap a shared photo album or animation."""

from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.core.constants import PostVisibility


class CommunityPostCreate(BaseModel):
    photo_share_id: int | None = None
    photo_animation_id: int | None = None
    caption: str | None = Field(default=None, max_length=500)
    visibility: PostVisibility = PostVisibility.PUBLIC

    @model_validator(mode="after")
    def _exactly_one_media(self) -> "CommunityPostCreate":
        if bool(self.photo_share_id) == bool(self.photo_animation_id):
            raise ValueError("Provide exactly one of photo_share_id or photo_animation_id.")
        return self


class CommentCreate(BaseModel):
    body: str = Field(min_length=1, max_length=500)


class AuthorOut(BaseModel):
    id: int
    name: str


class CommentOut(BaseModel):
    id: int
    body: str
    created_at: datetime
    author: AuthorOut


class CommunityPostOut(BaseModel):
    id: int
    caption: str | None
    visibility: PostVisibility
    created_at: datetime
    author: AuthorOut
    media_type: str
    media_url: str | None
    photo_urls: list[str] = Field(default_factory=list)
    like_count: int
    comment_count: int
    liked_by_me: bool
    comments: list[CommentOut] = Field(default_factory=list)
