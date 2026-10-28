"""Check the same repository-root import that Vercel uses, without PYTHONPATH."""

import os
from pathlib import Path
import subprocess
import sys


def test_vercel_entrypoint_serves_frontend_and_api(tmp_path):
    root = Path(__file__).resolve().parents[2]
    env = os.environ.copy()
    env.pop("PYTHONPATH", None)
    env.pop("VERCEL", None)
    env.pop("DATABASE_URL_UNPOOLED", None)
    env["DATABASE_URL"] = "sqlite+pysqlite:///" + (tmp_path / "deployment.db").as_posix()
    code = """
import importlib
import tomllib
from fastapi.testclient import TestClient

with open('pyproject.toml', 'rb') as source:
    entrypoint = tomllib.load(source)['tool']['vercel']['entrypoint']
module, variable = entrypoint.split(':')
app = getattr(importlib.import_module(module), variable)

from backend.app.database import engine, SessionLocal
from backend.app.seed_demo import seed_demo
from alembic import command
from alembic.config import Config
command.upgrade(Config('backend/alembic.ini'), 'head')
with SessionLocal() as db:
    seed_demo(db)
from sqlalchemy import text
with engine.begin() as connection:
    connection.execute(text("UPDATE complaints SET title='Saved across deployments' WHERE case_id='CMP-2026-0015'"))
command.upgrade(Config('backend/alembic.ini'), 'head')
with TestClient(app) as client:
    for path in ['/', '/AICTE.html', '/css/styles.css', '/js/app.js',
                 '/api/health', '/api/institutions', '/api/complaints',
                 '/api/bureaus', '/api/audit-events', '/api/case-links',
                 '/api/case-links/suggestions', '/api/analytics']:
        response = client.get(path)
        assert response.status_code == 200, (path, response.text)
    assert len(client.get('/api/complaints').json()) == 16
    assert client.get('/api/complaints/CMP-2026-0015').json()['title'] == 'Saved across deployments'
engine.dispose()
"""
    result = subprocess.run(
        [sys.executable, "-c", code], cwd=root, env=env,
        capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, result.stdout + result.stderr


def test_postgres_migrations_compile_without_database_connection():
    root = Path(__file__).resolve().parents[2]
    env = os.environ.copy()
    env.pop("PYTHONPATH", None)
    env.pop("DATABASE_URL_UNPOOLED", None)
    env["VERCEL"] = "1"
    env["DATABASE_URL"] = "postgresql://test:password@127.0.0.1:1/test?sslmode=require"
    result = subprocess.run(
        [sys.executable, "-m", "alembic", "-c", "backend/alembic.ini", "upgrade", "head", "--sql"],
        cwd=root, env=env, capture_output=True, text=True, timeout=30,
    )
    assert result.returncode == 0, result.stderr
    assert "CREATE TABLE complaints" in result.stdout
    assert "0002_demo_seed" in result.stdout
