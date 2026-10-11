"""Destination schemas."""

from datetime import date

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import DestinationStatus
from app.schemas.common import PatchModel

Priority = Literal["high", "medium", "low"]


class DestinationBase(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    country: str = Field(min_length=1, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    category: str | None = Field(default=None, max_length=50)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    status: DestinationStatus = DestinationStatus.WISHLIST
    is_favorite: bool = False
    priority: Priority | None = None
    visited_from: date | None = None
    visited_to: date | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    description: str | None = None
    notes: str | None = None
    hero_image_url: str | None = Field(default=None, max_length=500)
    google_maps_url: str | None = Field(default=None, max_length=500)
    drive_folder_url: str | None = Field(default=None, max_length=500)


class DestinationCreate(DestinationBase):
    pass


class DestinationUpdate(PatchModel):
    required_fields = frozenset({"name", "country", "latitude", "longitude", "status", "is_favorite"})

    name: str | None = Field(default=None, min_length=1, max_length=150)
    country: str | None = Field(default=None, min_length=1, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=100)
    category: str | None = Field(default=None, max_length=50)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    status: DestinationStatus | None = None
    is_favorite: bool | None = None
    priority: Priority | None = None
    visited_from: date | None = None
    visited_to: date | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    description: str | None = None
    notes: str | None = None
    hero_image_url: str | None = Field(default=None, max_length=500)
    google_maps_url: str | None = Field(default=None, max_length=500)
    drive_folder_url: str | None = Field(default=None, max_length=500)


class DestinationOut(DestinationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
