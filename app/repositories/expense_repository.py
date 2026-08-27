"""Trip expense persistence."""

from sqlalchemy import select

from app.models.expense import TripExpense, TripExpenseShare, TripParticipant
from app.repositories.base import BaseRepository


class ParticipantRepository(BaseRepository[TripParticipant]):
    model = TripParticipant

    def list_for_trip(self, trip_id: int) -> list[TripParticipant]:
        stmt = select(TripParticipant).where(TripParticipant.trip_id == trip_id).order_by(TripParticipant.id)
        return list(self.db.scalars(stmt).all())


class ExpenseRepository(BaseRepository[TripExpense]):
    model = TripExpense

    def list_for_trip(self, trip_id: int) -> list[TripExpense]:
        stmt = select(TripExpense).where(TripExpense.trip_id == trip_id).order_by(TripExpense.created_at.desc())
        return list(self.db.scalars(stmt).all())

    def create_with_shares(self, expense: TripExpense, shares: list[dict]) -> TripExpense:
        self.db.add(expense)
        self.db.flush()
        for share in shares:
            self.db.add(
                TripExpenseShare(
                    expense_id=expense.id,
                    participant_id=share["participant_id"],
                    share_amount=share["share_amount"],
                )
            )
        self.db.commit()
        self.db.refresh(expense)
        return expense
