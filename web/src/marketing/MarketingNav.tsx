import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "../components/common/Logo";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Discover", href: "#discover" },
  { label: "Stories", href: "#stories" },
  { label: "Pricing", href: "#pricing" },
];

export function MarketingNav({
  onLogin,
  onStartJourney,
}: {
  onLogin: () => void;
  onStartJourney: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 inset-x-0 z-[200] transition-all duration-300 ${
        scrolled
          ? "bg-paper/80 dark:bg-[#14171a]/80 backdrop-blur-lg border-b border-ink/8 dark:border-white/10 shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <a href="#top" aria-label="Travel Diaries home">
          <Logo />
        </a>
        <nav className="hidden lg:flex items-center gap-7">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-sm font-medium text-ink-soft dark:text-white/60 hover:text-ink dark:hover:text-white transition-colors group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-forest-500 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm font-semibold text-ink-soft dark:text-white/60 hover:text-ink dark:hover:text-white transition"
          >
            Login
          </button>
          <button
            onClick={onStartJourney}
            className="px-4 py-2 rounded-full bg-ink text-white dark:bg-white dark:text-ink text-sm font-semibold hover:opacity-90 transition active:scale-95"
          >
            Start Your Journey
          </button>
        </div>
        <button
          className="lg:hidden text-ink dark:text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-paper dark:bg-[#14171a] border-t border-ink/8 dark:border-white/10 px-6 py-5 flex flex-col gap-4"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-ink-soft dark:text-white/70"
            >
              {l.label}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onLogin}
              className="flex-1 py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold"
            >
              Login
            </button>
            <button
              onClick={onStartJourney}
              className="flex-1 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold"
            >
              Start Your Journey
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
