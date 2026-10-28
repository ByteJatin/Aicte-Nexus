import pytest
from sqlalchemy.engine import make_url

from app.config import database_url


@pytest.mark.parametrize("prefix", ["postgres://", "postgresql://", "postgresql+psycopg://"])
def test_hosted_urls_use_installed_driver_and_preserve_credentials_and_ssl(prefix):
    result = database_url({
        "VERCEL": "1",
        "DATABASE_URL": prefix + "user:pass%40word@db.example/test?sslmode=require",
    })
    parsed = make_url(result)
    assert parsed.drivername == "postgresql+psycopg"
    assert parsed.password == "pass@word"
    assert parsed.query["sslmode"] == "require"


@pytest.mark.parametrize("value", ["", "sqlite+pysqlite:///demo.db"])
def test_vercel_cannot_silently_use_local_storage(value):
    with pytest.raises(RuntimeError, match="PostgreSQL"):
        database_url({"VERCEL": "1", "DATABASE_URL": value})


def test_migrations_prefer_direct_connection_without_changing_runtime_connection():
    env = {"DATABASE_URL": "postgresql://u:p@pool/db",
           "DATABASE_URL_UNPOOLED": "postgresql://u:p@direct/db"}
    assert make_url(database_url(env)).host == "pool"
    assert make_url(database_url(env, migrations=True)).host == "direct"
    env.pop("DATABASE_URL_UNPOOLED")
    assert make_url(database_url(env, migrations=True)).host == "pool"


def test_bad_url_error_does_not_echo_credentials():
    with pytest.raises(RuntimeError) as error:
        database_url({"DATABASE_URL": "invalid secret-password"})
    assert "secret-password" not in str(error.value)


def test_local_default_is_absolute_and_points_to_backend():
    from pathlib import Path
    path = Path(make_url(database_url({})).database)
    assert path.is_absolute()
    assert path.parent.name == "backend"
