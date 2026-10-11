"""Database engine/session management."""

from collections.abc import Generator

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()


def enable_sqlite_foreign_keys(target: Engine) -> None:
    """SQLite ignores FOREIGN KEY / ON DELETE rules unless asked per connection, which
    lets dev/tests silently diverge from Postgres (orphaned rows, dangling references)."""

    @event.listens_for(target, "connect")
    def _set_pragma(dbapi_connection, _record) -> None:  # noqa: ANN001
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


_is_sqlite = settings.database_url.startswith("sqlite")
_connect_args = {"check_same_thread": False} if _is_sqlite else {}
engine = create_engine(settings.database_url, connect_args=_connect_args, pool_pre_ping=True)
if _is_sqlite:
    enable_sqlite_foreign_keys(engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
