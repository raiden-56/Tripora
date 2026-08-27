import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Moon, Search, Sun, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { StatusBadge } from "../common/StatusBadge";
import { NotificationBell } from "./NotificationBell";

export function TopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-4 px-5 md:px-8 pt-6 pb-4">
      <div>
        <h1 className="font-display text-2xl md:text-[28px] leading-tight text-ink dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-ink-soft dark:text-white/50 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-white/8 border border-ink/8 dark:border-white/10 text-ink-soft hover:text-ink dark:hover:text-white shadow-soft transition"
          aria-label="Search"
        >
          <Search size={17} />
        </button>
        <NotificationBell />
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-white/8 border border-ink/8 dark:border-white/10 text-ink-soft hover:text-ink dark:hover:text-white shadow-soft transition"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </button>
      </div>
      <AnimatePresence>
        {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}

function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const destinations = useAppStore((s) => s.destinations);
  const memories = useAppStore((s) => s.memories);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { destinations: [], memories: [] };
    return {
      destinations: destinations
        .filter((d) =>
          [d.name, d.state, d.country, d.city]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(q)),
        )
        .slice(0, 6),
      memories: memories
        .filter((m) =>
          [m.title, ...m.tags].some((v) => v.toLowerCase().includes(q)),
        )
        .slice(0, 4),
    };
  }, [query, destinations, memories]);

  return (
    <motion.div
      className="fixed inset-0 z-[1100] bg-ink/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#1c2024] rounded-2xl shadow-soft-lg border border-ink/10 dark:border-white/10 overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ink/8 dark:border-white/10">
          <Search size={18} className="text-ink-soft" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations, memories, trips…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-ink-soft/60"
          />
          <button
            onClick={onClose}
            className="text-ink-soft hover:text-ink dark:hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {query &&
            results.destinations.length === 0 &&
            results.memories.length === 0 && (
              <p className="text-sm text-ink-soft text-center py-8">
                No results for “{query}”
              </p>
            )}
          {results.destinations.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                navigate(`/app/map?dest=${d.id}`);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-ink/5 dark:hover:bg-white/5 text-left"
            >
              <MapPin size={15} className="text-forest-500 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium truncate">
                  {d.name}
                </span>
                <span className="block text-xs text-ink-soft truncate">
                  {[d.state, d.country].filter(Boolean).join(", ")}
                </span>
              </span>
              <StatusBadge status={d.status} />
            </button>
          ))}
          {results.memories.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                navigate("/app/memories");
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-ink/5 dark:hover:bg-white/5 text-left"
            >
              <img
                src={m.imageUrl}
                className="w-9 h-9 rounded-lg object-cover shrink-0"
                alt=""
              />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium truncate">
                  {m.title}
                </span>
                <span className="block text-xs text-ink-soft truncate">
                  {m.date}
                </span>
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
