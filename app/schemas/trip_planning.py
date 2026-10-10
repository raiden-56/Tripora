"""Trip checklist, planned-budget and itinerary schemas."""

from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import PatchModel


class ChecklistItemCreate(BaseModel):
    text: str = Field(min_length=1, max_length=200)


class ChecklistItemUpdate(PatchModel):
    required_fields = frozenset({"text", "is_done"})

    text: str | None = Field(default=None, min_length=1, max_length=200)
    is_done: bool | None = None


class ChecklistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    text: str
    is_done: bool
    position: int


class BudgetItemIn(BaseModel):
    category: str = Field(min_length=1, max_length=50)
    planned_amount: float = Field(ge=0, le=100_000_000)


class BudgetUpdate(BaseModel):
    items: list[BudgetItemIn] = Field(max_length=30)

    @field_validator("items")
    @classmethod
    def _unique_categories(cls, items: list[BudgetItemIn]) -> list[BudgetItemIn]:
        seen: set[str] = set()
        for item in items:
            key = item.category.strip().lower()
            if key in seen:
                raise ValueError(f"Category '{item.category}' is listed twice.")
            seen.add(key)
        return items


class BudgetLineOut(BaseModel):
    category: str
    planned_amount: float
    spent: float


class BudgetOut(BaseModel):
    lines: list[BudgetLineOut]
    total_planned: float
    total_spent: float


ItineraryKind = Literal["place", "activity", "food", "transport", "stay"]
TIME_PATTERN = r"^([01]\d|2[0-3]):[0-5]\d$"
MAX_ITINERARY_DAYS = 60


class ItineraryItemCreate(BaseModel):
    day_number: int = Field(ge=1, le=MAX_ITINERARY_DAYS)
    title: str = Field(min_length=1, max_length=200)
    kind: ItineraryKind = "activity"
    start_time: str | None = Field(default=None, pattern=TIME_PATTERN)
    notes: str | None = Field(default=None, max_length=2000)
    cost: float | None = Field(default=None, ge=0, le=100_000_000)


class ItineraryItemUpdate(PatchModel):
    required_fields = frozenset({"day_number", "title", "kind"})

    day_number: int | None = Field(default=None, ge=1, le=MAX_ITINERARY_DAYS)
    title: str | None = Field(default=None, min_length=1, max_length=200)
    kind: ItineraryKind | None = None
    start_time: str | None = Field(default=None, pattern=TIME_PATTERN)
    notes: str | None = Field(default=None, max_length=2000)
    cost: float | None = Field(default=None, ge=0, le=100_000_000)


class ItineraryItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    day_number: int
    position: int
    start_time: str | None
    title: str
    kind: str
    notes: str | None
    cost: float | None


class ItineraryDayOut(BaseModel):
    day_number: int
    date: date
    title: str | None
    items: list[ItineraryItemOut]


class ItineraryOut(BaseModel):
    days: list[ItineraryDayOut]
    total_cost: float


class DayTitleUpdate(BaseModel):
    title: str = Field(max_length=200)  # empty clears it


class DayOrder(BaseModel):
    day_number: int = Field(ge=1, le=MAX_ITINERARY_DAYS)
    item_ids: list[int] = Field(max_length=200)


class ItineraryOrderUpdate(BaseModel):
    days: list[DayOrder] = Field(max_length=MAX_ITINERARY_DAYS)


class ImportPlanRequest(BaseModel):
    plan_id: int
    mode: Literal["replace", "append"] = "replace"
