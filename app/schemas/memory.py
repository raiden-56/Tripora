"""Memory schemas."""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.utils.validators import csv_to_list


class MemoryBase(BaseModel):
    destination_id: int
    trip_id: int | None = None
    title: str = Field(min_length=1, max_length=150)
    description: str | None = None
    memory_date: date
    tags: list[str] = Field(default_factory=list)


class MemoryCreate(MemoryBase):
    pass


class MemoryUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    memory_date: date | None = None
    tags: list[str] | None = None


class MemoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    destination_id: int
    trip_id: int | None
    title: str
    description: str | None
    memory_date: date
    tags: list[str] = Field(default_factory=list)

    @field_validator("tags", mode="before")
    @classmethod
    def _split_csv_tags(cls, value: object) -> object:
        """The ORM model stores tags as a comma-separated string, or NULL when
        empty (Memory.tags); this lets model_validate(memory_instance) work
        directly instead of raising because a str/None isn't a list[str]."""
        return csv_to_list(value) if value is None or isinstance(value, str) else value
