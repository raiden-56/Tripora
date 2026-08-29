import { useEffect, useState } from "react";
import { Check, Users, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import * as collabApi from "../../api/tripCollaborators.api";
import type { Collaborator } from "../../api/tripCollaborators.api";

export function TripInvitesBanner() {
  const pushToast = useAppStore((s) => s.pushToast);
  const fetchAllData = useAppStore((s) => s.fetchAllData);
  const [invites, setInvites] = useState<Collaborator[]>([]);

  useEffect(() => {
    collabApi
      .listMyPendingInvites()
      .then(setInvites)
      .catch(() => {});
  }, []);

  if (invites.length === 0) return null;

  const respond = async (invite: Collaborator, accept: boolean) => {
    try {
      if (accept) {
        await collabApi.acceptInvite(invite.tripId, invite.id);
        pushToast(`You now have access to "${invite.tripTitle}".`, "success");
        fetchAllData();
      } else {
        await collabApi.declineInvite(invite.tripId, invite.id);
      }
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } catch {
      pushToast("Could not update the invite. Try again.", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex flex-col gap-2"
    >
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-600 flex items-center justify-center shrink-0">
              <Users size={16} />
            </span>
            <p className="text-sm min-w-0 truncate">
              You've been invited to collaborate on{" "}
              <span className="font-semibold">"{invite.tripTitle}"</span> as a{" "}
              {invite.role}.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => respond(invite, true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-forest-500 text-white text-xs font-semibold hover:bg-forest-600"
            >
              <Check size={12} /> Accept
            </button>
            <button
              onClick={() => respond(invite, false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-ink/12 dark:border-white/15 text-xs font-semibold text-ink-soft dark:text-white/60"
            >
              <X size={12} /> Decline
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
