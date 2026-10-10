import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Bell,
  BellOff,
  Download,
  FolderOpen,
  Globe,
  Lock,
  LogOut,
  Moon,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import * as usersApi from "../api/users.api";
import { resolveAvatarUrl } from "../utils/avatar";
import { todayIso } from "../utils/dates";
import type { JourneyVisibility } from "../types";

const VISIBILITY_OPTIONS: { value: JourneyVisibility; label: string; icon: React.ReactNode }[] = [
  { value: "private", label: "Private", icon: <Lock size={14} /> },
  { value: "friends", label: "Friends", icon: <Users size={14} /> },
  { value: "public", label: "Public", icon: <Globe size={14} /> },
];

export default function Settings() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const user = useAppStore((s) => s.user);
  const setUserVisibility = useAppStore((s) => s.setUserVisibility);
  const toggleNotifications = useAppStore((s) => s.toggleNotifications);
  const pushToast = useAppStore((s) => s.pushToast);
  const authUser = useAuthStore((s) => s.currentUser);
  const isDemoMode = useAuthStore((s) => s.isDemoMode);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const publicUrl = user.handle ? `${window.location.origin}/u/${user.handle}` : null;
  const visibilityDescription: Record<JourneyVisibility, string> = {
    private: "Only you can see your journey.",
    friends: "Friends-only sharing isn't available yet, so this works like private for now.",
    public: publicUrl ? `Anyone with the link can view it: ${publicUrl}` : "Anyone with your link can view it.",
  };

  const changeVisibility = async (next: JourneyVisibility) => {
    if (next === user.visibility) return;
    if (await setUserVisibility(next)) pushToast(`Your journey is now ${next}`, "success");
  };

  const changeNotifications = async () => {
    const enabling = !user.notificationsEnabled;
    if (await toggleNotifications()) {
      pushToast(enabling ? "Notifications enabled" : "Notifications disabled", "success");
    }
  };

  const handleLogout = () => {
    logout();
    pushToast("You have been logged out.", "info");
    navigate("/");
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const data = await usersApi.exportMyData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `travel-diaries-export-${todayIso()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      pushToast("Your data has been downloaded", "success");
    } catch (err) {
      pushToast((err as Error).message, "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <TopBar title="Settings" subtitle="Manage your account, privacy, and preferences." />
      <div className="px-5 md:px-8 pb-10 max-w-xl">
        <SectionLabel>Account</SectionLabel>
        <div className="rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 p-5 mb-6 flex items-center gap-4">
          <img
            src={resolveAvatarUrl(user.avatarUrl, user.name || authUser?.name || "")}
            alt={user.name}
            className="w-12 h-12 rounded-2xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{user.name || authUser?.name}</p>
            <p className="text-xs text-ink-soft dark:text-white/50 truncate">
              {user.email || authUser?.email}
            </p>
            {isDemoMode && <p className="text-[11px] text-amber-600 mt-0.5">Demo account</p>}
          </div>
          <Link
            to="/app/profile"
            className="px-3.5 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
          >
            Edit profile
          </Link>
        </div>

        <SectionLabel>Preferences</SectionLabel>
        <div className="rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 divide-y divide-ink/8 dark:divide-white/10 mb-6">
          <Row
            icon={theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            title="Appearance"
            description={theme === "light" ? "Light mode is active" : "Dark mode is active"}
            action={
              <button
                onClick={toggleTheme}
                className="px-3.5 py-1.5 rounded-full bg-ink text-white dark:bg-white dark:text-ink text-xs font-semibold"
              >
                Switch to {theme === "light" ? "Dark" : "Light"}
              </button>
            }
          />
          <Row
            icon={user.notificationsEnabled ? <Bell size={17} /> : <BellOff size={17} />}
            title="Notifications"
            description={
              user.notificationsEnabled
                ? "Trip invites, bookings and finished stories"
                : "Notifications are turned off"
            }
            action={
              <button
                onClick={changeNotifications}
                className="px-3.5 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
              >
                {user.notificationsEnabled ? "Disable" : "Enable"}
              </button>
            }
          />
        </div>

        <SectionLabel>Journey Privacy</SectionLabel>
        <div className="rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 p-5 mb-6">
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Journey visibility">
            {VISIBILITY_OPTIONS.map((o) => (
              <button
                key={o.value}
                role="radio"
                aria-checked={user.visibility === o.value}
                onClick={() => changeVisibility(o.value)}
                className={clsx(
                  "flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition",
                  user.visibility === o.value
                    ? "bg-forest-500 border-forest-500 text-white"
                    : "border-ink/12 dark:border-white/15 hover:border-forest-400",
                )}
              >
                {o.icon} {o.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-soft dark:text-white/50 mt-3 break-words">
            {visibilityDescription[user.visibility]}
          </p>
          {user.visibility === "public" && user.handle && (
            <Link
              to={`/u/${user.handle}`}
              className="inline-block mt-2 text-xs font-semibold text-forest-600 dark:text-forest-400"
            >
              View my public journey →
            </Link>
          )}
        </div>

        <SectionLabel>Google Drive</SectionLabel>
        <div className="rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 p-5 mb-6 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-white/10 text-forest-500 flex items-center justify-center shrink-0">
            <FolderOpen size={17} />
          </div>
          <p className="text-xs text-ink-soft dark:text-white/50">
            Link a Drive folder to any destination or trip from its edit form — it opens straight from
            the place. Automatic Drive sync isn't available yet.
          </p>
        </div>

        <SectionLabel>Your Data</SectionLabel>
        <div className="rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 divide-y divide-ink/8 dark:divide-white/10 mb-6">
          <Row
            icon={<Download size={17} />}
            title="Export Data"
            description="Download your destinations, trips and memories as JSON"
            action={
              <button
                onClick={exportData}
                disabled={exporting}
                className="px-3.5 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5 disabled:opacity-50"
              >
                {exporting ? "Preparing…" : "Export"}
              </button>
            }
          />
          <Row
            icon={<Trash2 size={17} className="text-coral-500" />}
            title="Delete Account"
            description={
              isDemoMode
                ? "The shared demo account can't be deleted"
                : "Permanently delete your account and everything in it"
            }
            action={
              <button
                onClick={() => setDeleteOpen(true)}
                disabled={isDemoMode}
                className="px-3.5 py-1.5 rounded-full border border-coral-500/30 text-coral-500 text-xs font-semibold hover:bg-coral-500/10 disabled:opacity-40"
              >
                Delete
              </button>
            }
          />
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-ink/12 dark:border-white/15 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5 transition"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {deleteOpen && (
        <DeleteAccountDialog
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => {
            logout();
            navigate("/");
            pushToast("Your account has been deleted.", "info");
          }}
        />
      )}
    </div>
  );
}

function DeleteAccountDialog({ onClose, onDeleted }: { onClose: () => void; onDeleted: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await usersApi.deleteMyAccount(password);
      onDeleted();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1200] bg-ink/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-[#1c2024] rounded-2xl shadow-soft-lg p-6"
      >
        <h3 className="font-display text-lg mb-2">Delete your account?</h3>
        <p className="text-sm text-ink-soft dark:text-white/50 mb-4">
          Every destination, trip, memory and photo is permanently deleted. This can't be undone —
          consider exporting your data first.
        </p>
        <label className="block mb-1">
          <span className="text-xs font-semibold text-ink-soft mb-1 block">Confirm with your password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
            className="w-full px-3.5 py-2.5 rounded-xl border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-coral-400"
          />
        </label>
        {error && <p className="text-xs text-coral-500 mb-2">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!password || busy}
            className="flex-1 py-2.5 rounded-full bg-coral-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Deleting…" : "Delete forever"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold text-ink-soft dark:text-white/40 uppercase tracking-wide mb-2 mt-1">
      {children}
    </h3>
  );
}

function Row({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-5">
      <div className="w-10 h-10 rounded-xl bg-forest-50 dark:bg-white/10 text-forest-500 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-ink-soft dark:text-white/50">{description}</p>
      </div>
      {action}
    </div>
  );
}
