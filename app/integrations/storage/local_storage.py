"""Local-disk storage — the default implementation used until an S3/R2/GCS
bucket is configured via STORAGE_BUCKET / STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY.

Swapping to real object storage means implementing StorageService and
returning it from get_storage_service() below — nothing else in the codebase
needs to change, since callers only depend on the StorageService interface.
"""

from pathlib import Path

from app.core.config import get_settings
from app.integrations.storage.base import StorageService

settings = get_settings()
_UPLOAD_DIR = Path("uploads")


class LocalStorageService(StorageService):
    def __init__(self) -> None:
        _UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _path(key: str) -> Path:
        """Resolve a storage key, refusing anything that escapes the upload directory."""
        root = _UPLOAD_DIR.resolve()
        path = (root / key).resolve()
        if not path.is_relative_to(root):
            raise ValueError(f"Invalid storage key: {key!r}")
        return path

    def save(self, *, key: str, content: bytes, content_type: str) -> str:
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return f"/uploads/{key}"

    def delete(self, *, key: str) -> None:
        path = self._path(key)
        if path.exists():
            path.unlink()

    def load(self, *, key: str) -> bytes:
        return self._path(key).read_bytes()


def get_storage_service() -> StorageService:
    # A cloud-backed implementation would be selected here once
    # STORAGE_BUCKET / STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY are configured.
    return LocalStorageService()
