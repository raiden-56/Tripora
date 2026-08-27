"""Trip, trip-destination association, and AI-generated trip plan models."""

from datetime import date

from sqlalchemy import Enum, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import DestinationStatus, GenerationStatus
from app.db.base import Base, TimestampMixin


class Trip(Base, TimestampMixin):
    __tablename__ = "trips"
    __table_args__ = (Index("ix_trips_user_dates", "user_id", "start_date", "end_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    title: Mapped[str] = mapped_column(String(150))
    start_date: Mapped[date] = mapped_column(index=True)
    end_date: Mapped[date] = mapped_column(index=True)
    status: Mapped[DestinationStatus] = mapped_column(Enum(DestinationStatus), index=True)

    cover_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    drive_folder_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    destinations: Mapped[list["TripDestination"]] = relationship(back_populates="trip", cascade="all, delete-orphan")


class TripDestination(Base):
    """Association between a trip and the destinations it covers, in order."""

    __tablename__ = "trip_destinations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), index=True)
    destination_id: Mapped[int] = mapped_column(ForeignKey("destinations.id", ondelete="CASCADE"), index=True)
    order_index: Mapped[int] = mapped_column(default=0)

    trip: Mapped["Trip"] = relationship(back_populates="destinations")
    destination: Mapped["Destination"] = relationship()


class TripPlan(Base, TimestampMixin):
    """A generated (AI/rule-based) itinerary — see PlannerService. Can later be attached to a Trip."""

    __tablename__ = "trip_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("trips.id", ondelete="SET NULL"), nullable=True, index=True)

    origin: Mapped[str] = mapped_column(String(150))
    destination_name: Mapped[str] = mapped_column(String(150))
    days: Mapped[int] = mapped_column(Integer)
    people: Mapped[int] = mapped_column(Integer, default=1)
    budget: Mapped[float] = mapped_column(Float)
    travel_style: Mapped[str] = mapped_column(String(100))
    interests: Mapped[str | None] = mapped_column(String(300), nullable=True)  # comma-separated

    estimated_budget_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    estimated_budget_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    distance_km: Mapped[float | None] = mapped_column(Float, nullable=True)
    route_description: Mapped[str | None] = mapped_column(String(300), nullable=True)
    status: Mapped[GenerationStatus] = mapped_column(Enum(GenerationStatus), default=GenerationStatus.COMPLETED)

    days_detail: Mapped[list["TripPlanDay"]] = relationship(back_populates="plan", cascade="all, delete-orphan")


class TripPlanDay(Base):
    __tablename__ = "trip_plan_days"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_plan_id: Mapped[int] = mapped_column(ForeignKey("trip_plans.id", ondelete="CASCADE"), index=True)
    day_number: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(200))

    plan: Mapped["TripPlan"] = relationship(back_populates="days_detail")
    activities: Mapped[list["TripPlanActivity"]] = relationship(back_populates="day", cascade="all, delete-orphan")


class TripPlanActivity(Base):
    __tablename__ = "trip_plan_activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    trip_plan_day_id: Mapped[int] = mapped_column(ForeignKey("trip_plan_days.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(20))  # place | activity | food
    description: Mapped[str] = mapped_column(String(300))
    order_index: Mapped[int] = mapped_column(default=0)

    day: Mapped["TripPlanDay"] = relationship(back_populates="activities")
