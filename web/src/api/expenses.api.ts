import { apiRequest } from "./client";

export interface Participant {
  id: number;
  tripId: string;
  name: string;
}

export interface ExpenseShare {
  participantId: number;
  shareAmount: number;
}

export interface Expense {
  id: number;
  tripId: string;
  description: string;
  category: string;
  amount: number;
  paidById: number;
  expenseDate: string | null;
  shares: ExpenseShare[];
}

export interface Balance {
  participantId: number;
  participantName: string;
  totalPaid: number;
  totalShare: number;
  netBalance: number;
}

export interface Settlement {
  fromParticipant: string;
  toParticipant: string;
  amount: number;
}

export interface ExpenseSummary {
  totalSpent: number;
  balances: Balance[];
  settlements: Settlement[];
}

interface BackendParticipant {
  id: number;
  trip_id: number;
  name: string;
}
interface BackendExpense {
  id: number;
  trip_id: number;
  description: string;
  category: string;
  amount: number;
  paid_by_id: number;
  expense_date: string | null;
  shares: { participant_id: number; share_amount: number }[];
}

const toParticipant = (p: BackendParticipant): Participant => ({
  id: p.id,
  tripId: String(p.trip_id),
  name: p.name,
});
const toExpense = (e: BackendExpense): Expense => ({
  id: e.id,
  tripId: String(e.trip_id),
  description: e.description,
  category: e.category,
  amount: e.amount,
  paidById: e.paid_by_id,
  expenseDate: e.expense_date,
  shares: e.shares.map((s) => ({
    participantId: s.participant_id,
    shareAmount: s.share_amount,
  })),
});

export async function listParticipants(tripId: string): Promise<Participant[]> {
  const result = await apiRequest<BackendParticipant[]>(
    `/api/v1/trips/${tripId}/participants`,
  );
  return result.map(toParticipant);
}

export async function addParticipant(
  tripId: string,
  name: string,
): Promise<Participant> {
  const result = await apiRequest<BackendParticipant>(
    `/api/v1/trips/${tripId}/participants`,
    { method: "POST", body: { name } },
  );
  return toParticipant(result);
}

export async function removeParticipant(
  tripId: string,
  participantId: number,
): Promise<void> {
  await apiRequest<void>(
    `/api/v1/trips/${tripId}/participants/${participantId}`,
    { method: "DELETE" },
  );
}

export async function listExpenses(tripId: string): Promise<Expense[]> {
  const result = await apiRequest<BackendExpense[]>(
    `/api/v1/trips/${tripId}/expenses`,
  );
  return result.map(toExpense);
}

export async function addExpense(
  tripId: string,
  payload: {
    description: string;
    amount: number;
    category?: string;
    paidById: number;
    expenseDate?: string;
    splitBetween?: number[];
  },
): Promise<Expense> {
  const result = await apiRequest<BackendExpense>(
    `/api/v1/trips/${tripId}/expenses`,
    {
      method: "POST",
      body: {
        description: payload.description,
        amount: payload.amount,
        category: payload.category ?? "other",
        paid_by_id: payload.paidById,
        expense_date: payload.expenseDate,
        split_between: payload.splitBetween ?? [],
      },
    },
  );
  return toExpense(result);
}

export async function removeExpense(
  tripId: string,
  expenseId: number,
): Promise<void> {
  await apiRequest<void>(`/api/v1/trips/${tripId}/expenses/${expenseId}`, {
    method: "DELETE",
  });
}

export async function getExpenseSummary(
  tripId: string,
): Promise<ExpenseSummary> {
  const result = await apiRequest<{
    total_spent: number;
    balances: Array<{
      participant_id: number;
      participant_name: string;
      total_paid: number;
      total_share: number;
      net_balance: number;
    }>;
    settlements: Array<{
      from_participant: string;
      to_participant: string;
      amount: number;
    }>;
  }>(`/api/v1/trips/${tripId}/expenses/summary/balances`);
  return {
    totalSpent: result.total_spent,
    balances: result.balances.map((b) => ({
      participantId: b.participant_id,
      participantName: b.participant_name,
      totalPaid: b.total_paid,
      totalShare: b.total_share,
      netBalance: b.net_balance,
    })),
    settlements: result.settlements.map((s) => ({
      fromParticipant: s.from_participant,
      toParticipant: s.to_participant,
      amount: s.amount,
    })),
  };
}
