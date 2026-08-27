"""Photo schemas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PhotoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    destination_id: int | None
    memory_id: int | None
    trip_id: int | None
    url: str
    caption: str | None
    taken_at: datetime | None


class PhotoShareCreate(BaseModel):
    title: str
    description: str | None = None
    photo_ids: list[int] = Field(min_length=1)
    is_public: bool = True


class PhotoShareOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    share_token: str
    title: str
    description: str | None
    is_public: bool


class PublicPhotoShareOut(BaseModel):
    title: str
    description: str | None
    photos: list[PhotoOut]
