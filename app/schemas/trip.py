"""Trip + trip-plan schemas."""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.core.constants import DestinationStatus, GenerationStatus
from app.schemas.common import PatchModel


class TripBase(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    start_date: date
    end_date: date
    status: DestinationStatus = DestinationStatus.PLANNED
    cover_image_url: str | None = Field(default=None, max_length=500)
    notes: str | None = None
    drive_folder_url: str | None = Field(default=None, max_length=500)


class TripCreate(TripBase):
    destination_ids: list[int] = Field(default_factory=list, max_length=50)

    @model_validator(mode="after")
    def _dates_in_order(self) -> "TripCreate":
        if self.end_date < self.start_date:
            raise ValueError("The trip can't end before it starts.")
        return self


class TripUpdate(PatchModel):
    required_fields = frozenset({"title", "start_date", "end_date", "status", "destination_ids"})

    title: str | None = Field(default=None, min_length=1, max_length=150)
    start_date: date | None = None
    end_date: date | None = None
    status: DestinationStatus | None = None
    cover_image_url: str | None = Field(default=None, max_length=500)
    notes: str | None = None
    drive_folder_url: str | None = Field(default=None, max_length=500)
    destination_ids: list[int] | None = Field(default=None, max_length=50)


class TripOut(TripBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    destination_ids: list[int] = Field(default_factory=list)
    role: str = "owner"


class PlannerRequest(BaseModel):
    origin: str = Field(min_length=1, max_length=100)
    destination: str = Field(min_length=1, max_length=100)
    days: int = Field(ge=1, le=30)
    people: int = Field(default=1, ge=1, le=50)
    budget: float = Field(ge=0)
    travel_style: str = Field(min_length=1, max_length=50)
    interests: list[str] = Field(default_factory=list, max_length=10)


class TripPlanActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    kind: str
    description: str


class TripPlanDayOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    day_number: int
    title: str
    activities: list[TripPlanActivityOut]


class TripPlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    origin: str
    destination_name: str
    days: int
    people: int
    budget: float
    travel_style: str
    estimated_budget_min: float | None
    estimated_budget_max: float | None
    distance_km: float | None
    route_description: str | None
    status: GenerationStatus
    days_detail: list[TripPlanDayOut]
