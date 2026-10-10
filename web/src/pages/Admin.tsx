import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import clsx from "clsx";
import { BadgeCheck, Search, ShieldAlert } from "lucide-react";
import { TopBar } from "../components/layout/TopBar";
import { BarChart, HorizontalBarList } from "../components/stats/Charts";
import { EmptyState } from "../components/common/EmptyState";
import * as adminApi from "../api/admin.api";
import type { AdminReport, AdminUser, UserRole } from "../api/admin.api";
import type { Booking, Guide } from "../api/guides.api";
import { useAppStore } from "../store/useAppStore";
import { confirmAction } from "../store/useConfirmStore";
import { formatDate } from "../utils/dates";

type Tab = "overview" | "users" | "guides" | "bookings";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "guides", label: "Guides" },
  { id: "bookings", label: "Bookings" },
];

export default function Admin() {
  const role = useAppStore((s) => s.user.role);
  const dataLoaded = useAppStore((s) => s.dataLoaded);
  const [tab, setTab] = useState<Tab>("overview");

  if (dataLoaded && role !== "ADMIN") return <Navigate to="/app" replace />;

  return (
    <div>
      <TopBar title="Admin" subtitle="Users, guides, bookings and how the app is being used." />
      <div className="px-5 md:px-8 pb-10">
        <div className="flex gap-1.5 mb-6 bg-ink/5 dark:bg-white/5 p-1 rounded-full w-fit overflow-x-auto max-w-full">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-semibold transition shrink-0",
                tab === t.id ? "bg-white dark:bg-[#1c2024] shadow-soft" : "text-ink-soft dark:text-white/50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {role === "ADMIN" &&
          (tab === "overview" ? (
            <Overview />
          ) : tab === "users" ? (
            <Users />
          ) : tab === "guides" ? (
            <Guides />
          ) : (
            <Bookings />
          ))}
      </div>
    </div>
  );
}

function useLoad<T>(load: () => Promise<T>) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    let cancelled = false;
    load()
      .then((d) => !cancelled && setData(d))
      .catch((err: Error) => !cancelled && pushToast(err.message, "error"));
    return () => {
      cancelled = true;
    };
  }, [load, pushToast]);
  return [data, setData] as const;
}

function Tile({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft">
      <p className="text-xs font-semibold text-ink-soft dark:text-white/50 uppercase tracking-wide">{label}</p>
      <p className="font-display text-3xl mt-1">{value.toLocaleString("en-IN")}</p>
      {hint && <p className="text-xs text-ink-soft dark:text-white/50 mt-0.5">{hint}</p>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 shadow-soft">
      <h3 className="font-display text-lg mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Overview() {
  const [report] = useLoad<AdminReport>(adminApi.getReport);
  if (!report) return <p className="text-sm text-ink-soft">Loading report…</p>;

  const monthLabel = (ym: string) => {
    const [y, m] = ym.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile label="Users" value={report.totalUsers} hint={`${report.newUsers30d} new in 30 days`} />
        <Tile label="Active users" value={report.activeUsers} hint={`${report.totalUsers - report.activeUsers} deactivated`} />
        <Tile label="Destinations" value={report.totalDestinations} />
        <Tile label="Trips" value={report.totalTrips} />
        <Tile label="Memories" value={report.totalMemories} hint={`${report.totalPhotos} photos`} />
        <Tile label="Community posts" value={report.totalPosts} />
        <Tile label="Guides" value={report.totalGuides} hint={`${report.unverifiedGuides} awaiting verification`} />
        <Tile label="Bookings" value={report.totalBookings} />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Sign-ups by month">
          <BarChart data={report.signupsByMonth.map((m) => ({ label: monthLabel(m.name), value: m.count }))} />
        </Card>
        <Card title="Most-added places">
          {report.popularDestinations.length ? (
            <HorizontalBarList data={report.popularDestinations.map((d) => ({ label: d.name, value: d.count }))} />
          ) : (
            <p className="text-sm text-ink-soft">No destinations yet.</p>
          )}
        </Card>
        <Card title="Most-visited states">
          {report.popularStates.length ? (
            <HorizontalBarList data={report.popularStates.map((d) => ({ label: d.name, value: d.count }))} />
          ) : (
            <p className="text-sm text-ink-soft">No states recorded yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Users() {
  const pushToast = useAppStore((s) => s.pushToast);
  const myId = useAppStore((s) => s.user.id);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [page, setPage] = useState(1);
  const load = useCallback(() => adminApi.listUsers({ search: query, role: roleFilter, page }), [query, roleFilter, page]);
  const [result, setResult] = useLoad(load);

  const replace = (updated: AdminUser) =>
    setResult((r) => (r ? { ...r, users: r.users.map((u) => (u.id === updated.id ? updated : u)) } : r));

  const toggleActive = async (u: AdminUser) => {
    if (
      u.isActive &&
      !(await confirmAction({
        title: `Deactivate ${u.name}?`,
        message: "They're signed out everywhere and can't log in until you reactivate the account. Nothing is deleted.",
        confirmLabel: "Deactivate",
        danger: true,
      }))
    )
      return;
    try {
      replace(await adminApi.updateUser(u.id, { isActive: !u.isActive }));
      pushToast(u.isActive ? `${u.name} deactivated` : `${u.name} reactivated`, "success");
    } catch (err) {
      pushToast((err as Error).message, "error");
    }
  };

  const changeRole = async (u: AdminUser, role: UserRole) => {
    if (role === u.role) return;
    if (
      role === "ADMIN" &&
      !(await confirmAction({ title: `Make ${u.name} an admin?`, message: "Admins can manage every account.", confirmLabel: "Make admin" }))
    )
      return;
    try {
      replace(await adminApi.updateUser(u.id, { role }));
      pushToast(`${u.name} is now ${role.toLowerCase()}`, "success");
    } catch (err) {
      pushToast((err as Error).message, "error");
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(search);
        }}
        className="flex flex-wrap gap-2 mb-4"
      >
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3.5 py-2 rounded-full border border-ink/12 dark:border-white/15">
          <Search size={14} className="text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setPage(1);
            setRoleFilter(e.target.value as UserRole | "");
          }}
          aria-label="Filter by role"
          className="px-3.5 py-2 rounded-full border border-ink/12 dark:border-white/15 bg-transparent text-sm"
        >
          <option value="">All roles</option>
          <option value="USER">Users</option>
          <option value="GUIDE">Guides</option>
          <option value="ADMIN">Admins</option>
        </select>
        <button type="submit" className="px-4 py-2 rounded-full bg-forest-500 text-white text-sm font-semibold">
          Search
        </button>
      </form>

      {!result ? (
        <p className="text-sm text-ink-soft">Loading users…</p>
      ) : result.users.length === 0 ? (
        <EmptyState compact icon={<Search size={20} />} title="No users match" />
      ) : (
        <>
          <div className="rounded-2xl border border-ink/8 dark:border-white/10 overflow-x-auto bg-white dark:bg-[#1c2024]">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-left text-xs text-ink-soft dark:text-white/50 uppercase tracking-wide">
                <tr className="border-b border-ink/8 dark:border-white/10">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Places / trips</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.users.map((u) => {
                  const isMe = u.id === myId;
                  return (
                    <tr key={u.id} className="border-b border-ink/6 dark:border-white/5 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {u.name} {isMe && <span className="text-xs text-ink-soft">(you)</span>}
                        </p>
                        <p className="text-xs text-ink-soft dark:text-white/50">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{formatDate(u.createdAt.slice(0, 10))}</td>
                      <td className="px-4 py-3 text-ink-soft">
                        {u.destinations} / {u.trips}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={isMe}
                          onChange={(e) => changeRole(u, e.target.value as UserRole)}
                          aria-label={`Role for ${u.name}`}
                          className="px-2 py-1 rounded-lg border border-ink/12 dark:border-white/15 bg-transparent text-xs disabled:opacity-60"
                        >
                          <option value="USER">User</option>
                          <option value="GUIDE">Guide</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={isMe}
                          className={clsx(
                            "px-3 py-1 rounded-full text-xs font-semibold disabled:opacity-50",
                            u.isActive
                              ? "bg-forest-500/10 text-forest-700 dark:text-forest-300 hover:bg-coral-500/10 hover:text-coral-500"
                              : "bg-coral-500/10 text-coral-500 hover:bg-forest-500/10 hover:text-forest-700",
                          )}
                          title={isMe ? "You can't deactivate your own account" : u.isActive ? "Deactivate" : "Reactivate"}
                        >
                          {u.isActive ? "Active" : "Deactivated"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-ink-soft">
            <span>{result.total} users</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded-full border border-ink/12 dark:border-white/15 disabled:opacity-40">
                Previous
              </button>
              <span className="py-1">
                Page {page} of {Math.max(1, result.totalPages)}
              </span>
              <button
                disabled={page >= result.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-full border border-ink/12 dark:border-white/15 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Guides() {
  const pushToast = useAppStore((s) => s.pushToast);
  const [guides, setGuides] = useLoad<Guide[]>(adminApi.listGuides);

  const toggle = async (g: Guide) => {
    try {
      const updated = await adminApi.setGuideVerified(g.id, !g.isVerified);
      setGuides((list) => list?.map((x) => (x.id === g.id ? updated : x)) ?? null);
      pushToast(updated.isVerified ? `${g.headline} verified` : "Verification removed", "success");
    } catch (err) {
      pushToast((err as Error).message, "error");
    }
  };

  if (!guides) return <p className="text-sm text-ink-soft">Loading guides…</p>;
  if (guides.length === 0) return <EmptyState compact icon={<BadgeCheck size={20} />} title="No guides yet" />;
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {guides.map((g) => (
        <div key={g.id} className="p-4 rounded-2xl bg-white dark:bg-[#1c2024] border border-ink/8 dark:border-white/10 flex gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{g.headline}</p>
            <p className="text-xs text-ink-soft dark:text-white/50">
              {g.destinationName} · ₹{g.pricePerDay.toLocaleString("en-IN")}/day · {g.experienceYears} yrs ·{" "}
              {g.ratingCount > 0 ? `${g.ratingAvg.toFixed(1)}★ (${g.ratingCount})` : "no reviews"}
            </p>
            {g.about && <p className="text-xs text-ink-soft dark:text-white/50 mt-1 line-clamp-2">{g.about}</p>}
          </div>
          <button
            onClick={() => toggle(g)}
            className={clsx(
              "self-start px-3 py-1.5 rounded-full text-xs font-semibold shrink-0",
              g.isVerified ? "bg-forest-500 text-white" : "border border-ink/15 dark:border-white/20",
            )}
          >
            {g.isVerified ? "Verified ✓" : "Verify"}
          </button>
        </div>
      ))}
    </div>
  );
}

function Bookings() {
  const [bookings] = useLoad<Booking[]>(adminApi.listBookings);
  if (!bookings) return <p className="text-sm text-ink-soft">Loading bookings…</p>;
  if (bookings.length === 0) return <EmptyState compact icon={<ShieldAlert size={20} />} title="No bookings yet" />;
  return (
    <div className="rounded-2xl border border-ink/8 dark:border-white/10 overflow-x-auto bg-white dark:bg-[#1c2024]">
      <table className="w-full text-sm min-w-[560px]">
        <thead className="text-left text-xs text-ink-soft dark:text-white/50 uppercase tracking-wide">
          <tr className="border-b border-ink/8 dark:border-white/10">
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Traveler</th>
            <th className="px-4 py-3 font-semibold">Guide</th>
            <th className="px-4 py-3 font-semibold">People</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-ink/6 dark:border-white/5 last:border-0">
              <td className="px-4 py-3">
                {formatDate(b.bookingDate)} <span className="text-ink-soft">{b.bookingTime}</span>
              </td>
              <td className="px-4 py-3">{b.travelerName ?? "—"}</td>
              <td className="px-4 py-3">
                {b.guideName ?? "—"}
                {b.guideDestination && <span className="text-xs text-ink-soft"> · {b.guideDestination}</span>}
              </td>
              <td className="px-4 py-3">{b.peopleCount}</td>
              <td className="px-4 py-3 capitalize">{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
