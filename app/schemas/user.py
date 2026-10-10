"""User + profile schemas."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import UserRole
from app.schemas.common import PatchModel

Visibility = Literal["private", "friends", "public"]


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    role: UserRole
    is_active: bool


class UserProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    bio: str | None = None
    avatar_url: str | None = None
    home_location: str | None = None
    preferred_travel_style: str | None = None
    budget_preference: str | None = None
    favorite_activities: str | None = None
    trip_duration_preference: str | None = None
    group_size_preference: str | None = None
    visibility: str
    handle: str | None = None


class UserProfileUpdate(PatchModel):
    required_fields = frozenset({"visibility"})

    bio: str | None = Field(default=None, max_length=2000)
    avatar_url: str | None = Field(default=None, max_length=500)
    home_location: str | None = Field(default=None, max_length=255)
    preferred_travel_style: str | None = Field(default=None, max_length=50)
    budget_preference: str | None = Field(default=None, max_length=50)
    favorite_activities: str | None = Field(default=None, max_length=500)
    trip_duration_preference: str | None = Field(default=None, max_length=50)
    group_size_preference: str | None = Field(default=None, max_length=50)
    visibility: Visibility | None = None
