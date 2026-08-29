"""Trip collaborator invite/accept/role endpoints — controls who besides the trip
owner can view or upload photos for a shared trip."""

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUser, DbSession
from app.models.trip_collaborator import CollaboratorStatus
from app.repositories.notification_repository import NotificationRepository
from app.repositories.trip_collaborator_repository import TripCollaboratorRepository
from app.repositories.trip_repository import TripRepository
from app.repositories.user_repository import UserRepository
from app.schemas.trip_collaborator import CollaboratorInvite, CollaboratorOut, CollaboratorRoleUpdate
from app.services.notification_service import NotificationService
from app.services.trip_collaborator_service import TripCollaboratorService

router = APIRouter(prefix="/trips/{trip_id}/collaborators", tags=["trip-collaborators"])
me_router = APIRouter(prefix="/me/trip-invites", tags=["trip-collaborators"])


def _service(db: DbSession) -> TripCollaboratorService:
    return TripCollaboratorService(
        TripCollaboratorRepository(db),
        TripRepository(db),
        UserRepository(db),
        NotificationService(NotificationRepository(db)),
    )


@router.get("", response_model=list[CollaboratorOut])
def list_collaborators(
    trip_id: int, user: CurrentUser, service: TripCollaboratorService = Depends(_service)
) -> list[CollaboratorOut]:
    return [CollaboratorOut.model_validate(c) for c in service.list_for_trip(trip_id, user.id)]


@router.post("", response_model=CollaboratorOut, status_code=201)
def invite_collaborator(
    trip_id: int,
    payload: CollaboratorInvite,
    user: CurrentUser,
    service: TripCollaboratorService = Depends(_service),
) -> CollaboratorOut:
    return CollaboratorOut.model_validate(service.invite(trip_id, user.id, payload.email, payload.role))


@router.post("/{collaborator_id}/accept", response_model=CollaboratorOut)
def accept_invite(
    trip_id: int, collaborator_id: int, user: CurrentUser, service: TripCollaboratorService = Depends(_service)
) -> CollaboratorOut:
    return CollaboratorOut.model_validate(service.respond(trip_id, collaborator_id, user.id, accept=True))


@router.post("/{collaborator_id}/decline", status_code=204)
def decline_invite(
    trip_id: int, collaborator_id: int, user: CurrentUser, service: TripCollaboratorService = Depends(_service)
) -> None:
    service.respond(trip_id, collaborator_id, user.id, accept=False)


@router.patch("/{collaborator_id}", response_model=CollaboratorOut)
def update_collaborator_role(
    trip_id: int,
    collaborator_id: int,
    payload: CollaboratorRoleUpdate,
    user: CurrentUser,
    service: TripCollaboratorService = Depends(_service),
) -> CollaboratorOut:
    return CollaboratorOut.model_validate(service.update_role(trip_id, user.id, collaborator_id, payload.role))


@router.delete("/{collaborator_id}", status_code=204)
def remove_collaborator(
    trip_id: int, collaborator_id: int, user: CurrentUser, service: TripCollaboratorService = Depends(_service)
) -> None:
    service.remove(trip_id, user.id, collaborator_id)


@me_router.get("", response_model=list[CollaboratorOut])
def list_my_pending_invites(user: CurrentUser, db: DbSession) -> list[CollaboratorOut]:
    repo = TripCollaboratorRepository(db)
    pending = [c for c in repo.list_for_user(user.id) if c.status == CollaboratorStatus.PENDING]
    return [CollaboratorOut.model_validate(c) for c in pending]
