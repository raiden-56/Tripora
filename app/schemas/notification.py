"""Notification schemas."""

from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    type: str
    is_read: bool
