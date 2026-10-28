import os

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Bureau, Institution


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def enable_sqlite_foreign_keys(connection, _record):
        cursor = connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)
    with TestingSessionLocal() as db:
        db.add_all(
            [
                Bureau(code="public-grievance", name="Public Grievance Cell"),
                Bureau(code="approval", name="Approval Bureau"),
                Institution(
                    aicte_id="1-482910412",
                    name="Satpura Institute of Engineering & Tech",
                    city="Bhopal",
                    state="Madhya Pradesh",
                    region="Central (Bhopal RO)",
                    institution_type="Private Self-Financed",
                    intake=1140,
                    risk_score=92,
                    eoa_status="EoA 2026-27 Under Hold",
                    eoa_hold=True,
                    hold_reason="Under review",
                    summary="Seed institution for API tests.",
                ),
            ]
        )
        db.commit()

    def override_get_db():
        with TestingSessionLocal() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    app.state.testing_sessionmaker = TestingSessionLocal
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    del app.state.testing_sessionmaker
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def complaint_payload():
    return {
        "case_id": "CMP-2026-0100",
        "institution_id": "1-482910412",
        "bureau_code": "public-grievance",
        "category": "Faculty Salary Non-Payment",
        "title": "Faculty salary payments are overdue",
        "priority": "High",
        "status": "Submitted",
        "assigned_officer": "Dr. R. K. Verma",
        "source": "CPGRAMS",
        "complainant": "Faculty Member",
        "filed_date": "2026-10-01",
        "due_date": "2026-11-01",
    }

