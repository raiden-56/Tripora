"""Guide booking schemas."""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.core.constants import BookingStatus


class BookingCreate(BaseModel):
    booking_date: date
    booking_time: str = Field(pattern=r"^\d{2}:\d{2}$")
    people_count: int = Field(default=1, ge=1, le=50)
    duration_hours: int = Field(default=4, ge=1, le=24)
    special_requirements: str | None = Field(default=None, max_length=1000)


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
    guide_name: str | None = None
    guide_destination: str | None = None
    traveler_name: str | None = None
    reviewed: bool = False

    @model_validator(mode="before")
    @classmethod
    def _add_names(cls, data: object) -> object:
        """Lets BookingOut.model_validate(orm_booking) carry who's who for the UI."""
        guide = getattr(data, "guide", None)
        traveler = getattr(data, "traveler", None)
        if guide is None and traveler is None:
            return data
        values = {field: getattr(data, field) for field in cls.model_fields if hasattr(data, field)}
        values["guide_name"] = guide.user.name if guide is not None and guide.user is not None else None
        values["guide_destination"] = guide.destination_name if guide is not None else None
        values["traveler_name"] = traveler.name if traveler is not None else None
        values["reviewed"] = getattr(data, "review", None) is not None
        return values
