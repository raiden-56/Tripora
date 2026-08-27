import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Camera, Compass, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../common/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper dark:bg-[#14171a] flex">
      <div className="hidden lg:flex flex-col justify-between w-[42%] p-10 bg-gradient-to-br from-forest-500 to-forest-600 text-white relative overflow-hidden">
        <Compass
          className="absolute -right-10 -bottom-10 opacity-15"
          size={280}
          strokeWidth={1}
        />
        <Link to="/">
          <Logo light />
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h2 className="font-display text-3xl leading-tight mb-3">
            Your entire travel journey, beautifully mapped.
          </h2>
          <p className="text-white/80 text-sm max-w-sm">
            Remember where you've been. Plan where you're going.
          </p>
        </motion.div>
        <div className="relative z-10 flex gap-6 text-sm text-white/80">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} /> 37 destinations
          </span>
          <span className="flex items-center gap-1.5">
            <Camera size={14} /> 1,284 memories
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden mb-8">
            <Link to="/">
              <Logo />
            </Link>
          </div>
          <h1 className="font-display text-2xl md:text-3xl text-ink dark:text-white mb-1.5">
            {title}
          </h1>
          <p className="text-sm text-ink-soft dark:text-white/50 mb-8">
            {subtitle}
          </p>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
