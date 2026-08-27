import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <section className="py-20 px-6 md:px-10 max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-2xl md:text-3xl mb-2 text-ink dark:text-white">
          Get inspired for your next journey.
        </h2>
        <p className="text-sm text-ink-soft dark:text-white/50 mb-6">
          Travel inspiration, product updates and destination ideas. No spam.
        </p>
        {subscribed ? (
          <p className="text-sm font-semibold text-forest-600 dark:text-forest-400">
            You're subscribed — see you in your inbox.
          </p>
        ) : (
          <form
            onSubmit={submit}
            className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <Mail
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 rounded-full border border-ink/12 dark:border-white/15 bg-white dark:bg-white/5 text-sm outline-none focus:border-forest-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-ink text-white dark:bg-white dark:text-ink text-sm font-semibold hover:opacity-90 transition"
            >
              Subscribe
            </button>
          </form>
        )}
      </motion.div>
    </section>
  );
}
