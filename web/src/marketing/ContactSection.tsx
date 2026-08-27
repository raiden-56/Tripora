import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Link2, Mail, Send, Video } from "lucide-react";
import { SectionHeading } from "./shared/SectionHeading";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";

export function ContactSection() {
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="py-24 md:py-32 px-6 md:px-10 max-w-2xl mx-auto">
      <SectionHeading
        title={
          <>
            Have a question?
            <br />
            Let's talk.
          </>
        }
      />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        className="mt-12 rounded-3xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft p-6 md:p-8 flex flex-col gap-4"
      >
        {sent ? (
          <p className="text-center text-sm text-forest-600 dark:text-forest-400 py-6">
            Thanks — your message has been noted. We'll get back to you soon.
          </p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Name" className={inputClass} />
              <input
                required
                type="email"
                placeholder="Email"
                className={inputClass}
              />
            </div>
            <input required placeholder="Subject" className={inputClass} />
            <textarea
              required
              rows={4}
              placeholder="Message"
              className={inputClass}
            />
            <button
              type="submit"
              className="self-start px-6 py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition flex items-center gap-1.5"
            >
              <Send size={14} /> Send Message
            </button>
          </>
        )}
      </motion.form>

      <div className="flex items-center justify-center gap-5 mt-8 text-ink-soft dark:text-white/50">
        <a
          href="mailto:hello@traveldiaries.com"
          className="flex items-center gap-1.5 text-sm hover:text-ink dark:hover:text-white transition"
        >
          <Mail size={14} /> hello@traveldiaries.com
        </a>
        <span className="flex items-center gap-3">
          <Camera
            size={16}
            className="hover:text-ink dark:hover:text-white transition cursor-pointer"
          />
          <Video
            size={16}
            className="hover:text-ink dark:hover:text-white transition cursor-pointer"
          />
          <Link2
            size={16}
            className="hover:text-ink dark:hover:text-white transition cursor-pointer"
          />
        </span>
      </div>
    </section>
  );
}
