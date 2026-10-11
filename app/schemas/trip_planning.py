"""Trip checklist + planned-budget schemas."""

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
