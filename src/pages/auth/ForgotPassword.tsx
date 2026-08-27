import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { AuthShell } from "../../components/auth/AuthShell";
import { useAuthStore } from "../../store/useAuthStore";

export default function ForgotPassword() {
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(requestPasswordReset(email));
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {sent ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft dark:text-white/60 bg-forest-50 dark:bg-forest-500/10 px-4 py-3 rounded-xl">
            {sent}
          </p>
          <Link
            to="/login"
            className="w-full text-center py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              Email
            </span>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400"
              />
            </div>
          </label>
          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
          >
            Send Reset Link
          </button>
          <Link
            to="/login"
            className="text-center text-sm font-semibold text-ink-soft dark:text-white/50 hover:text-ink dark:hover:text-white"
          >
            Back to Login
          </Link>
        </form>
      )}
    </AuthShell>
  );
}
