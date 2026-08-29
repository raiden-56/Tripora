"""Trip collaborator invite/role schemas."""

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.trip_collaborator import CollaboratorRole, CollaboratorStatus


class CollaboratorInvite(BaseModel):
    email: EmailStr
    role: CollaboratorRole = CollaboratorRole.VIEWER


class CollaboratorRoleUpdate(BaseModel):
    role: CollaboratorRole


class CollaboratorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    trip_title: str
    user_id: int
    invited_email: str
    role: CollaboratorRole
    status: CollaboratorStatus
