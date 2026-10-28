"""Create initial AICTE NEXUS schema and reference data."""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "institutions",
        sa.Column("aicte_id", sa.String(length=20), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("region", sa.String(length=120), nullable=False),
        sa.Column("institution_type", sa.String(length=100), nullable=False),
        sa.Column("intake", sa.Integer(), nullable=False),
        sa.Column("risk_score", sa.Integer(), nullable=False),
        sa.Column("eoa_status", sa.String(length=100), nullable=False),
        sa.Column("eoa_hold", sa.Boolean(), nullable=False),
        sa.Column("hold_reason", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.CheckConstraint("intake >= 0", name="ck_institutions_intake_nonnegative"),
        sa.CheckConstraint("risk_score BETWEEN 0 AND 100", name="ck_institutions_risk_score"),
    )
    op.create_index("ix_institutions_name", "institutions", ["name"])

    op.create_table(
        "bureaus",
        sa.Column("code", sa.String(length=60), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False, unique=True),
    )

    op.create_table(
        "complaints",
        sa.Column("case_id", sa.String(length=20), primary_key=True),
        sa.Column("institution_id", sa.String(length=20), sa.ForeignKey("institutions.aicte_id", ondelete="RESTRICT"), nullable=False),
        sa.Column("bureau_code", sa.String(length=60), sa.ForeignKey("bureaus.code", ondelete="RESTRICT"), nullable=False),
        sa.Column("category", sa.String(length=120), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("assigned_officer", sa.String(length=160), nullable=False),
        sa.Column("source", sa.String(length=100), nullable=False),
        sa.Column("complainant", sa.String(length=160), nullable=False),
        sa.Column("filed_date", sa.Date(), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("priority IN ('Critical', 'High', 'Medium', 'Low')", name="ck_complaints_priority"),
        sa.CheckConstraint("status IN ('Submitted', 'Under Review', 'In Progress', 'Awaiting Information', 'Resolved', 'Closed')", name="ck_complaints_status"),
    )
    op.create_index("ix_complaints_institution_id", "complaints", ["institution_id"])
    op.create_index("ix_complaints_bureau_code", "complaints", ["bureau_code"])
    op.create_index("ix_complaints_status_due_date", "complaints", ["status", "due_date"])

    op.create_table(
        "workflow_events",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("complaint_id", sa.String(length=20), sa.ForeignKey("complaints.case_id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_type", sa.String(length=40), nullable=False),
        sa.Column("from_status", sa.String(length=30)),
        sa.Column("to_status", sa.String(length=30)),
        sa.Column("from_bureau_code", sa.String(length=60), sa.ForeignKey("bureaus.code", ondelete="SET NULL")),
        sa.Column("to_bureau_code", sa.String(length=60), sa.ForeignKey("bureaus.code", ondelete="SET NULL")),
        sa.Column("assigned_officer", sa.String(length=160)),
        sa.Column("actor", sa.String(length=160)),
        sa.Column("note", sa.Text()),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_workflow_events_complaint_id", "workflow_events", ["complaint_id"])

    op.create_table(
        "audit_events",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("action_type", sa.String(length=60), nullable=False),
        sa.Column("entity_type", sa.String(length=60), nullable=False),
        sa.Column("entity_id", sa.String(length=60), nullable=False),
        sa.Column("actor", sa.String(length=160)),
        sa.Column("bureau_code", sa.String(length=60), sa.ForeignKey("bureaus.code", ondelete="SET NULL")),
        sa.Column("details", sa.Text(), nullable=False),
    )
    op.create_index("ix_audit_events_occurred_at", "audit_events", ["occurred_at"])
    op.create_index("ix_audit_events_entity_id", "audit_events", ["entity_id"])

    op.create_table(
        "case_links",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("source_case_id", sa.String(length=20), sa.ForeignKey("complaints.case_id", ondelete="CASCADE"), nullable=False),
        sa.Column("target_case_id", sa.String(length=20), sa.ForeignKey("complaints.case_id", ondelete="CASCADE"), nullable=False),
        sa.Column("relationship_type", sa.String(length=60), nullable=False),
        sa.Column("similarity_score", sa.Numeric(5, 2)),
        sa.Column("state", sa.String(length=30), nullable=False),
        sa.Column("note", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True)),
        sa.UniqueConstraint("source_case_id", "target_case_id", name="uq_case_links_direction"),
        sa.CheckConstraint("source_case_id <> target_case_id", name="ck_case_links_distinct_cases"),
        sa.CheckConstraint("similarity_score IS NULL OR (similarity_score >= 0 AND similarity_score <= 100)", name="ck_case_links_similarity_range"),
    )

    bureaus = sa.table("bureaus", sa.column("code", sa.String), sa.column("name", sa.String))
    op.bulk_insert(
        bureaus,
        [
            {"code": "public-grievance", "name": "Public Grievance Cell"},
            {"code": "approval", "name": "Approval Bureau"},
            {"code": "regulation", "name": "Regulation Bureau"},
            {"code": "anti-ragging", "name": "Anti-Ragging Cell"},
            {"code": "vigilance-cvc", "name": "Vigilance / CVC Cell"},
            {"code": "finance", "name": "Finance Bureau"},
        ],
    )

    institutions = sa.table(
        "institutions",
        sa.column("aicte_id", sa.String), sa.column("name", sa.String), sa.column("city", sa.String),
        sa.column("state", sa.String), sa.column("region", sa.String), sa.column("institution_type", sa.String),
        sa.column("intake", sa.Integer), sa.column("risk_score", sa.Integer), sa.column("eoa_status", sa.String),
        sa.column("eoa_hold", sa.Boolean), sa.column("hold_reason", sa.Text), sa.column("summary", sa.Text),
    )
    op.bulk_insert(
        institutions,
        [
            {"aicte_id": "1-482910412", "name": "Satpura Institute of Engineering & Tech", "city": "Bhopal", "state": "Madhya Pradesh", "region": "Central (Bhopal RO)", "institution_type": "Private Self-Financed", "intake": 1140, "risk_score": 92, "eoa_status": "EoA 2026-27 Under Hold", "eoa_hold": True, "hold_reason": "Extension of Approval (EoA) Flagged by Public Grievance + Regulation + Vigilance Bureaus", "summary": "Multiple high-severity complaints regarding 7 months unpaid faculty salaries in Grievance Cell alongside suspected forged payroll affidavits submitted to Approval Bureau for EoA renewal."},
            {"aicte_id": "1-391048219", "name": "Gandak Valley Institute of Technology", "city": "Muzaffarpur", "state": "Bihar", "region": "Eastern (Kolkata RO)", "institution_type": "Private Self-Financed", "intake": 780, "risk_score": 88, "eoa_status": "Standing Hearing Committee (SHC)", "eoa_hold": True, "hold_reason": "Flagged by Anti-Ragging Cell + Approval Bureau (Hostel Safety & Lab Deficit)", "summary": "Severe hostel ragging complaint under active investigation in Anti-Ragging Cell while physical EVC audit flagged 42% shortage in core Mechanical & AI/ML laboratory equipment."},
            {"aicte_id": "1-772819304", "name": "Utkal Regional College of Management", "city": "Bhubaneswar", "state": "Odisha", "region": "Eastern (Kolkata RO)", "institution_type": "Private PGDM Institution", "intake": 420, "risk_score": 84, "eoa_status": "EoA Flagged for Audit", "eoa_hold": True, "hold_reason": "Flagged by Regulation Bureau + Finance Bureau (Unapproved Intake & Fee Capitation)", "summary": "Admitted 65 excess students beyond AICTE sanctioned intake and collected unreceipted development fees; linked to PG scholarship utilization discrepancy in Finance Bureau."},
            {"aicte_id": "1-619283745", "name": "Shivalik Foothills School of Architecture", "city": "Dehradun", "state": "Uttarakhand", "region": "Northern (Kanpur RO)", "institution_type": "Private Technical Institution", "intake": 300, "risk_score": 79, "eoa_status": "Show Cause Notice Issued", "eoa_hold": True, "hold_reason": "Flagged by Approval Bureau + Public Grievance Cell (Fire Safety NOC Expiry & Original Certificates Withheld)", "summary": "Municipal Fire Safety NOC expired 11 months ago; students also filed CPGRAMS grievances regarding withholding of original mark sheets and security deposits."},
            {"aicte_id": "1-502938471", "name": "Malwa Plateau Institute of Technology", "city": "Indore", "state": "Madhya Pradesh", "region": "Central (Bhopal RO)", "institution_type": "Private Self-Financed", "intake": 960, "risk_score": 86, "eoa_status": "EoA 2026-27 Under Hold", "eoa_hold": True, "hold_reason": "Flagged by Vigilance / CVC Cell + Public Grievance Cell + Finance Bureau", "summary": "CVC vigilance reference regarding duplicate faculty PAN entries (Ghost Faculty) appearing simultaneously on two college rosters, coupled with faculty PF/salary arrears."},
            {"aicte_id": "1-883920114", "name": "Cauvery Delta College of Pharmacy & Tech", "city": "Tiruchirappalli", "state": "Tamil Nadu", "region": "Southern (Chennai RO)", "institution_type": "Private Self-Financed", "intake": 540, "risk_score": 73, "eoa_status": "Conditional EoA Review", "eoa_hold": False, "hold_reason": "Monitored by Regulation Bureau + Grievance Cell", "summary": "Complaints regarding Principal qualification norms and delayed refund of admission cancellation fees under AICTE fee refund policy."},
            {"aicte_id": "1-912039485", "name": "Deccan Institute of Aeronautical & Tech", "city": "Hyderabad", "state": "Telangana", "region": "South-Central (Hyderabad RO)", "institution_type": "Private Self-Financed", "intake": 840, "risk_score": 81, "eoa_status": "EoA 2026-27 Under Hold", "eoa_hold": True, "hold_reason": "Flagged by Approval Bureau + Anti-Ragging Cell", "summary": "Deficit in propulsion lab safety compliance and non-constitution of statutory Anti-Ragging Squad as mandated by AICTE regulations."},
            {"aicte_id": "1-204918273", "name": "Sahyadri Coastal College of Engineering", "city": "Ratnagiri", "state": "Maharashtra", "region": "Western (Mumbai RO)", "institution_type": "Private Self-Financed", "intake": 600, "risk_score": 68, "eoa_status": "EoA Active (Under Watch)", "eoa_hold": False, "hold_reason": "Monitored by Finance Bureau + Public Grievance Cell", "summary": "Delayed disbursement of AICTE Pragati & Saksham scholarship verification at institute nodal level."},
        ],
    )


def downgrade() -> None:
    op.drop_table("case_links")
    op.drop_index("ix_audit_events_entity_id", table_name="audit_events")
    op.drop_index("ix_audit_events_occurred_at", table_name="audit_events")
    op.drop_table("audit_events")
    op.drop_index("ix_workflow_events_complaint_id", table_name="workflow_events")
    op.drop_table("workflow_events")
    op.drop_index("ix_complaints_status_due_date", table_name="complaints")
    op.drop_index("ix_complaints_bureau_code", table_name="complaints")
    op.drop_index("ix_complaints_institution_id", table_name="complaints")
    op.drop_table("complaints")
    op.drop_table("bureaus")
    op.drop_index("ix_institutions_name", table_name="institutions")
    op.drop_table("institutions")

