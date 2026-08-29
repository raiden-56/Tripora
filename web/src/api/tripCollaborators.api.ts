import { apiRequest } from "./client";

export type CollaboratorRole = "editor" | "viewer";
export type CollaboratorStatus = "pending" | "accepted";

export interface Collaborator {
  id: number;
  tripId: string;
  tripTitle: string;
  userId: number;
  invitedEmail: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
}

interface BackendCollaborator {
  id: number;
  trip_id: number;
  trip_title: string;
  user_id: number;
  invited_email: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
}

function toFrontend(c: BackendCollaborator): Collaborator {
  return {
    id: c.id,
    tripId: String(c.trip_id),
    tripTitle: c.trip_title,
    userId: c.user_id,
    invitedEmail: c.invited_email,
    role: c.role,
    status: c.status,
  };
}

export async function listCollaborators(tripId: string): Promise<Collaborator[]> {
  const result = await apiRequest<BackendCollaborator[]>(`/api/v1/trips/${tripId}/collaborators`);
  return result.map(toFrontend);
}

export async function inviteCollaborator(
  tripId: string,
  email: string,
  role: CollaboratorRole,
): Promise<Collaborator> {
  const result = await apiRequest<BackendCollaborator>(`/api/v1/trips/${tripId}/collaborators`, {
    method: "POST",
    body: { email, role },
  });
  return toFrontend(result);
}

export async function updateCollaboratorRole(
  tripId: string,
  collaboratorId: number,
  role: CollaboratorRole,
): Promise<Collaborator> {
  const result = await apiRequest<BackendCollaborator>(
    `/api/v1/trips/${tripId}/collaborators/${collaboratorId}`,
    { method: "PATCH", body: { role } },
  );
  return toFrontend(result);
}

export async function removeCollaborator(tripId: string, collaboratorId: number): Promise<void> {
  await apiRequest<void>(`/api/v1/trips/${tripId}/collaborators/${collaboratorId}`, {
    method: "DELETE",
  });
}

export async function acceptInvite(tripId: string, collaboratorId: number): Promise<Collaborator> {
  const result = await apiRequest<BackendCollaborator>(
    `/api/v1/trips/${tripId}/collaborators/${collaboratorId}/accept`,
    { method: "POST" },
  );
  return toFrontend(result);
}

export async function declineInvite(tripId: string, collaboratorId: number): Promise<void> {
  await apiRequest<void>(`/api/v1/trips/${tripId}/collaborators/${collaboratorId}/decline`, {
    method: "POST",
  });
}

export async function listMyPendingInvites(): Promise<Collaborator[]> {
  const result = await apiRequest<BackendCollaborator[]>("/api/v1/me/trip-invites");
  return result.map(toFrontend);
}
