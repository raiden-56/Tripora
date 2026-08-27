import clsx from "clsx";
import { Heart } from "lucide-react";
import type { MapFilters } from "../../types";

const OPTIONS: { value: MapFilters["status"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "visited", label: "Visited" },
  { value: "planned", label: "Planned" },
  { value: "wishlist", label: "Wishlist" },
  { value: "favorites", label: "Favorites" },
];

export function FilterBar({
  value,
  onChange,
}: {
  value: MapFilters["status"];
  onChange: (v: MapFilters["status"]) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition",
            value === opt.value
              ? "bg-ink text-white border-ink dark:bg-white dark:text-ink dark:border-white"
              : "bg-white dark:bg-white/8 text-ink-soft dark:text-white/60 border-ink/10 dark:border-white/10 hover:border-ink/25",
          )}
        >
          {opt.value === "favorites" && <Heart size={11} />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
