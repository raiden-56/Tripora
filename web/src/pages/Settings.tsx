import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellOff,
  Download,
  Globe,
  Lock,
  LogOut,
  Moon,
  ShieldOff,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";
import { resolveAvatarUrl } from "../utils/avatar";
import type { JourneyVisibility } from "../types";

const VISIBILITY_LABEL: Record<JourneyVisibility, string> = {
  private: "Private — only you can see your journey",
  friends: "Friends — visible to people you invite",
  public: "Public — visible at traveldiaries.com/ganesh",
};

const VISIBILITY_ORDER: JourneyVisibility[] = ["private", "friends", "public"];

export default function Settings() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const user = useAppStore((s) => s.user);
  const setUserVisibility = useAppStore((s) => s.setUserVisibility);
  const notificationsEnabled = useAppStore((s) => s.notificationsEnabled);
  const toggleNotifications = useAppStore((s) => s.toggleNotifications);
  const pushToast = useAppStore((s) => s.pushToast);
  const authUser = useAuthStore((s) => s.currentUser);
  const isDemoMode = useAuthStore((s) => s.isDemoMode);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const cycleVisibility = () => {
    const next =
      VISIBILITY_ORDER[
        (VISIBILITY_ORDER.indexOf(user.visibility) + 1) %
          VISIBILITY_ORDER.length
      ];
    setUserVisibility(next);
    pushToast(`Journey visibility set to ${next}`, "success");
  };

  const handleLogout = () => {
    logout();
    pushToast("You have been logged out.", "info");
    navigate("/");
  };

  const handleDataAction = (action: string) => {
    setConfirmDelete(null);
    pushToast(`${action} — this is a mock action for the demo.`, "info");
  };

  return (
    <div>
      <TopBar
        title="Settings"
        subtitle="Manage your account, privacy, and preferences."
      />
      <div className="px-5 md:px-8 pb-10 max-w-xl">
        <SectionLabel>Account</SectionLabel>
        <div className="rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 p-5 mb-6 flex items-center gap-4">
          <img
            src={resolveAvatarUrl(user.avatarUrl, authUser?.name ?? user.name)}
            alt={user.name}
            className="w-12 h-12 rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {authUser?.name ?? user.name}
            </p>
            <p className="text-xs text-ink-soft dark:text-white/50 truncate">
              {authUser?.email ?? "demo@traveldiaries.com"}
            </p>
            {isDemoMode && (
              <p className="text-[11px] text-amber-600 mt-0.5">Demo account</p>
            )}
          </div>
        </div>

        <SectionLabel>Preferences</SectionLabel>
        <div className="rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 divide-y divide-ink/8 dark:divide-white/10 mb-6">
          <Row
            icon={theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            title="Appearance"
            description={
              theme === "light" ? "Light mode is active" : "Dark mode is active"
            }
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
            icon={
              notificationsEnabled ? <Bell size={17} /> : <BellOff size={17} />
            }
            title="Notifications"
            description={
              notificationsEnabled
                ? "You will see trip reminders and milestones"
                : "Notifications are turned off"
            }
            action={
              <button
                onClick={() => {
                  toggleNotifications();
                  pushToast(
                    notificationsEnabled
                      ? "Notifications disabled"
                      : "Notifications enabled",
                    "success",
                  );
                }}
                className="px-3.5 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
              >
                {notificationsEnabled ? "Disable" : "Enable"}
              </button>
            }
          />
        </div>

        <SectionLabel>Privacy</SectionLabel>
        <div className="rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 divide-y divide-ink/8 dark:divide-white/10 mb-6">
          <Row
            icon={
              user.visibility === "public" ? (
                <Globe size={17} />
              ) : user.visibility === "friends" ? (
                <Users size={17} />
              ) : (
                <Lock size={17} />
              )
            }
            title="Journey Privacy"
            description={VISIBILITY_LABEL[user.visibility]}
            action={
              <button
                onClick={cycleVisibility}
                className="px-3.5 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5 capitalize"
              >
                {user.visibility} &rarr;
              </button>
            }
          />
        </div>

        <SectionLabel>Connected Accounts</SectionLabel>
        <div className="rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 p-5 mb-6">
          <h3 className="font-semibold text-sm mb-1">
            Google Drive Integration
          </h3>
          <p className="text-xs text-ink-soft dark:text-white/50 mb-3">
            Connect your Google account to sync Drive folders automatically.
            Currently running in mock mode.
          </p>
          <button
            onClick={() =>
              pushToast("Google Drive connected (mock).", "success")
            }
            className="px-3.5 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
          >
            Connect Google Drive
          </button>
        </div>

        <SectionLabel>Data &amp; Privacy</SectionLabel>
        <div className="rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 divide-y divide-ink/8 dark:divide-white/10 mb-6">
          <Row
            icon={<Download size={17} />}
            title="Export Data"
            description="Download a copy of your destinations, trips, and memories"
            action={
              <button
                onClick={() => handleDataAction("Data export started")}
                className="px-3.5 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
              >
                Export
              </button>
            }
          />
          <Row
            icon={<ShieldOff size={17} />}
            title="Disconnect Google Drive"
            description="Remove access to your linked Drive folders"
            action={
              <button
                onClick={() => handleDataAction("Google Drive disconnected")}
                className="px-3.5 py-1.5 rounded-full border border-ink/15 dark:border-white/20 text-xs font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
              >
                Disconnect
              </button>
            }
          />
          <Row
            icon={<Trash2 size={17} className="text-coral-500" />}
            title="Delete Journey"
            description="Permanently remove all destinations, trips, and memories"
            action={
              <button
                onClick={() => setConfirmDelete("Journey deleted")}
                className="px-3.5 py-1.5 rounded-full border border-coral-500/30 text-coral-500 text-xs font-semibold hover:bg-coral-500/10"
              >
                Delete
              </button>
            }
          />
          <Row
            icon={<Trash2 size={17} className="text-coral-500" />}
            title="Delete Account"
            description="Permanently delete your Travel Diaries account"
            action={
              <button
                onClick={() => setConfirmDelete("Account deleted")}
                className="px-3.5 py-1.5 rounded-full border border-coral-500/30 text-coral-500 text-xs font-semibold hover:bg-coral-500/10"
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

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[1200] bg-ink/40 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#1c2024] rounded-2xl shadow-soft-lg p-6"
          >
            <h3 className="font-display text-lg mb-2">Are you sure?</h3>
            <p className="text-sm text-ink-soft dark:text-white/50 mb-5">
              This action cannot be undone in a real deployment. This demo will
              not actually delete your data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-full border border-ink/15 dark:border-white/20 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDataAction(confirmDelete)}
                className="flex-1 py-2.5 rounded-full bg-coral-500 text-white text-sm font-semibold hover:opacity-90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
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
        <p className="text-xs text-ink-soft dark:text-white/50 truncate">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
