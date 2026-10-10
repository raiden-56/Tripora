"""Server-side checks for uploaded images.

The client's Content-Type and filename are never trusted: the bytes must decode as
one of the allowed formats, and the stored file's extension comes from what Pillow
detected — so an HTML/SVG file can't be uploaded and later served as a page.
"""

import io
from dataclasses import dataclass
from datetime import datetime, timezone

from PIL import Image, UnidentifiedImageError

from app.core.exceptions import AppError

# Refuse decompression bombs: a small file that expands to a huge bitmap.
Image.MAX_IMAGE_PIXELS = 50_000_000

_ALLOWED = {
    "JPEG": ("image/jpeg", "jpg"),
    "PNG": ("image/png", "png"),
    "WEBP": ("image/webp", "webp"),
}
_EXIF_DATETIME_ORIGINAL = 0x9003
_EXIF_IFD = 0x8769


@dataclass(frozen=True)
class InspectedImage:
    content_type: str
    extension: str
    taken_at: datetime | None


def inspect_image(content: bytes) -> InspectedImage:
    try:
        with Image.open(io.BytesIO(content)) as image:
            image_format = image.format
            image.verify()
        with Image.open(io.BytesIO(content)) as image:
            taken_at = _exif_taken_at(image)
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError, SyntaxError, ValueError):
        raise AppError("That file isn't a valid JPEG, PNG, or WEBP image.", code="INVALID_FILE_TYPE", status_code=422)

    if image_format not in _ALLOWED:
        raise AppError("Only JPEG, PNG, or WEBP images are allowed.", code="INVALID_FILE_TYPE", status_code=422)
    content_type, extension = _ALLOWED[image_format]
    return InspectedImage(content_type=content_type, extension=extension, taken_at=taken_at)


def _exif_taken_at(image: Image.Image) -> datetime | None:
    try:
        raw = image.getexif().get_ifd(_EXIF_IFD).get(_EXIF_DATETIME_ORIGINAL)
        if not raw:
            return None
        return datetime.strptime(str(raw).strip("\x00 "), "%Y:%m:%d %H:%M:%S").replace(tzinfo=timezone.utc)
    except Exception:  # noqa: BLE001 - missing/garbled EXIF just means "unknown"
        return None
