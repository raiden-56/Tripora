"""Trip + trip-plan schemas."""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import DestinationStatus, GenerationStatus


class TripBase(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    start_date: date
    end_date: date
    status: DestinationStatus = DestinationStatus.PLANNED
    cover_image_url: str | None = None
    notes: str | None = None
    drive_folder_url: str | None = None


class TripCreate(TripBase):
    destination_ids: list[int] = Field(default_factory=list)


class TripUpdate(BaseModel):
    title: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: DestinationStatus | None = None
    cover_image_url: str | None = None
    notes: str | None = None
    drive_folder_url: str | None = None
    destination_ids: list[int] | None = None


class TripOut(TripBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    destination_ids: list[int] = Field(default_factory=list)


class PlannerRequest(BaseModel):
    origin: str
    destination: str
    days: int = Field(ge=1, le=30)
    people: int = Field(default=1, ge=1, le=50)
    budget: float = Field(ge=0)
    travel_style: str
    interests: list[str] = Field(default_factory=list)


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
