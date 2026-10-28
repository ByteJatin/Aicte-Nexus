from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.models import AuditEvent, Bureau, CaseLink, Complaint, Institution, WorkflowEvent
from app.seed_demo import seed_demo


def _session_factory():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    return engine, sessionmaker(bind=engine, expire_on_commit=False)


def test_demo_seed_imports_existing_frontend_scenarios_and_is_idempotent():
    engine, Session = _session_factory()
    try:
        with Session() as db:
            first_run = seed_demo(db)
            second_run = seed_demo(db)

            assert first_run == {
                "institutions": 8,
                "bureaus": 6,
                "complaints": 16,
                "workflow_events": 22,
                "case_links": 9,
                "audit_events": 8,
            }
            assert all(count == 0 for count in second_run.values())
            assert db.scalar(select(func.count()).select_from(Institution).where(Institution.is_demo.is_(True))) == 8
            assert db.scalar(select(func.count()).select_from(Bureau)) == 6
            assert db.scalar(select(func.count()).select_from(Complaint).where(Complaint.is_demo.is_(True))) == 16
            assert db.scalar(select(func.count()).select_from(WorkflowEvent).where(WorkflowEvent.is_demo.is_(True))) == 22
            assert db.scalar(select(func.count()).select_from(CaseLink).where(CaseLink.is_demo.is_(True))) == 9
            assert db.scalar(select(func.count()).select_from(CaseLink).where(CaseLink.suggestion_id.is_not(None))) == 7
            assert db.scalar(select(func.count()).select_from(AuditEvent).where(AuditEvent.is_demo.is_(True))) == 8

            complaint = db.get(Complaint, "CMP-2026-0015")
            assert complaint.title.startswith("Non-payment of faculty salaries")
            assert complaint.is_demo is True
    finally:
        Base.metadata.drop_all(engine)
        engine.dispose()


def test_demo_seed_does_not_overwrite_existing_user_record():
    engine, Session = _session_factory()
    try:
        with Session() as db:
            seed_demo(db)
            complaint = db.get(Complaint, "CMP-2026-0015")
            complaint.title = "Edited by a user"
            complaint.is_demo = False
            db.commit()

            result = seed_demo(db)

            assert all(count == 0 for count in result.values())
            assert complaint.title == "Edited by a user"
            assert complaint.is_demo is False
            assert db.scalar(
                select(func.count()).select_from(WorkflowEvent).where(
                    WorkflowEvent.seed_key == "demo:workflow:case:CMP-2026-0015"
                )
            ) == 1
    finally:
        Base.metadata.drop_all(engine)
        engine.dispose()

