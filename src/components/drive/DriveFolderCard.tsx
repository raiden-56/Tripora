import { FolderOpen } from "lucide-react";
import type { DriveFolder } from "../../types";

export function DriveFolderCard({ folder }: { folder: DriveFolder }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-ink/8 dark:border-white/10 bg-white dark:bg-white/5">
      <div className="w-11 h-11 rounded-xl bg-sky-400/15 flex items-center justify-center text-sky-500 shrink-0">
        <FolderOpen size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{folder.name}</p>
        <p className="text-xs text-ink-soft dark:text-white/50">
          {folder.fileCount} files &middot; Google Drive
        </p>
      </div>
      <a
        href={folder.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink text-white dark:bg-white dark:text-ink shrink-0 hover:opacity-90"
      >
        Open Folder
      </a>
    </div>
  );
}
