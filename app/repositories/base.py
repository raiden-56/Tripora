"""Generic repository providing basic CRUD so entity repositories stay thin."""

from typing import Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    model: type[ModelType]

    def __init__(self, db: Session):
        self.db = db

    def get(self, id_: int) -> ModelType | None:
        return self.db.get(self.model, id_)

    def add(self, entity: ModelType) -> ModelType:
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def delete(self, entity: ModelType) -> None:
        self.db.delete(entity)
        self.db.commit()

    def count(self, *filters) -> int:
        stmt = select(func.count()).select_from(self.model).where(*filters)
        return self.db.scalar(stmt) or 0
