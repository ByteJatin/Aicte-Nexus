from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Institution(Base):
    __tablename__ = "institutions"

    aicte_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    region: Mapped[str] = mapped_column(String(120), nullable=False)
    institution_type: Mapped[str] = mapped_column(String(100), nullable=False)
    intake: Mapped[int] = mapped_column(Integer, nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False)
    eoa_status: Mapped[str] = mapped_column(String(100), nullable=False)
    eoa_hold: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    hold_reason: Mapped[str] = mapped_column(Text, nullable=False, default="")
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    complaints: Mapped[list["Complaint"]] = relationship(back_populates="institution")

    __table_args__ = (
        CheckConstraint("intake >= 0", name="ck_institutions_intake_nonnegative"),
        CheckConstraint("risk_score BETWEEN 0 AND 100", name="ck_institutions_risk_score"),
    )


class Bureau(Base):
    __tablename__ = "bureaus"

    code: Mapped[str] = mapped_column(String(60), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    complaints: Mapped[list["Complaint"]] = relationship(back_populates="bureau")


class Complaint(Base):
    __tablename__ = "complaints"

    case_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    institution_id: Mapped[str] = mapped_column(
        ForeignKey("institutions.aicte_id", ondelete="RESTRICT"), nullable=False, index=True
    )
    bureau_code: Mapped[str] = mapped_column(
        ForeignKey("bureaus.code", ondelete="RESTRICT"), nullable=False, index=True
    )
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="Submitted")
    assigned_officer: Mapped[str] = mapped_column(String(160), nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    complainant: Mapped[str] = mapped_column(String(160), nullable=False)
    filed_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    institution: Mapped[Institution] = relationship(back_populates="complaints")
    bureau: Mapped[Bureau] = relationship(back_populates="complaints")
    workflow_events: Mapped[list["WorkflowEvent"]] = relationship(
        back_populates="complaint", cascade="all, delete-orphan", order_by="WorkflowEvent.id"
    )
    source_links: Mapped[list["CaseLink"]] = relationship(
        foreign_keys="CaseLink.source_case_id", back_populates="source_case", cascade="all, delete-orphan"
    )
    target_links: Mapped[list["CaseLink"]] = relationship(
        foreign_keys="CaseLink.target_case_id", back_populates="target_case", cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint("priority IN ('Critical', 'High', 'Medium', 'Low')", name="ck_complaints_priority"),
        CheckConstraint(
            "status IN ('Submitted', 'Under Review', 'In Progress', 'Awaiting Information', 'Resolved', 'Closed')",
            name="ck_complaints_status",
        ),
        Index("ix_complaints_status_due_date", "status", "due_date"),
    )


class WorkflowEvent(Base):
    __tablename__ = "workflow_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    complaint_id: Mapped[str] = mapped_column(
        ForeignKey("complaints.case_id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(40), nullable=False)
    from_status: Mapped[str | None] = mapped_column(String(30))
    to_status: Mapped[str | None] = mapped_column(String(30))
    from_bureau_code: Mapped[str | None] = mapped_column(ForeignKey("bureaus.code", ondelete="SET NULL"))
    to_bureau_code: Mapped[str | None] = mapped_column(ForeignKey("bureaus.code", ondelete="SET NULL"))
    assigned_officer: Mapped[str | None] = mapped_column(String(160))
    actor: Mapped[str | None] = mapped_column(String(160))
    note: Mapped[str | None] = mapped_column(Text)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
    seed_key: Mapped[str | None] = mapped_column(String(100), unique=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")

    complaint: Mapped[Complaint] = relationship(back_populates="workflow_events")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now, index=True)
    action_type: Mapped[str] = mapped_column(String(60), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(60), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    actor: Mapped[str | None] = mapped_column(String(160))
    bureau_code: Mapped[str | None] = mapped_column(ForeignKey("bureaus.code", ondelete="SET NULL"))
    bureau_label: Mapped[str | None] = mapped_column(String(100))
    details: Mapped[str] = mapped_column(Text, nullable=False)
    seed_key: Mapped[str | None] = mapped_column(String(100), unique=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")


class CaseLink(Base):
    __tablename__ = "case_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source_case_id: Mapped[str] = mapped_column(
        ForeignKey("complaints.case_id", ondelete="CASCADE"), nullable=False
    )
    target_case_id: Mapped[str] = mapped_column(
        ForeignKey("complaints.case_id", ondelete="CASCADE"), nullable=False
    )
    relationship_type: Mapped[str] = mapped_column(String(60), nullable=False)
    similarity_score: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    state: Mapped[str] = mapped_column(String(30), nullable=False, default="Pending Review")
    note: Mapped[str | None] = mapped_column(Text)
    suggestion_id: Mapped[str | None] = mapped_column(String(40), unique=True)
    seed_key: Mapped[str | None] = mapped_column(String(100), unique=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    source_case: Mapped[Complaint] = relationship(foreign_keys=[source_case_id], back_populates="source_links")
    target_case: Mapped[Complaint] = relationship(foreign_keys=[target_case_id], back_populates="target_links")

    __table_args__ = (
        UniqueConstraint("source_case_id", "target_case_id", name="uq_case_links_direction"),
        CheckConstraint("source_case_id <> target_case_id", name="ck_case_links_distinct_cases"),
        CheckConstraint(
            "similarity_score IS NULL OR (similarity_score >= 0 AND similarity_score <= 100)",
            name="ck_case_links_similarity_range",
        ),
    )

