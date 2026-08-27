"""A Google Drive folder link attached to a destination or a trip.

This stores only a URL (validated) plus metadata — it does not perform OAuth
or read files via the Google Drive API. See integrations/google_drive for the
isolated place a real API integration would live.
"""

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class GoogleDriveLink(Base, TimestampMixin):
    __tablename__ = "google_drive_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    destination_id: Mapped[int | None] = mapped_column(
        ForeignKey("destinations.id", ondelete="CASCADE"), nullable=True, index=True
    )
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), nullable=True, index=True)

    title: Mapped[str] = mapped_column(String(150))
    drive_url: Mapped[str] = mapped_column(String(500))
