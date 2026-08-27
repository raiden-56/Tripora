import { motion } from "framer-motion";
import { ArrowRight, FileText, FolderOpen, Image, MapPin } from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";
import { Logo } from "../components/common/Logo";

const DISCONNECTED = [
  { icon: Image, title: "Phone Gallery", desc: "Photos without context." },
  { icon: FolderOpen, title: "Google Drive", desc: "Files without stories." },
  { icon: MapPin, title: "Maps", desc: "Places without memories." },
  { icon: FileText, title: "Notes", desc: "Stories without locations." },
];

export function WhySection() {
  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto">
      <SectionHeading title="Because your travel history deserves more than a camera roll." />
      <div className="flex flex-col lg:flex-row items-center gap-6 mt-14">
        <div className="grid grid-cols-2 gap-4 flex-1 w-full">
          {DISCONNECTED.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft"
            >
              <d.icon
                size={18}
                className="text-ink-soft dark:text-white/50 mb-3"
              />
              <p className="font-semibold text-sm">{d.title}</p>
              <p className="text-xs text-ink-soft dark:text-white/50 mt-0.5">
                {d.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="shrink-0"
        >
          <ArrowRight
            size={26}
            className="text-ink-soft dark:text-white/30 rotate-90 lg:rotate-0"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex-1 w-full p-8 rounded-3xl bg-gradient-to-br from-forest-500 to-forest-600 text-white shadow-soft-lg"
        >
          <Logo light />
          <h3 className="font-display text-2xl mt-5 mb-1.5">
            Places + Memories + Stories + Plans
          </h3>
          <p className="text-sm text-white/80">Everything connected.</p>
        </motion.div>
      </div>
    </section>
  );
}
