"""Splitwise-style trip expense splitting: equal/custom splits, balances, and
a greedy debt-simplification algorithm for "who owes whom" settlements."""

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.expense import TripExpense, TripParticipant
from app.repositories.expense_repository import ExpenseRepository, ParticipantRepository


class ExpenseService:
    def __init__(self, participant_repo: ParticipantRepository, expense_repo: ExpenseRepository):
        self.participants = participant_repo
        self.expenses = expense_repo

    def add_participant(self, trip_id: int, name: str) -> TripParticipant:
        return self.participants.add(TripParticipant(trip_id=trip_id, name=name.strip()))

    def list_participants(self, trip_id: int) -> list[TripParticipant]:
        return self.participants.list_for_trip(trip_id)

    def remove_participant(self, participant_id: int, trip_id: int) -> None:
        participant = self.participants.get(participant_id)
        if not participant or participant.trip_id != trip_id:
            raise NotFoundError("Participant not found.", code="PARTICIPANT_NOT_FOUND")
        self.participants.delete(participant)

    def add_expense(
        self, *, trip_id: int, description: str, amount: float, category: str,
        paid_by_id: int, expense_date, split_between: list[int],
    ) -> TripExpense:
        all_participants = self.participants.list_for_trip(trip_id)
        valid_ids = {p.id for p in all_participants}
        if paid_by_id not in valid_ids:
            raise PermissionDeniedError("The payer must be a participant on this trip.")

        targets = split_between or list(valid_ids)
        invalid = set(targets) - valid_ids
        if invalid:
            raise PermissionDeniedError("Cannot split an expense with participants outside this trip.")

        share_amount = round(amount / len(targets), 2)
        # Adjust the last share so shares always sum exactly to the total (avoids rounding drift).
        shares = [{"participant_id": pid, "share_amount": share_amount} for pid in targets]
        drift = round(amount - share_amount * len(targets), 2)
        if drift and shares:
            shares[-1]["share_amount"] = round(shares[-1]["share_amount"] + drift, 2)

        expense = TripExpense(
            trip_id=trip_id, paid_by_id=paid_by_id, description=description,
            category=category, amount=amount, expense_date=expense_date,
        )
        return self.expenses.create_with_shares(expense, shares)

    def list_expenses(self, trip_id: int) -> list[TripExpense]:
        return self.expenses.list_for_trip(trip_id)

    def remove_expense(self, expense_id: int, trip_id: int) -> None:
        expense = self.expenses.get(expense_id)
        if not expense or expense.trip_id != trip_id:
            raise NotFoundError("Expense not found.", code="EXPENSE_NOT_FOUND")
        self.expenses.delete(expense)

    def summary(self, trip_id: int) -> dict:
        participants = self.participants.list_for_trip(trip_id)
        expenses = self.expenses.list_for_trip(trip_id)

        paid: dict[int, float] = {p.id: 0.0 for p in participants}
        owed: dict[int, float] = {p.id: 0.0 for p in participants}
        for expense in expenses:
            paid[expense.paid_by_id] = paid.get(expense.paid_by_id, 0.0) + expense.amount
            for share in expense.shares:
                owed[share.participant_id] = owed.get(share.participant_id, 0.0) + share.share_amount

        names = {p.id: p.name for p in participants}
        balances = [
            {
                "participant_id": pid,
                "participant_name": names.get(pid, "Unknown"),
                "total_paid": round(paid.get(pid, 0.0), 2),
                "total_share": round(owed.get(pid, 0.0), 2),
                "net_balance": round(paid.get(pid, 0.0) - owed.get(pid, 0.0), 2),
            }
            for pid in names
        ]

        settlements = self._simplify_debts(balances)
        total_spent = round(sum(e.amount for e in expenses), 2)
        return {"total_spent": total_spent, "balances": balances, "settlements": settlements}

    @staticmethod
    def _simplify_debts(balances: list[dict]) -> list[dict]:
        """Greedy algorithm: match the largest creditor with the largest debtor
        repeatedly, minimizing the number of individual settlement transactions."""
        creditors = sorted((b for b in balances if b["net_balance"] > 0.01), key=lambda b: -b["net_balance"])
        debtors = sorted((b for b in balances if b["net_balance"] < -0.01), key=lambda b: b["net_balance"])

        creditors = [dict(c) for c in creditors]
        debtors = [dict(d) for d in debtors]
        settlements = []
        i, j = 0, 0
        while i < len(debtors) and j < len(creditors):
            debtor, creditor = debtors[i], creditors[j]
            amount = round(min(-debtor["net_balance"], creditor["net_balance"]), 2)
            if amount > 0.01:
                settlements.append(
                    {"from_participant": debtor["participant_name"], "to_participant": creditor["participant_name"], "amount": amount}
                )
                debtor["net_balance"] += amount
                creditor["net_balance"] -= amount
            if abs(debtor["net_balance"]) <= 0.01:
                i += 1
            if abs(creditor["net_balance"]) <= 0.01:
                j += 1
        return settlements
