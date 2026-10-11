"""Shared response envelopes and pagination schemas."""

from typing import ClassVar, Generic, TypeVar

from pydantic import BaseModel, model_validator

T = TypeVar("T")


class PatchModel(BaseModel):
    """Base for partial-update bodies: every field is optional, but the ones named in
    `required_fields` back NOT NULL columns — they may be omitted, never sent as null."""

    required_fields: ClassVar[frozenset[str]] = frozenset()

    @model_validator(mode="after")
    def _reject_null_required(self):
        nulls = sorted(f for f in self.required_fields & self.model_fields_set if getattr(self, f) is None)
        if nulls:
            raise ValueError(f"{', '.join(nulls)} cannot be empty.")
        return self


class PageMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class Page(BaseModel, Generic[T]):
    data: list[T]
    meta: PageMeta


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail
