import { motion } from "framer-motion";
import {
  ArrowDown,
  FileText,
  FolderOpen,
  Image,
  Ticket,
  Video,
} from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";
import { Logo } from "../components/common/Logo";

const FILE_TYPES = [
  { icon: Image, label: "Photos" },
  { icon: Video, label: "Videos" },
  { icon: FileText, label: "Documents" },
  { icon: Ticket, label: "Tickets" },
];

export function DriveSection({ onConnect }: { onConnect: () => void }) {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
      <div>
        <SectionHeading
          align="left"
          eyebrow="Google Drive"
          title="Your photos. Your files. Your memories."
          description="Connect the folders you already use and keep your travel memories organized by destination."
        />
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          onClick={onConnect}
          className="mt-8 px-6 py-3 rounded-full bg-forest-500 text-white text-sm font-semibold shadow-soft hover:bg-forest-600 transition"
        >
          Connect Your Memories
        </motion.button>
        <p className="text-xs text-ink-soft dark:text-white/40 mt-3">
          Integration-ready — no Google account required to preview.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl border border-ink/8 dark:border-white/10 bg-white dark:bg-[#1c2024] shadow-soft-lg p-7 flex flex-col items-center gap-3"
      >
        <Logo />
        <ArrowDown size={16} className="text-ink-soft dark:text-white/30" />
        <span className="px-4 py-1.5 rounded-full bg-forest-50 dark:bg-white/10 text-forest-600 dark:text-forest-400 text-sm font-semibold">
          Coorg
        </span>
        <ArrowDown size={16} className="text-ink-soft dark:text-white/30" />
        <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-400/10 text-sky-600 dark:text-sky-400 text-sm font-semibold">
          <FolderOpen size={14} /> Google Drive
        </span>
        <div className="grid grid-cols-4 gap-3 mt-2 w-full">
          {FILE_TYPES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-ink/[0.03] dark:bg-white/5"
            >
              <f.icon size={16} className="text-ink-soft dark:text-white/60" />
              <span className="text-[10px] font-medium text-ink-soft dark:text-white/50">
                {f.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
