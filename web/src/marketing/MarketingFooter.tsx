import { Camera, Link2, Video, X as XIcon } from "lucide-react";
import { Logo } from "../components/common/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: ["Product", "Features", "Discover", "Stories", "Pricing"],
  },
  { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
];

export function MarketingFooter() {
  return (
    <footer className="px-6 md:px-10 py-14 border-t border-ink/8 dark:border-white/10">
      <div className="max-w-6xl mx-auto grid md:grid-cols-[1.4fr_1fr_1fr] gap-10">
        <div>
          <Logo />
          <p className="text-sm text-ink-soft dark:text-white/50 mt-3 max-w-xs">
            Your journey, beautifully mapped.
          </p>
          <div className="flex gap-3 mt-5 text-ink-soft dark:text-white/50">
            <Camera
              size={16}
              className="hover:text-ink dark:hover:text-white transition cursor-pointer"
            />
            <Video
              size={16}
              className="hover:text-ink dark:hover:text-white transition cursor-pointer"
            />
            <XIcon
              size={16}
              className="hover:text-ink dark:hover:text-white transition cursor-pointer"
            />
            <Link2
              size={16}
              className="hover:text-ink dark:hover:text-white transition cursor-pointer"
            />
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold text-ink-soft dark:text-white/40 uppercase tracking-wide mb-3">
              {col.title}
            </p>
            <ul className="flex flex-col gap-2">
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#top"
                    className="text-sm text-ink-soft dark:text-white/60 hover:text-ink dark:hover:text-white transition"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="max-w-6xl mx-auto mt-10 pt-6 border-t border-ink/8 dark:border-white/10 text-xs text-ink-soft dark:text-white/40">
        © 2026 Travel Diaries
      </p>
    </footer>
  );
}
