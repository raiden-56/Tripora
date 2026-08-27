"""Guide marketplace schemas."""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field, field_validator


class GuideOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    headline: str
    about: str | None
    destination_name: str
    languages: list[str] = Field(default_factory=list)
    experience_years: int
    specialization: str | None
    price_per_day: float
    is_verified: bool
    rating_avg: float
    rating_count: int

    @field_validator("languages", mode="before")
    @classmethod
    def _split_languages(cls, value: object) -> object:
        if isinstance(value, str):
            return [lang.strip() for lang in value.split(",") if lang.strip()]
        return value


class GuideCreate(BaseModel):
    headline: str = Field(min_length=1, max_length=150)
    about: str | None = None
    destination_name: str
    languages: list[str] = Field(default_factory=list)
    experience_years: int = 0
    specialization: str | None = None
    price_per_day: float = Field(ge=0)


class GuideReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class GuideReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    guide_id: int
    user_id: int
    rating: int
    comment: str | None
