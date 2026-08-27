"""Pagination query-param parsing shared by all list endpoints."""

from fastapi import Query

from app.core.constants import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE


class PaginationParams:
    def __init__(
        self,
        page: int = Query(default=1, ge=1),
        page_size: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    ):
        self.page = page
        self.page_size = page_size


def build_page_meta(total: int, page: int, page_size: int) -> dict:
    total_pages = max(1, (total + page_size - 1) // page_size)
    return {"page": page, "page_size": page_size, "total": total, "total_pages": total_pages}
