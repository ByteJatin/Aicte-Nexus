"""Database settings shared by the API and Alembic migrations."""

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy.engine import make_url

BACKEND_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_ROOT / ".env")


def database_url(environ=None, *, migrations=False):
    environ = os.environ if environ is None else environ
    on_vercel = environ.get("VERCEL") == "1"
    value = (environ.get("DATABASE_URL") or "").strip()
    if migrations:
        value = (environ.get("DATABASE_URL_UNPOOLED") or "").strip() or value
    if not value:
        if on_vercel:
            raise RuntimeError(
                "Set DATABASE_URL to a hosted PostgreSQL connection in Vercel "
                "before deploying. Local SQLite is not persistent on Vercel."
            )
        value = "sqlite+pysqlite:///" + (BACKEND_ROOT / "aicte_nexus.db").as_posix()

    # Hosted providers commonly supply these prefixes; the installed driver is psycopg 3.
    for prefix in ("postgres://", "postgresql://"):
        if value.startswith(prefix):
            value = "postgresql+psycopg://" + value[len(prefix):]
            break
    try:
        parsed = make_url(value)
    except Exception:
        raise RuntimeError("DATABASE_URL is not a valid database connection URL.") from None
    if on_vercel and parsed.drivername != "postgresql+psycopg":
        raise RuntimeError("Vercel requires a hosted PostgreSQL DATABASE_URL using psycopg.")
    return value
