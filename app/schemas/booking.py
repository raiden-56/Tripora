"""Guide booking schemas."""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import BookingStatus


class BookingCreate(BaseModel):
    booking_date: date
    booking_time: str = Field(pattern=r"^\d{2}:\d{2}$")
    people_count: int = Field(default=1, ge=1, le=50)
    duration_hours: int = Field(default=4, ge=1, le=24)
    special_requirements: str | None = None


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    guide_id: int
    booking_date: date
    booking_time: str
    people_count: int
    duration_hours: int
    special_requirements: str | None
    status: BookingStatus
