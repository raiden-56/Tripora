import { useEffect, useState } from "react";
import { Loader2, Mail, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import clsx from "clsx";
import { useAppStore } from "../../store/useAppStore";
import { EmptyState } from "../common/EmptyState";
import * as collabApi from "../../api/tripCollaborators.api";
import type { Collaborator, CollaboratorRole } from "../../api/tripCollaborators.api";
import type { TripRole } from "../../types";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-ink/12 dark:border-white/15 bg-transparent text-sm outline-none focus:border-forest-400";

export function TripCollaboratorsTab({
  tripId,
  role,
}: {
  tripId: string;
  role: TripRole;
}) {
  const pushToast = useAppStore((s) => s.pushToast);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>("viewer");
  const [inviting, setInviting] = useState(false);
  const isOwner = role === "owner";

  const load = async () => {
    setLoading(true);
    try {
      setCollaborators(await collabApi.listCollaborators(tripId));
    } catch {
      pushToast("Could not load collaborators.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    try {
      await collabApi.inviteCollaborator(tripId, email.trim(), inviteRole);
      setEmail("");
      pushToast("Invite sent.", "success");
      load();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Could not send invite.", "error");
    } finally {
      setInviting(false);
    }
  };

  const changeRole = async (collaboratorId: number, newRole: CollaboratorRole) => {
    try {
      await collabApi.updateCollaboratorRole(tripId, collaboratorId, newRole);
      load();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Could not update role.", "error");
    }
  };

  const remove = async (collaboratorId: number) => {
    try {
      await collabApi.removeCollaborator(tripId, collaboratorId);
      load();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Could not remove collaborator.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-forest-500" size={20} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5">
        <Users size={14} className="text-forest-500" />
        <p className="text-xs font-semibold text-ink-soft dark:text-white/50">
          Who has access
        </p>
      </div>

      {collaborators.length === 0 ? (
        <EmptyState
          compact
          icon={<Users size={18} />}
          title="Just you, for now"
          description={
            isOwner
              ? "Invite travel companions so they can view or add photos to this trip."
              : "The trip owner hasn't invited anyone else yet."
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {collaborators.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-xl border border-ink/8 dark:border-white/10 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{c.invitedEmail}</p>
                <p className="text-xs text-ink-soft dark:text-white/50 capitalize">
                  {c.status === "pending" ? "Invite pending" : "Active"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isOwner ? (
                  <select
                    value={c.role}
                    onChange={(e) => changeRole(c.id, e.target.value as CollaboratorRole)}
                    className="text-xs rounded-lg border border-ink/12 dark:border-white/15 bg-transparent px-2 py-1"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                ) : (
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize",
                      c.role === "editor"
                        ? "bg-sky-500/15 text-sky-600"
                        : "bg-ink/8 dark:bg-white/10 text-ink-soft dark:text-white/60",
                    )}
                  >
                    {c.role}
                  </span>
                )}
                {isOwner && (
                  <button
                    onClick={() => remove(c.id)}
                    className="text-ink-soft hover:text-coral-500"
                    aria-label="Remove collaborator"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isOwner && (
        <form onSubmit={invite} className="flex flex-col gap-2.5 p-3 rounded-xl border border-ink/8 dark:border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft dark:text-white/50">
            <UserPlus size={13} /> Invite someone
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                className={clsx(inputClass, "pl-8")}
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as CollaboratorRole)}
              className={inputClass + " w-28 shrink-0"}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={inviting}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-forest-500 text-white text-xs font-semibold disabled:opacity-60"
          >
            {inviting ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
            Send Invite
          </button>
          <p className="text-[11px] text-ink-soft dark:text-white/40">
            They need an existing Travel Diaries account. Viewers can see this trip's photos;
            editors can also add photos.
          </p>
        </form>
      )}
    </div>
  );
}
