import { Compass } from "lucide-react";

export function Logo({ light }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-forest-500 flex items-center justify-center text-white shrink-0">
        <Compass size={17} strokeWidth={2.4} />
      </div>
      <span
        className={`font-display text-lg tracking-tight ${light ? "text-white" : "text-ink dark:text-white"}`}
      >
        TravelCanvas
      </span>
    </div>
  );
}
