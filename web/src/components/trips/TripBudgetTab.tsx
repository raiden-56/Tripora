import { useEffect, useState } from "react";
import { Banknote, Pencil, Plus, Trash2 } from "lucide-react";
import * as planningApi from "../../api/tripPlanning.api";
import { useAppStore } from "../../store/useAppStore";
import type { TripBudget, TripRole } from "../../types";
import { EmptyState } from "../common/EmptyState";

const SUGGESTED = ["stay", "transport", "food", "activities", "shopping"];
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

interface DraftLine {
  category: string;
  planned: string;
}

export function TripBudgetTab({ tripId, role }: { tripId: string; role: TripRole }) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [budget, setBudget] = useState<TripBudget | null>(null);
  const [draft, setDraft] = useState<DraftLine[] | null>(null);
  const [saving, setSaving] = useState(false);
  const canEdit = role !== "viewer";

  useEffect(() => {
    let cancelled = false;
    planningApi
      .getBudget(tripId)
      .then((b) => !cancelled && setBudget(b))
      .catch((err: Error) => {
        if (!cancelled) {
          setBudget({ lines: [], totalPlanned: 0, totalSpent: 0 });
          pushToast(err.message, "error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tripId, pushToast]);

  const startEditing = () => {
    const planned = budget?.lines.filter((l) => l.planned > 0) ?? [];
    setDraft(
      planned.length > 0
        ? planned.map((l) => ({ category: l.category, planned: String(l.planned) }))
        : SUGGESTED.slice(0, 3).map((category) => ({ category, planned: "" })),
    );
  };

  const save = async () => {
    if (!draft) return;
    const items = draft
      .map((l) => ({ category: l.category.trim(), planned: Number(l.planned) }))
      .filter((l) => l.category && Number.isFinite(l.planned) && l.planned > 0);
    const names = items.map((i) => i.category.toLowerCase());
    if (new Set(names).size !== names.length) {
      pushToast("Each category can only appear once.", "error");
      return;
    }
    setSaving(true);
    try {
      setBudget(await planningApi.saveBudget(tripId, items));
      setDraft(null);
      pushToast("Budget saved", "success");
    } catch (err) {
      pushToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (budget === null) {
    return <p className="text-sm text-ink-soft dark:text-white/50">Loading budget…</p>;
  }

  if (draft) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-ink-soft dark:text-white/50 mb-1">
          Plan how much you expect to spend per category. Actual spend comes from the Expenses tab.
        </p>
        {draft.map((line, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={line.category}
              onChange={(e) =>
                setDraft(draft.map((l, j) => (j === i ? { ...l, category: e.target.value } : l)))
              }
              list="budget-categories"
              maxLength={50}
              placeholder="Category"
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400"
            />
            <input
              value={line.planned}
              onChange={(e) =>
                setDraft(draft.map((l, j) => (j === i ? { ...l, planned: e.target.value } : l)))
              }
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="₹"
              className="w-28 px-3 py-2 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400"
            />
            <button
              onClick={() => setDraft(draft.filter((_, j) => j !== i))}
              aria-label="Remove category"
              className="text-ink-soft hover:text-coral-500 px-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <datalist id="budget-categories">
          {SUGGESTED.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <button
          onClick={() => setDraft([...draft, { category: "", planned: "" }])}
          className="flex items-center gap-1.5 text-xs font-semibold text-forest-600 dark:text-forest-400 w-fit mt-1"
        >
          <Plus size={13} /> Add category
        </button>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setDraft(null)}
            className="flex-1 py-2 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 py-2 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save budget"}
          </button>
        </div>
      </div>
    );
  }

  const { lines, totalPlanned, totalSpent } = budget;
  const under = totalSpent <= totalPlanned;

  return (
    <div>
      {lines.length === 0 ? (
        <EmptyState
          compact
          icon={<Banknote size={20} />}
          title="No budget yet"
          description={
            canEdit
              ? "Set a planned amount per category and compare it with what you actually spend."
              : "The trip owner hasn't planned a budget yet."
          }
          actionLabel={canEdit ? "Plan a budget" : undefined}
          onAction={canEdit ? startEditing : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <BudgetStat label="Planned" value={totalPlanned} />
            <BudgetStat label="Spent" value={totalSpent} />
            <BudgetStat
              label={under ? "Left" : "Over"}
              value={Math.abs(totalPlanned - totalSpent)}
              accent={under ? "text-forest-600" : "text-coral-500"}
            />
          </div>
          <div className="flex flex-col gap-2">
            {lines.map((line) => {
              const pct = line.planned > 0 ? Math.min(100, (line.spent / line.planned) * 100) : 100;
              const over = line.spent > line.planned;
              return (
                <div
                  key={line.category}
                  className="p-3 rounded-xl border border-ink/8 dark:border-white/10 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">{line.category}</span>
                    <span className="text-ink-soft dark:text-white/50">
                      {rupees(line.spent)} / {line.planned > 0 ? rupees(line.planned) : "unplanned"}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-ink/8 dark:bg-white/10 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${over ? "bg-coral-500" : "bg-forest-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {canEdit && (
            <button
              onClick={startEditing}
              className="mt-4 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border border-ink/12 dark:border-white/15 hover:bg-ink/5 dark:hover:bg-white/5"
            >
              <Pencil size={12} /> Edit planned budget
            </button>
          )}
        </>
      )}
    </div>
  );
}

function BudgetStat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="py-2.5 rounded-xl bg-ink/[0.03] dark:bg-white/5 text-center">
      <p className={`font-display text-base ${accent ?? ""}`}>{rupees(value)}</p>
      <p className="text-[11px] text-ink-soft dark:text-white/50">{label}</p>
    </div>
  );
}
