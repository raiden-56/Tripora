import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FolderOpen,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";
import type { Trip } from "../../types";
import { StatusBadge } from "../common/StatusBadge";

function daysBetween(a: string, b: string) {
  return Math.max(
    1,
    Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1,
  );
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export function TripCard({
  trip,
  destinationNames,
  onEdit,
  onDelete,
  onOpen,
}: {
  trip: Trip;
  destinationNames: string;
  onEdit: () => void;
  onDelete: () => void;
  onOpen?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const countdown =
    trip.status === "planned" ? daysUntil(trip.startDate) : null;
  const checklistDone = trip.checklist?.filter((c) => c.done).length ?? 0;
  const checklistTotal = trip.checklist?.length ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft hover:shadow-soft-lg transition-shadow"
    >
      <button
        onClick={onOpen}
        disabled={!onOpen}
        className="relative h-36 w-full block text-left disabled:cursor-default"
      >
        <img
          src={trip.coverImageUrl}
          alt={trip.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 left-3">
          <StatusBadge
            status={trip.status}
            className="bg-white/90 dark:bg-black/60 backdrop-blur"
          />
        </div>
        {countdown !== null && countdown >= 0 && (
          <span className="absolute top-3 right-12 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur text-[11px] font-semibold">
            <Clock size={10} />{" "}
            {countdown === 0 ? "Today" : `${countdown}d to go`}
          </span>
        )}
        <div className="absolute bottom-3 left-4 text-white">
          <h3 className="font-display text-lg">{trip.title}</h3>
          <p className="text-xs opacity-85">{destinationNames}</p>
        </div>
      </button>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur"
      >
        <MoreVertical size={15} />
      </button>
      {menuOpen && (
        <div className="absolute top-12 right-3 bg-white dark:bg-[#242830] rounded-xl shadow-soft-lg border border-ink/10 dark:border-white/10 overflow-hidden z-10 text-sm">
          <button
            onClick={() => {
              setMenuOpen(false);
              onEdit();
            }}
            className="block w-full text-left px-4 py-2 hover:bg-ink/5 dark:hover:bg-white/5"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              onDelete();
            }}
            className="block w-full text-left px-4 py-2 text-coral-500 hover:bg-coral-500/10"
          >
            Delete
          </button>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-xs text-ink-soft dark:text-white/50 mb-1.5">
          <Calendar size={12} />
          {new Date(trip.startDate).toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
          <span>&middot; {daysBetween(trip.startDate, trip.endDate)} Days</span>
        </div>
        {trip.notes && (
          <p className="text-xs text-ink-soft dark:text-white/50 mb-2 line-clamp-2">
            {trip.notes}
          </p>
        )}
        {checklistTotal > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-ink-soft dark:text-white/50 mb-2">
            <CheckCircle2
              size={12}
              className={
                checklistDone === checklistTotal ? "text-forest-500" : ""
              }
            />
            Checklist: {checklistDone}/{checklistTotal}
          </div>
        )}
        {trip.driveFolderUrl && (
          <a
            href={trip.driveFolderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400"
          >
            <FolderOpen size={12} /> Drive Folder
          </a>
        )}
      </div>
    </motion.div>
  );
}
