"""Add explicit demo markers and stable seed keys."""

from alembic import op
import sqlalchemy as sa

revision = "0002_demo_seed"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


DEMO_INSTITUTION_IDS = (
    "1-482910412",
    "1-391048219",
    "1-772819304",
    "1-619283745",
    "1-502938471",
    "1-883920114",
    "1-912039485",
    "1-204918273",
)


def upgrade() -> None:
    for table in ("institutions", "complaints", "workflow_events", "audit_events", "case_links"):
        op.add_column(
            table,
            sa.Column("is_demo", sa.Boolean(), server_default=sa.false(), nullable=False),
        )

    op.add_column("workflow_events", sa.Column("seed_key", sa.String(length=100), nullable=True))
    with op.batch_alter_table("workflow_events") as batch_op:
        batch_op.create_unique_constraint("uq_workflow_events_seed_key", ["seed_key"])
    op.add_column("audit_events", sa.Column("bureau_label", sa.String(length=100), nullable=True))
    op.add_column("audit_events", sa.Column("seed_key", sa.String(length=100), nullable=True))
    with op.batch_alter_table("audit_events") as batch_op:
        batch_op.create_unique_constraint("uq_audit_events_seed_key", ["seed_key"])
    op.add_column("case_links", sa.Column("suggestion_id", sa.String(length=40), nullable=True))
    op.add_column("case_links", sa.Column("seed_key", sa.String(length=100), nullable=True))
    with op.batch_alter_table("case_links") as batch_op:
        batch_op.create_unique_constraint("uq_case_links_suggestion_id", ["suggestion_id"])
        batch_op.create_unique_constraint("uq_case_links_seed_key", ["seed_key"])

    institutions = sa.table("institutions", sa.column("aicte_id", sa.String), sa.column("is_demo", sa.Boolean))
    op.execute(
        institutions.update()
        .where(institutions.c.aicte_id.in_(DEMO_INSTITUTION_IDS))
        .values(is_demo=True)
    )


def downgrade() -> None:
    with op.batch_alter_table("case_links") as batch_op:
        batch_op.drop_constraint("uq_case_links_seed_key", type_="unique")
        batch_op.drop_constraint("uq_case_links_suggestion_id", type_="unique")
    op.drop_column("case_links", "seed_key")
    op.drop_column("case_links", "suggestion_id")
    with op.batch_alter_table("audit_events") as batch_op:
        batch_op.drop_constraint("uq_audit_events_seed_key", type_="unique")
    op.drop_column("audit_events", "seed_key")
    op.drop_column("audit_events", "bureau_label")
    with op.batch_alter_table("workflow_events") as batch_op:
        batch_op.drop_constraint("uq_workflow_events_seed_key", type_="unique")
    op.drop_column("workflow_events", "seed_key")
    for table in ("case_links", "audit_events", "workflow_events", "complaints", "institutions"):
        op.drop_column(table, "is_demo")

