import clsx from "clsx";
import type { DestinationStatus } from "../../types";

const STYLES: Record<DestinationStatus, string> = {
  visited:
    "bg-forest-50 text-forest-600 dark:bg-forest-500/15 dark:text-forest-400",
  planned: "bg-sky-400/10 text-sky-600 dark:text-sky-400",
  wishlist: "bg-amber-400/15 text-amber-600 dark:text-amber-400",
};

const LABELS: Record<DestinationStatus, string> = {
  visited: "Visited",
  planned: "Planned",
  wishlist: "Wishlist",
};

export function StatusBadge({
  status,
  className,
}: {
  status: DestinationStatus;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        STYLES[status],
        className,
      )}
    >
      <span
        className={clsx("w-1.5 h-1.5 rounded-full", {
          "bg-forest-500": status === "visited",
          "bg-sky-500": status === "planned",
          "bg-amber-500": status === "wishlist",
        })}
      />
      {LABELS[status]}
    </span>
  );
}
