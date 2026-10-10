import { Heart } from "lucide-react";
import clsx from "clsx";
import { useAppStore } from "../../store/useAppStore";
import type { Destination } from "../../types";

export function FavoriteButton({
  destination,
  className,
}: {
  destination: Destination;
  className?: string;
}) {
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const label = destination.isFavorite
    ? `Remove ${destination.name} from favorites`
    : `Add ${destination.name} to favorites`;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(destination.id);
      }}
      aria-pressed={destination.isFavorite}
      aria-label={label}
      title={label}
      className={clsx(
        "rounded-full flex items-center justify-center transition hover:scale-110",
        className,
      )}
    >
      <Heart
        size={14}
        className={
          destination.isFavorite ? "text-coral-500 fill-coral-500" : "text-ink-soft dark:text-white/70"
        }
      />
    </button>
  );
}
