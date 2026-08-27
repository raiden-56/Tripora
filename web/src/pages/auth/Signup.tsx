import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";
import { AuthShell } from "../../components/auth/AuthShell";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppStore } from "../../store/useAppStore";

const inputClass =
  "w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";

export default function Signup() {
  const navigate = useNavigate();
  const signup = useAuthStore((s) => s.signup);
  const pushToast = useAppStore((s) => s.pushToast);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const result = await signup({ firstName, lastName, email, password });
    if (!result.success) {
      setError(result.error ?? "Could not create your account.");
      return;
    }
    setError("");
    pushToast("Account created — let's build your travel map.", "success");
    navigate("/onboarding", { replace: true });
  };

  return (
    <AuthShell
      title="Create your journey"
      subtitle="Start mapping everywhere you've been and everywhere you're going."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="text-xs font-medium text-coral-500 bg-coral-500/10 px-3.5 py-2.5 rounded-xl">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              First name
            </span>
            <div className="relative">
              <User
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                placeholder="Ganesh"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
              Last name
            </span>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400"
              placeholder="Kumar"
            />
          </label>
        </div>

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
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
            Password
          </span>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-ink-soft mb-1.5 block">
            Confirm password
          </span>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
        </label>

        <button
          type="submit"
          className="w-full py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
        >
          Create Account
        </button>

        <div className="flex items-center gap-3 text-xs text-ink-soft my-1">
          <div className="h-px flex-1 bg-ink/10 dark:bg-white/10" /> OR{" "}
          <div className="h-px flex-1 bg-ink/10 dark:bg-white/10" />
        </div>

        <button
          type="button"
          onClick={() =>
            pushToast("Google sign-in is mocked in this demo.", "info")
          }
          className="w-full py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5 transition"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() =>
            pushToast("Apple sign-in is mocked in this demo.", "info")
          }
          className="w-full py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5 transition"
        >
          Continue with Apple
        </button>

        <p className="text-center text-sm text-ink-soft dark:text-white/50 mt-1">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-forest-600 dark:text-forest-400"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
