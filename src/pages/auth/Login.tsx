import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { AuthShell } from "../../components/auth/AuthShell";
import { DEMO_CREDENTIALS, useAuthStore } from "../../store/useAuthStore";
import { useAppStore } from "../../store/useAppStore";

const inputClass =
  "w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const pushToast = useAppStore((s) => s.pushToast);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  const from = (location.state as { from?: string } | null)?.from ?? "/app";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (!result.success) {
      setError(result.error ?? "Invalid email or password.");
      return;
    }
    setError("");
    pushToast("Welcome back to TravelCanvas", "success");
    navigate(from, { replace: true });
  };

  const useDemoAccount = () => {
    setEmail(DEMO_CREDENTIALS[0].email);
    setPassword(DEMO_CREDENTIALS[0].password);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Continue your journey with TravelCanvas."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="text-xs font-medium text-coral-500 bg-coral-500/10 px-3.5 py-2.5 rounded-xl">
            {error}
          </p>
        )}

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
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
        </label>

        <label className="block">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-ink-soft">
              Password
            </span>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-forest-600 dark:text-forest-400"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink dark:hover:text-white"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-ink-soft select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="accent-forest-500 w-3.5 h-3.5"
          />
          Remember me
        </label>

        <button
          type="submit"
          className="w-full py-2.5 rounded-full bg-forest-500 text-white text-sm font-semibold hover:bg-forest-600 transition"
        >
          Login
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
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-forest-600 dark:text-forest-400"
          >
            Create account
          </Link>
        </p>
      </form>

      <div className="mt-6 p-4 rounded-2xl border border-dashed border-ink/15 dark:border-white/15 bg-ink/[0.02] dark:bg-white/5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft dark:text-white/50 mb-2">
          <Sparkles size={12} /> Demo credentials — temporary
        </p>
        <p className="text-xs text-ink-soft dark:text-white/50 mb-0.5">
          Email: {DEMO_CREDENTIALS[0].email}
        </p>
        <p className="text-xs text-ink-soft dark:text-white/50 mb-3">
          Password: {DEMO_CREDENTIALS[0].password}
        </p>
        <button
          type="button"
          onClick={useDemoAccount}
          className="w-full py-2 rounded-full bg-ink text-white dark:bg-white dark:text-ink text-xs font-semibold hover:opacity-90"
        >
          Use Demo Account
        </button>
      </div>
    </AuthShell>
  );
}
