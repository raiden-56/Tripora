"""AI travel-story ("blog") schemas."""

from pydantic import BaseModel, ConfigDict

from app.core.constants import GenerationStatus


class BlogGenerateRequest(BaseModel):
    trip_id: int | None = None
    destination_id: int | None = None


class BlogGenerateResponse(BaseModel):
    blog_id: int
    status: GenerationStatus


class BlogSectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    heading: str
    content: str


class BlogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: GenerationStatus
    summary: str | None
    error_message: str | None
    sections: list[BlogSectionOut]
