"""Photo animation (GIF) schemas."""

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import GenerationStatus


class PhotoAnimationCreate(BaseModel):
    title: str = Field(default="Untitled Animation", max_length=150)
    photo_ids: list[int] = Field(min_length=2, max_length=30)
    trip_id: int | None = None


class PhotoAnimationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: GenerationStatus
    output_url: str | None
    error_message: str | None
