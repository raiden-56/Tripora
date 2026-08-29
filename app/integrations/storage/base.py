"""Object storage abstraction so photo binaries never live in PostgreSQL."""

from abc import ABC, abstractmethod


class StorageService(ABC):
    @abstractmethod
    def save(self, *, key: str, content: bytes, content_type: str) -> str:
        """Persists the file and returns a publicly resolvable URL (or signed URL)."""
        raise NotImplementedError

    @abstractmethod
    def delete(self, *, key: str) -> None:
        raise NotImplementedError

    @abstractmethod
    def load(self, *, key: str) -> bytes:
        """Reads back a previously saved file's bytes (e.g. to re-process an upload)."""
        raise NotImplementedError
