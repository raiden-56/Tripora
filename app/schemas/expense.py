"""Trip expense-splitting ("Splitwise-style") schemas."""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class ParticipantCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class ParticipantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    trip_id: int
    name: str


class ExpenseCreate(BaseModel):
    description: str = Field(min_length=1, max_length=200)
    amount: float = Field(gt=0)
    category: str = "other"
    paid_by_id: int
    expense_date: date | None = None
    # Participant ids to split the expense across; defaults to all trip participants if omitted.
    split_between: list[int] = Field(default_factory=list)


class ExpenseShareOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    participant_id: int
    share_amount: float


class ExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    trip_id: int
    description: str
    category: str
    amount: float
    paid_by_id: int
    expense_date: date | None
    shares: list[ExpenseShareOut]


class BalanceOut(BaseModel):
    participant_id: int
    participant_name: str
    total_paid: float
    total_share: float
    net_balance: float  # positive = is owed money, negative = owes money


class SettlementOut(BaseModel):
    from_participant: str
    to_participant: str
    amount: float


class ExpenseSummaryOut(BaseModel):
    total_spent: float
    balances: list[BalanceOut]
    settlements: list[SettlementOut]
