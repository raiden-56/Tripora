"""Trip collaborator invite/accept/role business logic — controls who besides the
trip owner can view or upload photos for a shared trip. See PhotoService, which
calls get_access_role() to gate trip-scoped photo access."""

from app.core.exceptions import ConflictError, NotFoundError, PermissionDeniedError
from app.models.trip_collaborator import CollaboratorRole, CollaboratorStatus, TripCollaborator
from app.repositories.trip_collaborator_repository import TripCollaboratorRepository
from app.repositories.trip_repository import TripRepository
from app.repositories.user_repository import UserRepository
from app.services.notification_service import NotificationService


class TripCollaboratorService:
    def __init__(
        self,
        repo: TripCollaboratorRepository,
        trip_repo: TripRepository,
        user_repo: UserRepository,
        notifications: NotificationService,
    ):
        self.repo = repo
        self.trip_repo = trip_repo
        self.user_repo = user_repo
        self.notifications = notifications

    def _get_owned_trip(self, trip_id: int, owner_id: int):
        trip = self.trip_repo.get(trip_id)
        if not trip:
            raise NotFoundError("Trip not found.", code="TRIP_NOT_FOUND")
        if trip.user_id != owner_id:
            raise PermissionDeniedError("Only the trip owner can manage collaborators.")
        return trip

    def list_for_trip(self, trip_id: int, requester_id: int) -> list[TripCollaborator]:
        if self.get_access_role(trip_id, requester_id) is None:
            raise PermissionDeniedError("You do not have access to this trip.")
        return self.repo.list_for_trip(trip_id)

    def invite(self, trip_id: int, owner_id: int, email: str, role: CollaboratorRole) -> TripCollaborator:
        trip = self._get_owned_trip(trip_id, owner_id)
        invitee = self.user_repo.get_by_email(email)
        if not invitee:
            raise NotFoundError("No Travel Diaries account found with that email.", code="USER_NOT_FOUND")
        if invitee.id == owner_id:
            raise ConflictError("You already own this trip.")
        if self.repo.get_for_trip_and_user(trip_id, invitee.id):
            raise ConflictError("This person is already invited to this trip.")

        collaborator = TripCollaborator(
            trip_id=trip_id,
            user_id=invitee.id,
            invited_email=email,
            role=role,
            status=CollaboratorStatus.PENDING,
        )
        collaborator = self.repo.add(collaborator)
        self.notifications.notify(
            user_id=invitee.id,
            message=f'You’ve been invited to collaborate on the trip "{trip.title}".',
            type_="info",
        )
        return collaborator

    def respond(self, trip_id: int, collaborator_id: int, user_id: int, *, accept: bool) -> TripCollaborator | None:
        collaborator = self.repo.get(collaborator_id)
        if not collaborator or collaborator.trip_id != trip_id or collaborator.user_id != user_id:
            raise NotFoundError("Invitation not found.", code="INVITE_NOT_FOUND")
        if accept:
            collaborator.status = CollaboratorStatus.ACCEPTED
            return self.repo.add(collaborator)
        self.repo.delete(collaborator)
        return None

    def update_role(self, trip_id: int, owner_id: int, collaborator_id: int, role: CollaboratorRole) -> TripCollaborator:
        self._get_owned_trip(trip_id, owner_id)
        collaborator = self.repo.get(collaborator_id)
        if not collaborator or collaborator.trip_id != trip_id:
            raise NotFoundError("Collaborator not found.", code="COLLABORATOR_NOT_FOUND")
        collaborator.role = role
        return self.repo.add(collaborator)

    def remove(self, trip_id: int, owner_id: int, collaborator_id: int) -> None:
        self._get_owned_trip(trip_id, owner_id)
        collaborator = self.repo.get(collaborator_id)
        if not collaborator or collaborator.trip_id != trip_id:
            raise NotFoundError("Collaborator not found.", code="COLLABORATOR_NOT_FOUND")
        self.repo.delete(collaborator)

    def get_access_role(self, trip_id: int, user_id: int) -> str | None:
        """Returns 'owner', 'editor', 'viewer', or None."""
        trip = self.trip_repo.get(trip_id)
        if not trip:
            return None
        if trip.user_id == user_id:
            return "owner"
        collaborator = self.repo.get_for_trip_and_user(trip_id, user_id)
        if collaborator and collaborator.status == CollaboratorStatus.ACCEPTED:
            return collaborator.role.value
        return None
