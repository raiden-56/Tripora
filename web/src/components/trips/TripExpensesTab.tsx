import { useEffect, useState } from "react";
import { Receipt, Loader2, Plus, Trash2, Users, X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { EmptyState } from "../common/EmptyState";
import * as expensesApi from "../../api/expenses.api";
import type {
  Expense,
  ExpenseSummary,
  Participant,
} from "../../api/expenses.api";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";

export function TripExpensesTab({ tripId }: { tripId: string }) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [newParticipant, setNewParticipant] = useState("");
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, e, s] = await Promise.all([
        expensesApi.listParticipants(tripId),
        expensesApi.listExpenses(tripId),
        expensesApi.getExpenseSummary(tripId),
      ]);
      setParticipants(p);
      setExpenses(e);
      setSummary(s);
    } catch {
      pushToast("Could not load trip expenses.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const addParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant.trim()) return;
    try {
      await expensesApi.addParticipant(tripId, newParticipant.trim());
      setNewParticipant("");
      load();
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Could not add participant.",
        "error",
      );
    }
  };

  const removeParticipant = async (id: number) => {
    try {
      await expensesApi.removeParticipant(tripId, id);
      load();
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Could not remove participant.",
        "error",
      );
    }
  };

  const removeExpense = async (id: number) => {
    try {
      await expensesApi.removeExpense(tripId, id);
      load();
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Could not delete expense.",
        "error",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-forest-500" size={20} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Users size={14} className="text-forest-500" />
          <p className="text-xs font-semibold text-ink-soft dark:text-white/50">
            Participants
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {participants.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink/5 dark:bg-white/10 text-xs font-medium"
            >
              {p.name}
              <button
                onClick={() => removeParticipant(p.id)}
                className="text-ink-soft hover:text-coral-500"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        {participants.length === 0 && (
          <EmptyState
            compact
            icon={<Users size={18} />}
            title="No participants yet"
            description="Add participants to start splitting expenses."
          />
        )}
        <form onSubmit={addParticipant} className="flex gap-2">
          <input
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
            placeholder="Add a participant name…"
            className={inputClass}
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-ink text-white dark:bg-white dark:text-ink text-xs font-semibold shrink-0"
          >
            Add
          </button>
        </form>
      </div>

      {summary && summary.totalSpent > 0 && (
        <div className="rounded-xl border border-ink/8 dark:border-white/10 p-3.5">
          <p className="text-xs font-semibold text-ink-soft dark:text-white/50 mb-2">
            Total spent: ₹{summary.totalSpent.toLocaleString("en-IN")}
          </p>
          <div className="flex flex-col gap-1.5 mb-3">
            {summary.balances.map((b) => (
              <div
                key={b.participantId}
                className="flex items-center justify-between text-xs"
              >
                <span>{b.participantName}</span>
                <span
                  className={
                    b.netBalance >= 0
                      ? "text-forest-600 font-semibold"
                      : "text-coral-500 font-semibold"
                  }
                >
                  {b.netBalance >= 0 ? "+" : ""}₹
                  {b.netBalance.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
          {summary.settlements.length > 0 && (
            <div className="pt-2 border-t border-ink/8 dark:border-white/10 flex flex-col gap-1">
              <p className="text-xs font-semibold text-ink-soft dark:text-white/50 mb-1">
                Settle up
              </p>
              {summary.settlements.map((s, i) => (
                <p key={i} className="text-xs">
                  <span className="font-semibold">{s.fromParticipant}</span>{" "}
                  owes <span className="font-semibold">{s.toParticipant}</span>{" "}
                  ₹{s.amount.toLocaleString("en-IN")}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-ink-soft dark:text-white/50">
            Expenses
          </p>
          <button
            onClick={() => setShowExpenseForm((v) => !v)}
            disabled={participants.length === 0}
            className="flex items-center gap-1 text-xs font-semibold text-forest-600 dark:text-forest-400 disabled:opacity-40"
          >
            <Plus size={13} /> Add Expense
          </button>
        </div>

        {showExpenseForm && (
          <ExpenseForm
            tripId={tripId}
            participants={participants}
            onDone={() => {
              setShowExpenseForm(false);
              load();
            }}
          />
        )}

        <div className="flex flex-col gap-2 mt-3">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between p-3 rounded-xl border border-ink/8 dark:border-white/10 text-sm"
            >
              <div>
                <p className="font-medium">{exp.description}</p>
                <p className="text-xs text-ink-soft dark:text-white/50">
                  {participants.find((p) => p.id === exp.paidById)?.name ??
                    "Unknown"}{" "}
                  paid · split {exp.shares.length} ways
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  ₹{exp.amount.toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => removeExpense(exp.id)}
                  className="text-ink-soft hover:text-coral-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <EmptyState
              compact
              icon={<Receipt size={18} />}
              title="No expenses yet"
              description="No expenses logged for this trip yet."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ExpenseForm({
  tripId,
  participants,
  onDone,
}: {
  tripId: string;
  participants: Participant[];
  onDone: () => void;
}) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState(participants[0]?.id ?? 0);
  const [splitBetween, setSplitBetween] = useState<Set<number>>(
    new Set(participants.map((p) => p.id)),
  );
  const [saving, setSaving] = useState(false);

  const toggle = (id: number) => {
    setSplitBetween((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!description || !amt || amt <= 0) {
      pushToast("Please add a description and a valid amount.", "error");
      return;
    }
    setSaving(true);
    try {
      await expensesApi.addExpense(tripId, {
        description,
        amount: amt,
        paidById,
        splitBetween: Array.from(splitBetween),
      });
      onDone();
    } catch (err) {
      pushToast(
        err instanceof Error ? err.message : "Could not add expense.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2.5 p-3 rounded-xl border border-ink/8 dark:border-white/10 mb-1"
    >
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className={inputClass}
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className={inputClass}
        />
        <select
          value={paidById}
          onChange={(e) => setPaidById(Number(e.target.value))}
          className={inputClass}
        >
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} paid
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-xs text-ink-soft dark:text-white/50 mb-1">
          Split between
        </p>
        <div className="flex flex-wrap gap-1.5">
          {participants.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                splitBetween.has(p.id)
                  ? "bg-forest-500 text-white border-forest-500"
                  : "border-ink/15 dark:border-white/20"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="py-2 rounded-lg bg-forest-500 text-white text-xs font-semibold disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Expense"}
      </button>
    </form>
  );
}
