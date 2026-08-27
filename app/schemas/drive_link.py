"""Google Drive link schemas."""

from pydantic import BaseModel, ConfigDict, field_validator

from app.integrations.google_drive.validator import is_valid_drive_url


class DriveLinkCreate(BaseModel):
    title: str
    drive_url: str
    destination_id: int | None = None
    trip_id: int | None = None

    @field_validator("drive_url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        if not is_valid_drive_url(value):
            raise ValueError("Please provide a valid Google Drive folder link.")
        return value


class DriveLinkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    drive_url: str
    destination_id: int | None
    trip_id: int | None
