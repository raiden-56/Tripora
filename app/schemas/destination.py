"""Destination schemas."""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import DestinationStatus


class DestinationBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    country: str = Field(min_length=1, max_length=100)
    state: str | None = None
    city: str | None = None
    category: str | None = None
    latitude: float
    longitude: float
    status: DestinationStatus = DestinationStatus.WISHLIST
    is_favorite: bool = False
    priority: str | None = None
    visited_from: date | None = None
    visited_to: date | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    description: str | None = None
    notes: str | None = None
    hero_image_url: str | None = None
    google_maps_url: str | None = None


class DestinationCreate(DestinationBase):
    pass


class DestinationUpdate(BaseModel):
    name: str | None = None
    country: str | None = None
    state: str | None = None
    city: str | None = None
    category: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    status: DestinationStatus | None = None
    is_favorite: bool | None = None
    priority: str | None = None
    visited_from: date | None = None
    visited_to: date | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    description: str | None = None
    notes: str | None = None
    hero_image_url: str | None = None
    google_maps_url: str | None = None


class DestinationOut(DestinationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
