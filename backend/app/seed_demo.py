"""Import the frontend's fixed synthetic demo scenarios without overwriting rows."""

import json
import re
from datetime import date, datetime, time
from pathlib import Path
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import AuditEvent, Bureau, CaseLink, Complaint, Institution, WorkflowEvent

DEMO_DATA_PATH = Path(__file__).with_name("demo_data.json")
IST = ZoneInfo("Asia/Kolkata")
CASE_ID_PATTERN = re.compile(r"CMP-\d{4}-\d+")
STATUS_CHANGE_PATTERN = re.compile(r"Status: (.*?) → (.*?) \|")

BUREAUS = (
    ("public-grievance", "Public Grievance Cell"),
    ("approval", "Approval Bureau"),
    ("regulation", "Regulation Bureau"),
    ("anti-ragging", "Anti-Ragging Cell"),
    ("vigilance-cvc", "Vigilance / CVC Cell"),
    ("finance", "Finance Bureau"),
)


def load_demo_data() -> dict:
    return json.loads(DEMO_DATA_PATH.read_text(encoding="utf-8"))


def _bureau_code_by_name(db: Session) -> dict[str, str]:
    return {bureau.name: bureau.code for bureau in db.scalars(select(Bureau)).all()}


def _to_ist(value: str) -> datetime:
    return datetime.fromisoformat(value).replace(tzinfo=IST)


def _has_demo_related_cases(db: Session, entity_id: str) -> bool:
    case_ids = CASE_ID_PATTERN.findall(entity_id)
    if not case_ids:
        return True
    return all(
        (complaint := db.get(Complaint, case_id)) is not None and complaint.is_demo
        for case_id in case_ids
    )


def seed_demo(db: Session, demo_data: dict | None = None) -> dict[str, int]:
    """Add missing demo rows; existing rows, including demo rows, are never updated."""
    demo_data = demo_data or load_demo_data()
    created = {
        "institutions": 0,
        "bureaus": 0,
        "complaints": 0,
        "workflow_events": 0,
        "case_links": 0,
        "audit_events": 0,
    }

    for code, name in BUREAUS:
        if db.get(Bureau, code) is None and db.scalar(select(Bureau).where(Bureau.name == name)) is None:
            db.add(Bureau(code=code, name=name))
            created["bureaus"] += 1
    db.flush()

    for row in demo_data["institutionsData"]:
        if db.get(Institution, row["aicteId"]) is not None:
            continue
        db.add(
            Institution(
                aicte_id=row["aicteId"],
                name=row["name"],
                city=row["city"],
                state=row["state"],
                region=row["region"],
                institution_type=row["type"],
                intake=row["intake"],
                risk_score=row["riskScore"],
                eoa_status=row["eoaStatus"],
                eoa_hold=row["eoaHold"],
                hold_reason=row["holdReason"],
                summary=row["summary"],
                is_demo=True,
            )
        )
        created["institutions"] += 1
    db.flush()

    bureau_codes = _bureau_code_by_name(db)
    demo_case_rows: dict[str, dict] = {}
    for row in demo_data["casesData"]:
        case_id = row["caseId"]
        if db.get(Complaint, case_id) is not None:
            continue
        institution = db.get(Institution, row["aicteId"])
        bureau_code = bureau_codes.get(row["bureau"])
        # Avoid attaching synthetic complaints to a caller's real institution row.
        if institution is None or not institution.is_demo or bureau_code is None:
            continue
        complaint = Complaint(
            case_id=case_id,
            institution_id=row["aicteId"],
            bureau_code=bureau_code,
            category=row["category"],
            title=row["title"],
            priority=row["priority"],
            status=row["status"],
            assigned_officer=row["officer"],
            source=row["source"],
            complainant=row["complainant"],
            filed_date=date.fromisoformat(row["filedDate"]),
            due_date=date.fromisoformat(row["dueDate"]),
            is_demo=True,
        )
        db.add(complaint)
        db.flush()
        db.add(
            WorkflowEvent(
                complaint_id=case_id,
                event_type="CASE_IMPORTED",
                to_status=complaint.status,
                to_bureau_code=complaint.bureau_code,
                assigned_officer=complaint.assigned_officer,
                actor="Frontend demo import",
                note=row.get("resolutionNotes"),
                occurred_at=datetime.combine(complaint.filed_date, time.min, tzinfo=IST),
                seed_key=f"demo:workflow:case:{case_id}",
                is_demo=True,
            )
        )
        created["complaints"] += 1
        created["workflow_events"] += 1
        demo_case_rows[case_id] = row

    # Include previously seeded demo rows when rerunning, without touching them.
    for case_id in (row["caseId"] for row in demo_data["casesData"]):
        complaint = db.get(Complaint, case_id)
        if complaint is not None and complaint.is_demo:
            demo_case_rows.setdefault(case_id, next(row for row in demo_data["casesData"] if row["caseId"] == case_id))

    db.flush()
    existing_workflow_keys = set(
        db.scalars(select(WorkflowEvent.seed_key).where(WorkflowEvent.seed_key.is_not(None))).all()
    )
    audit_rows = demo_data["auditLogsData"]
    for index, row in enumerate(audit_rows, start=1):
        seed_key = f"demo:workflow:audit:{index}"
        if seed_key in existing_workflow_keys or not _has_demo_related_cases(db, row["entityId"]):
            continue
        case_ids = CASE_ID_PATTERN.findall(row["entityId"])
        if len(case_ids) != 1 or case_ids[0] not in demo_case_rows:
            continue
        complaint = db.get(Complaint, case_ids[0])
        status_match = STATUS_CHANGE_PATTERN.search(row["diff"])
        db.add(
            WorkflowEvent(
                complaint_id=complaint.case_id,
                event_type=row["actionType"],
                from_status=status_match.group(1) if status_match else None,
                to_status=status_match.group(2) if status_match else complaint.status,
                to_bureau_code=bureau_codes.get(row["bureau"], complaint.bureau_code),
                assigned_officer=complaint.assigned_officer,
                actor=row["actor"],
                note=row["diff"],
                occurred_at=_to_ist(row["timestamp"]),
                seed_key=seed_key,
                is_demo=True,
            )
        )
        existing_workflow_keys.add(seed_key)
        created["workflow_events"] += 1

    suggestion_rows = demo_data["aiSuggestionsData"]
    suggestions_by_pair: dict[tuple[str, str], dict] = {}
    for suggestion in suggestion_rows:
        pair = tuple(sorted((suggestion["caseA"]["id"], suggestion["caseB"]["id"])))
        suggestions_by_pair[pair] = suggestion

    pair_sources: dict[tuple[str, str], tuple[str, str]] = {}
    for case_id, row in demo_case_rows.items():
        for linked_id in row.get("linkedCases", []):
            if linked_id not in demo_case_rows or linked_id == case_id:
                continue
            pair = tuple(sorted((case_id, linked_id)))
            pair_sources.setdefault(pair, (case_id, linked_id))
    for pair, suggestion in suggestions_by_pair.items():
        if pair[0] in demo_case_rows and pair[1] in demo_case_rows:
            pair_sources.setdefault(pair, (suggestion["caseA"]["id"], suggestion["caseB"]["id"]))

    existing_links = db.scalars(select(CaseLink)).all()
    existing_pairs = {
        tuple(sorted((link.source_case_id, link.target_case_id)))
        for link in existing_links
    }
    existing_suggestion_ids = {link.suggestion_id for link in existing_links if link.suggestion_id}
    for pair, orientation in pair_sources.items():
        if pair in existing_pairs:
            continue
        suggestion = suggestions_by_pair.get(pair)
        suggestion_id = suggestion["id"] if suggestion else None
        if suggestion_id and suggestion_id in existing_suggestion_ids:
            continue
        source_id, target_id = orientation
        db.add(
            CaseLink(
                source_case_id=source_id,
                target_case_id=target_id,
                relationship_type=suggestion["relationshipType"] if suggestion else "Existing Related Case",
                similarity_score=suggestion["similarity"] if suggestion else None,
                state=suggestion["state"] if suggestion else "Confirmed Link",
                note=suggestion["aiExplanation"] if suggestion else "Imported from the frontend's linkedCases sample data.",
                suggestion_id=suggestion_id,
                seed_key=f"demo:link:{suggestion_id or ':'.join(pair)}",
                is_demo=True,
            )
        )
        existing_pairs.add(pair)
        created["case_links"] += 1

    db.flush()
    existing_audit_keys = set(
        db.scalars(select(AuditEvent.seed_key).where(AuditEvent.seed_key.is_not(None))).all()
    )
    for index, row in enumerate(audit_rows, start=1):
        seed_key = f"demo:audit:{index}"
        if seed_key in existing_audit_keys or not _has_demo_related_cases(db, row["entityId"]):
            continue
        bureau_code = bureau_codes.get(row["bureau"])
        db.add(
            AuditEvent(
                occurred_at=_to_ist(row["timestamp"]),
                action_type=row["actionType"],
                entity_type="complaint" if CASE_ID_PATTERN.search(row["entityId"]) else "system",
                entity_id=row["entityId"],
                actor=row["actor"],
                bureau_code=bureau_code,
                bureau_label=None if bureau_code else row["bureau"],
                details=row["diff"],
                seed_key=seed_key,
                is_demo=True,
            )
        )
        existing_audit_keys.add(seed_key)
        created["audit_events"] += 1

    db.commit()
    return created


def main() -> None:
    with SessionLocal() as db:
        result = seed_demo(db)
    print("AICTE NEXUS demo seed complete (insert-only):")
    for table, count in result.items():
        print(f"  {table}: {count} inserted")


if __name__ == "__main__":
    main()

