import json
import os
import csv
import hashlib
import logging
import io
import re
from collections import Counter, defaultdict
from datetime import date, datetime, timezone
from difflib import SequenceMatcher

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import and_, func, or_, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session, selectinload

from .database import get_db
from .models import AuditEvent, Bureau, CaseLink, Complaint, Institution, WorkflowEvent, utc_now
from .schemas import (
    AuditEventCreate,
    AuditEventRead,
    BureauRead,
    CaseLinkCreate,
    CaseLinkRead,
    CaseLinkUpdate,
    ComplaintCreate,
    ComplaintRead,
    ComplaintUpdate,
    InstitutionUpdate,
    InstitutionRead,
    WorkflowEventRead,
)

app = FastAPI(title="AICTE NEXUS API", version="0.1.0")
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://127.0.0.1:8000,http://localhost:8000"
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    from sqlalchemy import text
    try:
        db.execute(text("SELECT 1"))
        db.execute(select(Complaint.case_id).limit(1))
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="Database unavailable or schema not migrated. Check DATABASE_URL, database service, and run Alembic migrations.") from exc
    return {"status": "ok", "database": "ok"}


@app.exception_handler(SQLAlchemyError)
async def database_error_handler(_request, _exc):
    # Keep driver errors, credentials, and SQL details out of client responses.
    logging.getLogger("aicte_nexus").exception("Database operation failed", exc_info=_exc)
    return Response(
        content=json.dumps({"detail": "Database operation failed. Check server configuration and logs."}),
        status_code=503,
        media_type="application/json",
    )


def _check_references(db: Session, institution_id: str | None, bureau_code: str | None) -> None:
    if institution_id and db.get(Institution, institution_id) is None:
        raise HTTPException(status_code=404, detail=f"Institution '{institution_id}' was not found")
    if bureau_code and db.get(Bureau, bureau_code) is None:
        raise HTTPException(status_code=404, detail=f"Bureau '{bureau_code}' was not found")


def _complaint_read(db: Session, complaint: Complaint) -> ComplaintRead:
    events = db.scalars(
        select(WorkflowEvent)
        .where(WorkflowEvent.complaint_id == complaint.case_id)
        .order_by(WorkflowEvent.occurred_at.desc(), WorkflowEvent.id.desc())
    ).all()
    note = next((event.note for event in events if event.note), None)
    linked_rows = db.execute(
        select(CaseLink.source_case_id, CaseLink.target_case_id)
        .where(
            or_(
                CaseLink.source_case_id == complaint.case_id,
                CaseLink.target_case_id == complaint.case_id,
            ),
            CaseLink.state.in_(("Confirmed Link", "Merged Duplicate")),
        )
    ).all()
    linked_cases = sorted(
        {
            target if source == complaint.case_id else source
            for source, target in linked_rows
        }
    )
    overdue_days = max((date.today() - complaint.due_date).days, 0)
    is_overdue = complaint.status not in {"Resolved", "Closed"} and complaint.due_date < date.today()
    return ComplaintRead(
        case_id=complaint.case_id,
        institution_id=complaint.institution_id,
        institution_name=complaint.institution.name,
        bureau_code=complaint.bureau_code,
        bureau=complaint.bureau.name,
        category=complaint.category,
        title=complaint.title,
        priority=complaint.priority,
        status=complaint.status,
        assigned_officer=complaint.assigned_officer,
        source=complaint.source,
        complainant=complaint.complainant,
        filed_date=complaint.filed_date,
        due_date=complaint.due_date,
        overdue_days=overdue_days if is_overdue else 0,
        is_overdue=is_overdue,
        linked_cases=list(linked_cases),
        resolution_notes=note,
        is_demo=complaint.is_demo,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
    )


def _write_initial_events(db: Session, complaint: Complaint, actor: str, note: str | None) -> None:
    db.add(
        WorkflowEvent(
            complaint_id=complaint.case_id,
            event_type="CASE_CREATED",
            to_status=complaint.status,
            to_bureau_code=complaint.bureau_code,
            assigned_officer=complaint.assigned_officer,
            actor=actor,
            note=note,
            is_demo=complaint.is_demo,
        )
    )
    db.add(
        AuditEvent(
            action_type="CASE_INGESTED",
            entity_type="complaint",
            entity_id=complaint.case_id,
            actor=actor,
            bureau_code=complaint.bureau_code,
            details="Complaint created through the API.",
            is_demo=complaint.is_demo,
        )
    )


def _audit_read(db: Session, row: AuditEvent) -> AuditEventRead:
    bureau = db.get(Bureau, row.bureau_code) if row.bureau_code else None
    return AuditEventRead(
        id=row.id,
        occurred_at=row.occurred_at,
        action_type=row.action_type,
        entity_type=row.entity_type,
        entity_id=row.entity_id,
        actor=row.actor,
        bureau_code=row.bureau_code,
        bureau=bureau.name if bureau else (row.bureau_label or "System"),
        details=row.details,
        is_demo=row.is_demo,
    )


def _case_link_read(row: CaseLink) -> CaseLinkRead:
    return CaseLinkRead(
        id=row.id,
        source_case_id=row.source_case_id,
        target_case_id=row.target_case_id,
        relationship_type=row.relationship_type,
        similarity_score=float(row.similarity_score) if row.similarity_score is not None else None,
        state=row.state,
        note=row.note,
        suggestion_id=row.suggestion_id,
        is_demo=row.is_demo,
        created_at=row.created_at,
        reviewed_at=row.reviewed_at,
    )


@app.get("/api/complaints", response_model=list[ComplaintRead])
def list_complaints(db: Session = Depends(get_db)):
    complaints = db.scalars(
        select(Complaint).options(selectinload(Complaint.institution), selectinload(Complaint.bureau)).order_by(Complaint.case_id)
    ).all()
    return [_complaint_read(db, complaint) for complaint in complaints]


@app.get("/api/complaints/next-id")
def next_complaint_id(db: Session = Depends(get_db)):
    rows = db.scalars(select(Complaint.case_id)).all()
    year = date.today().year
    numbers = [int(match.group(1)) for case_id in rows
               if (match := re.fullmatch(rf"CMP-{year}-(\d+)", case_id))]
    return {"case_id": f"CMP-{year}-{max(numbers, default=0) + 1:04d}"}


@app.post("/api/complaints", response_model=ComplaintRead, status_code=status.HTTP_201_CREATED)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    _check_references(db, payload.institution_id, payload.bureau_code)
    if db.get(Complaint, payload.case_id) is not None:
        raise HTTPException(status_code=409, detail=f"Complaint '{payload.case_id}' already exists")
    related_ids = list(dict.fromkeys(payload.linked_case_ids))
    if payload.case_id in related_ids:
        raise HTTPException(status_code=422, detail="A complaint cannot be linked to itself")
    for linked_id in related_ids:
        if db.get(Complaint, linked_id) is None:
            raise HTTPException(status_code=404, detail=f"Related complaint '{linked_id}' was not found")
    values = payload.model_dump(exclude={"resolution_note", "linked_case_ids", "actor"})
    complaint = Complaint(**values)
    db.add(complaint)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"Complaint '{payload.case_id}' already exists")
    actor = payload.actor or payload.assigned_officer
    _write_initial_events(db, complaint, actor, payload.resolution_note)
    for linked_id in related_ids:
        linked_complaint = db.get(Complaint, linked_id)
        link_type = (
            "Cross-Bureau Causal Link"
            if linked_complaint.bureau_code != complaint.bureau_code
            else "Related Complaint"
        )
        db.add(
            CaseLink(
                source_case_id=complaint.case_id,
                target_case_id=linked_id,
                relationship_type=link_type,
                state="Pending Review",
                note="Linked to an existing complaint during complaint registration.",
                is_demo=complaint.is_demo,
            )
        )
        db.add(
            AuditEvent(
                action_type="RELATIONSHIP_LINKED",
                entity_type="case_link",
                entity_id=f"{complaint.case_id} ↔ {linked_id}",
                actor=actor,
                bureau_code=complaint.bureau_code,
                details=f"Relationship created during complaint registration: {link_type}.",
                is_demo=complaint.is_demo,
            )
        )
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"Complaint '{payload.case_id}' already exists")
    db.refresh(complaint)
    return _complaint_read(db, complaint)


@app.get("/api/complaints/{case_id}", response_model=ComplaintRead)
def get_complaint(case_id: str, db: Session = Depends(get_db)):
    complaint = db.scalar(
        select(Complaint)
        .where(Complaint.case_id == case_id)
        .options(selectinload(Complaint.institution), selectinload(Complaint.bureau))
    )
    if complaint is None:
        raise HTTPException(status_code=404, detail=f"Complaint '{case_id}' was not found")
    return _complaint_read(db, complaint)


@app.get("/api/complaints/{case_id}/workflow-events", response_model=list[WorkflowEventRead])
def list_workflow_events(case_id: str, db: Session = Depends(get_db)):
    if db.get(Complaint, case_id) is None:
        raise HTTPException(status_code=404, detail=f"Complaint '{case_id}' was not found")
    return db.scalars(
        select(WorkflowEvent)
        .where(WorkflowEvent.complaint_id == case_id)
        .order_by(WorkflowEvent.occurred_at, WorkflowEvent.id)
    ).all()


@app.patch("/api/complaints/{case_id}", response_model=ComplaintRead)
def update_complaint(case_id: str, payload: ComplaintUpdate, db: Session = Depends(get_db)):
    complaint = db.scalar(
        select(Complaint)
        .where(Complaint.case_id == case_id)
        .options(selectinload(Complaint.institution), selectinload(Complaint.bureau))
    )
    if complaint is None:
        raise HTTPException(status_code=404, detail=f"Complaint '{case_id}' was not found")

    changes = payload.model_dump(exclude_unset=True)
    resolution_note = changes.pop("resolution_note", None)
    actor = changes.pop("actor", None) or complaint.assigned_officer
    for key in ("filed_date", "due_date"):
        if key in changes and changes[key] is None:
            raise HTTPException(status_code=422, detail=f"{key} cannot be null")
    if changes.get("filed_date", complaint.filed_date) > changes.get("due_date", complaint.due_date):
        raise HTTPException(status_code=422, detail="due_date must be on or after filed_date")
    _check_references(db, changes.get("institution_id"), changes.get("bureau_code"))

    old_status = complaint.status
    old_bureau = complaint.bureau_code
    old_officer = complaint.assigned_officer
    old_values = {
        key: getattr(complaint, key)
        for key in changes
    }
    for key, value in changes.items():
        setattr(complaint, key, value)

    workflow_changed = any(
        getattr(complaint, field) != old
        for field, old in (
            ("status", old_status),
            ("bureau_code", old_bureau),
            ("assigned_officer", old_officer),
        )
    ) or bool(resolution_note)
    if workflow_changed:
        event_type = (
            "BUREAU_ESCALATION" if complaint.bureau_code != old_bureau
            else "STATUS_CHANGED" if complaint.status != old_status
            else "ASSIGNMENT_CHANGED" if complaint.assigned_officer != old_officer
            else "NOTE_ADDED"
        )
        db.add(
            WorkflowEvent(
                complaint_id=complaint.case_id,
                event_type=event_type,
                from_status=old_status,
                to_status=complaint.status,
                from_bureau_code=old_bureau,
                to_bureau_code=complaint.bureau_code,
                assigned_officer=complaint.assigned_officer,
                actor=actor,
                note=resolution_note,
                is_demo=complaint.is_demo,
            )
        )
    details = {key: {"from": str(old_values[key]), "to": str(value)} for key, value in changes.items() if old_values[key] != value}
    if resolution_note:
        details["resolution_note"] = resolution_note
    db.add(
        AuditEvent(
            action_type="COMPLAINT_UPDATED",
            entity_type="complaint",
            entity_id=complaint.case_id,
            actor=actor,
            bureau_code=complaint.bureau_code,
            details=json.dumps(details, ensure_ascii=False),
            is_demo=complaint.is_demo,
        )
    )
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Update conflicts with a database constraint") from exc
    db.refresh(complaint)
    return _complaint_read(db, complaint)


@app.delete("/api/complaints/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_complaint(case_id: str, db: Session = Depends(get_db)):
    complaint = db.get(Complaint, case_id)
    if complaint is None:
        raise HTTPException(status_code=404, detail=f"Complaint '{case_id}' was not found")
    db.delete(complaint)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/api/institutions", response_model=list[InstitutionRead])
def list_institutions(db: Session = Depends(get_db)):
    return db.scalars(select(Institution).order_by(Institution.name)).all()


@app.get("/api/institutions/{aicte_id}", response_model=InstitutionRead)
def get_institution(aicte_id: str, db: Session = Depends(get_db)):
    institution = db.get(Institution, aicte_id)
    if institution is None:
        raise HTTPException(status_code=404, detail=f"Institution '{aicte_id}' was not found")
    return institution


@app.patch("/api/institutions/{aicte_id}", response_model=InstitutionRead)
def update_institution(aicte_id: str, payload: InstitutionUpdate, db: Session = Depends(get_db)):
    institution = db.get(Institution, aicte_id)
    if institution is None:
        raise HTTPException(status_code=404, detail=f"Institution '{aicte_id}' was not found")
    changes = payload.model_dump(exclude_unset=True)
    actor = changes.pop("actor", None) or "Command Desk"
    old_values = {key: getattr(institution, key) for key in changes}
    for key, value in changes.items():
        setattr(institution, key, value)
    details = {
        key: {"from": old_values[key], "to": value}
        for key, value in changes.items()
        if old_values[key] != value
    }
    if details:
        db.add(
            AuditEvent(
                action_type="EOA_HOLD_TOGGLED" if "eoa_hold" in details else "INSTITUTION_UPDATED",
                entity_type="institution",
                entity_id=institution.aicte_id,
                actor=actor,
                bureau_code="approval",
                details=json.dumps(details, ensure_ascii=False),
                is_demo=institution.is_demo,
            )
        )
    db.commit()
    db.refresh(institution)
    return institution


@app.get("/api/bureaus", response_model=list[BureauRead])
def list_bureaus(db: Session = Depends(get_db)):
    return db.scalars(select(Bureau).order_by(Bureau.name)).all()


@app.get("/api/bureaus/{code}", response_model=BureauRead)
def get_bureau(code: str, db: Session = Depends(get_db)):
    bureau = db.get(Bureau, code)
    if bureau is None:
        raise HTTPException(status_code=404, detail=f"Bureau '{code}' was not found")
    return bureau


@app.get("/api/case-links", response_model=list[CaseLinkRead])
def list_case_links(db: Session = Depends(get_db)):
    rows = db.scalars(select(CaseLink).order_by(CaseLink.id)).all()
    return [_case_link_read(row) for row in rows]


def _suggestion_id(left: str, right: str) -> str:
    pair = "|".join(sorted((left, right)))
    return "RULE-" + hashlib.sha1(pair.encode("utf-8")).hexdigest()[:16]


def _explain_complaint_match(left: Complaint, right: Complaint) -> dict:
    """Return a reproducible, explainable score from persisted complaint fields."""
    token_re = re.compile(r"[a-z0-9]+")
    left_tokens = set(token_re.findall(f"{left.title} {left.category}".lower()))
    right_tokens = set(token_re.findall(f"{right.title} {right.category}".lower()))
    union = left_tokens | right_tokens
    overlap = len(left_tokens & right_tokens) / len(union) if union else 0
    title_similarity = SequenceMatcher(None, left.title.casefold(), right.title.casefold()).ratio()
    same_institution = left.institution_id == right.institution_id
    same_category = left.category.casefold() == right.category.casefold()
    score = min(99, round(35 * same_institution + 25 * same_category + 25 * overlap + 15 * title_similarity))
    institution = left.institution
    signals = []
    if same_institution:
        signals.append(f"same institution ({institution.aicte_id})")
    if same_category:
        signals.append(f"same category ({left.category})")
    if overlap >= 0.15:
        signals.append(f"shared title/category terms ({round(overlap * 100)}% Jaccard overlap)")
    if title_similarity >= 0.5:
        signals.append(f"title similarity ({round(title_similarity * 100)}%)")
    duplicate = same_institution and same_category and title_similarity >= 0.78
    relationship_type = "Duplicate" if duplicate else (
        "Cross-Bureau Causal Link" if left.bureau_code != right.bureau_code else "Related Complaint"
    )
    return {
        "score": score,
        "signals": signals,
        "relationship_type": relationship_type,
        "duplicate": duplicate,
    }


@app.get("/api/case-links/suggestions")
def list_case_link_suggestions(db: Session = Depends(get_db)):
    """Explainable local heuristics; this endpoint does not call an AI service."""
    complaints = db.scalars(
        select(Complaint).options(selectinload(Complaint.institution), selectinload(Complaint.bureau))
        .order_by(Complaint.case_id)
    ).all()
    persisted = db.scalars(select(CaseLink)).all()
    by_pair = {tuple(sorted((link.source_case_id, link.target_case_id))): link for link in persisted}
    results = []
    for link in persisted:
        left, right = db.get(Complaint, link.source_case_id), db.get(Complaint, link.target_case_id)
        if not left or not right:
            continue
        match = _explain_complaint_match(left, right)
        institution = left.institution
        seeded_candidate = link.is_demo and link.state == "Pending Review"
        results.append({
            "id": link.suggestion_id or _suggestion_id(left.case_id, right.case_id),
            "similarity": float(link.similarity_score or match["score"]) if seeded_candidate else match["score"],
            "relationshipType": link.relationship_type,
            "state": link.state,
            "aicteId": institution.aicte_id,
            "institutionName": institution.name,
            "caseA": {"id": left.case_id, "bureau": left.bureau.name, "summary": left.title},
            "caseB": {"id": right.case_id, "bureau": right.bureau.name, "summary": right.title},
            "matchedEntities": match["signals"],
            "aiExplanation": (
                f"Synthetic demo scenario note (not a model explanation): {link.note or 'No scenario note was supplied.'}"
                if seeded_candidate else
                "Rule-based candidate only; no AI service is used. Matching signals: " + "; ".join(match["signals"]) + "."
                if link.state == "Pending Review" else
                link.note or "Officer-reviewed relationship."
            ),
            "match_source": "synthetic_demo_scenario" if seeded_candidate else (
                "rule_based" if link.state == "Pending Review" else "officer_reviewed"
            ),
            "is_demo": bool(link.is_demo),
            "backendLinkId": link.id,
        })
    for index, left in enumerate(complaints):
        for right in complaints[index + 1:]:
            pair = tuple(sorted((left.case_id, right.case_id)))
            if pair in by_pair:
                continue
            match = _explain_complaint_match(left, right)
            if match["score"] < 45:
                continue
            institution = left.institution
            results.append({
                "id": _suggestion_id(left.case_id, right.case_id),
                "similarity": match["score"],
                "relationshipType": match["relationship_type"],
                "state": "Pending Review",
                "aicteId": institution.aicte_id,
                "institutionName": institution.name,
                "caseA": {"id": left.case_id, "bureau": left.bureau.name, "summary": left.title},
                "caseB": {"id": right.case_id, "bureau": right.bureau.name, "summary": right.title},
                "matchedEntities": match["signals"],
                "aiExplanation": "Rule-based candidate only; no AI service is used. Matching signals: " + "; ".join(match["signals"]) + ". Confirm or dismiss after officer review.",
                "match_source": "rule_based",
                "is_demo": bool(left.is_demo and right.is_demo),
            })
    return sorted(results, key=lambda item: (-item["similarity"], item["id"]))


@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    complaints = db.scalars(select(Complaint).options(selectinload(Complaint.institution), selectinload(Complaint.bureau))).all()
    institutions = db.scalars(select(Institution)).all()
    today = date.today()
    active = [c for c in complaints if c.status not in {"Resolved", "Closed"}]
    overdue = [c for c in active if c.due_date < today]
    resolved = [c for c in complaints if c.status in {"Resolved", "Closed"}]
    bureau_colors = ["bg-rose-600", "bg-blue-600", "bg-amber-500", "bg-purple-600", "bg-emerald-600", "bg-cyan-600"]
    bureau_stats = []
    sla_targets = {"public-grievance": 15, "approval": 15, "regulation": 21, "anti-ragging": 7, "vigilance-cvc": 30, "finance": 15}
    for index, bureau in enumerate(db.scalars(select(Bureau).order_by(Bureau.name)).all()):
        rows = [c for c in complaints if c.bureau_code == bureau.code]
        open_rows = [c for c in rows if c.status not in {"Resolved", "Closed"}]
        overdue_rows = [c for c in open_rows if c.due_date < today]
        closed_rows = [c for c in rows if c.status in {"Resolved", "Closed"}]
        resolved_days = [(c.updated_at.date() - c.filed_date).days for c in closed_rows if c.updated_at]
        target = sla_targets.get(bureau.code, 15)
        met = sum(1 for c in closed_rows if (c.updated_at.date() - c.filed_date).days <= target) if closed_rows else 0
        bureau_stats.append({
            "code": bureau.code, "name": bureau.name, "total": len(rows), "open": len(open_rows),
            "overdue": len(overdue_rows), "resolved": len(closed_rows), "color": bureau_colors[index % len(bureau_colors)],
            "compliance": round(met / len(closed_rows) * 100) if closed_rows else 0,
            "avgDays": round(sum(resolved_days) / len(resolved_days)) if resolved_days else 0,
            "targetDays": target,
        })
    category_counts = Counter(c.category for c in complaints)
    categories = [{"category": name, "count": count, "pct": round(count / max(len(complaints), 1) * 100), "bureaus": "Observed in persisted complaints"}
                  for name, count in category_counts.most_common(8)]
    regional = defaultdict(list)
    for complaint in complaints:
        regional[complaint.institution.region].append(complaint)
    regions = []
    for name, rows in sorted(regional.items()):
        breached = sum(1 for c in rows if c.status not in {"Resolved", "Closed"} and c.due_date < today)
        rate = breached / max(len(rows), 1)
        regions.append({"name": name, "cases": len(rows), "overdue": breached,
                        "instFlagged": len({c.institution_id for c in rows if c.institution.eoa_hold}),
                        "level": "High Risk" if rate >= .5 else "Moderate" if rate >= .25 else "Controlled"})
    return {
        "generated_at": datetime.now(timezone.utc),
        "total": len(complaints), "open": len(active), "resolved": len(resolved), "overdue": len(overdue),
        "institutions_flagged": sum(1 for i in institutions if i.eoa_hold),
        "critical": sum(1 for c in active if c.priority in {"Critical", "High"}),
        "bureau_stats": bureau_stats, "categories": categories, "regions": regions,
    }


@app.get("/api/reports/complaints.csv")
def complaints_csv_report(
    bureau: str = "ALL", priority: str = "ALL", scope: str = "ALL", db: Session = Depends(get_db)
):
    if priority not in {"ALL", "CRITICAL_HIGH", "Critical", "High", "Medium", "Low"}:
        raise HTTPException(status_code=422, detail="Unsupported priority filter")
    if scope not in {"ALL", "OPEN", "OVERDUE", "RESOLVED"}:
        raise HTTPException(status_code=422, detail="Unsupported scope filter")
    rows = db.scalars(select(Complaint).options(selectinload(Complaint.institution), selectinload(Complaint.bureau)).order_by(Complaint.case_id)).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Case_ID", "AICTE_Permanent_ID", "Institution_Name", "Assigned_Bureau", "Violation_Category", "Priority", "Status", "Assigned_Officer", "Source_Channel", "Filed_Date", "Due_Date", "Overdue_Days", "Cross_Bureau_Links", "Official_Verification_Notes"])
    for c in rows:
        if bureau != "ALL" and c.bureau.name != bureau: continue
        if priority == "CRITICAL_HIGH" and c.priority not in {"Critical", "High"}: continue
        if priority not in {"ALL", "CRITICAL_HIGH"} and c.priority != priority: continue
        closed = c.status in {"Resolved", "Closed"}
        overdue_days = max((date.today() - c.due_date).days, 0) if not closed else 0
        if scope == "OPEN" and closed or scope == "RESOLVED" and not closed or scope == "OVERDUE" and overdue_days == 0: continue
        linked = db.execute(select(CaseLink.source_case_id, CaseLink.target_case_id).where(or_(CaseLink.source_case_id == c.case_id, CaseLink.target_case_id == c.case_id), CaseLink.state != "Dismissed")).all()
        related = sorted({target if source == c.case_id else source for source, target in linked})
        events = db.scalars(select(WorkflowEvent).where(WorkflowEvent.complaint_id == c.case_id).order_by(WorkflowEvent.occurred_at.desc())).all()
        note = next((e.note for e in events if e.note), "")
        writer.writerow([c.case_id, c.institution_id, c.institution.name, c.bureau.name, c.category, c.priority, c.status, c.assigned_officer, c.source, c.filed_date.isoformat(), c.due_date.isoformat(), overdue_days, ";".join(related), note])
    return Response(output.getvalue(), media_type="text/csv; charset=utf-8", headers={"Content-Disposition": "attachment; filename=AICTE_SIH26264_Filtered_Complaint_Report.csv"})


@app.get("/api/reports/shc.json")
def shc_json_report(
    bureau: str = "ALL", priority: str = "ALL", scope: str = "ALL", db: Session = Depends(get_db)
):
    if priority not in {"ALL", "CRITICAL_HIGH", "Critical", "High", "Medium", "Low"}:
        raise HTTPException(status_code=422, detail="Unsupported priority filter")
    if scope not in {"ALL", "OPEN", "OVERDUE", "RESOLVED"}:
        raise HTTPException(status_code=422, detail="Unsupported scope filter")
    analytics = get_analytics(db)
    complaints = db.scalars(select(Complaint).options(selectinload(Complaint.institution), selectinload(Complaint.bureau)).order_by(Complaint.case_id)).all()
    rows = []
    for complaint in complaints:
        if bureau != "ALL" and complaint.bureau.name != bureau: continue
        if priority == "CRITICAL_HIGH" and complaint.priority not in {"Critical", "High"}: continue
        if priority not in {"ALL", "CRITICAL_HIGH"} and complaint.priority != priority: continue
        closed = complaint.status in {"Resolved", "Closed"}
        is_overdue = not closed and complaint.due_date < date.today()
        if scope == "OPEN" and closed or scope == "RESOLVED" and not closed or scope == "OVERDUE" and not is_overdue: continue
        rows.append(_complaint_read(db, complaint).model_dump(mode="json"))
    institutions = db.scalars(select(Institution).order_by(Institution.name)).all()
    return JSONResponse({
        "problemStatementId": "SIH26264",
        "organization": "All India Council for Technical Education (AICTE)",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "executiveSummary": {
            "totalLedgerComplaints": analytics["total"], "openCases": analytics["open"],
            "resolvedCases": analytics["resolved"], "overdueSlaCases": analytics["overdue"],
            "flaggedInstitutionsCount": analytics["institutions_flagged"],
        },
        "exportedCasesCount": len(rows),
        "institutionsOnEoAHold": [InstitutionRead.model_validate(row).model_dump(mode="json") for row in institutions if row.eoa_hold],
        "cases": rows,
    }, headers={"Content-Disposition": "attachment; filename=AICTE_Standing_Hearing_Committee_Dossier_SIH26264.json"})


@app.get("/api/reports/audit.csv")
def audit_csv_report(db: Session = Depends(get_db)):
    events = db.scalars(select(AuditEvent).order_by(AuditEvent.occurred_at.desc(), AuditEvent.id.desc())).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Timestamp", "Action_Type", "Entity_Type", "Entity_ID", "Actor", "Bureau", "Details", "Event_ID"])
    for event in events:
        bureau = db.get(Bureau, event.bureau_code) if event.bureau_code else None
        writer.writerow([event.occurred_at.isoformat(), event.action_type, event.entity_type, event.entity_id,
                         event.actor or "System", bureau.name if bureau else (event.bureau_label or "System"), event.details, event.id])
    return Response(output.getvalue(), media_type="text/csv; charset=utf-8", headers={"Content-Disposition": "attachment; filename=AICTE_SIH26264_Audit_Trail.csv"})


@app.post("/api/case-links", response_model=CaseLinkRead, status_code=status.HTTP_201_CREATED)
def create_case_link(payload: CaseLinkCreate, db: Session = Depends(get_db)):
    source = db.get(Complaint, payload.source_case_id)
    target = db.get(Complaint, payload.target_case_id)
    if source is None:
        raise HTTPException(status_code=404, detail=f"Complaint '{payload.source_case_id}' was not found")
    if target is None:
        raise HTTPException(status_code=404, detail=f"Complaint '{payload.target_case_id}' was not found")
    pair_exists = db.scalar(
        select(CaseLink).where(
            or_(
                and_(CaseLink.source_case_id == source.case_id, CaseLink.target_case_id == target.case_id),
                and_(CaseLink.source_case_id == target.case_id, CaseLink.target_case_id == source.case_id),
            )
        )
    )
    if pair_exists is not None:
        raise HTTPException(status_code=409, detail="A relationship for these complaints already exists")
    if payload.suggestion_id and db.scalar(
        select(CaseLink).where(CaseLink.suggestion_id == payload.suggestion_id)
    ):
        raise HTTPException(status_code=409, detail=f"Suggestion '{payload.suggestion_id}' already exists")
    values = payload.model_dump(exclude={"actor"})
    link = CaseLink(**values, is_demo=source.is_demo and target.is_demo)
    db.add(link)
    db.flush()
    db.add(
        AuditEvent(
            action_type="RELATIONSHIP_LINKED",
            entity_type="case_link",
            entity_id=f"{source.case_id} ↔ {target.case_id}",
            actor=payload.actor or "Command Desk",
            bureau_code=source.bureau_code,
            details=f"Relationship created: {link.relationship_type} ({link.state}).",
            is_demo=link.is_demo,
        )
    )
    db.commit()
    db.refresh(link)
    return _case_link_read(link)


@app.patch("/api/case-links/{link_id}", response_model=CaseLinkRead)
def update_case_link(link_id: int, payload: CaseLinkUpdate, db: Session = Depends(get_db)):
    link = db.get(CaseLink, link_id)
    if link is None:
        raise HTTPException(status_code=404, detail=f"Case link '{link_id}' was not found")
    old_state = link.state
    link.state = payload.state
    if "note" in payload.model_fields_set:
        link.note = payload.note
    link.reviewed_at = utc_now()
    details = json.dumps(
        {"from_state": old_state, "to_state": link.state, "note": link.note},
        ensure_ascii=False,
    )
    source = db.get(Complaint, link.source_case_id)
    db.add(
        AuditEvent(
            action_type="RELATIONSHIP_REVIEWED",
            entity_type="case_link",
            entity_id=f"{link.source_case_id} ↔ {link.target_case_id}",
            actor=payload.actor or "Command Desk",
            bureau_code=source.bureau_code if source else None,
            details=details,
            is_demo=link.is_demo,
        )
    )
    db.commit()
    db.refresh(link)
    return _case_link_read(link)


@app.get("/api/audit-events", response_model=list[AuditEventRead])
def list_audit_events(
    limit: int = Query(default=500, ge=1, le=2000),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(AuditEvent).order_by(AuditEvent.occurred_at.desc(), AuditEvent.id.desc()).limit(limit)
    ).all()
    return [_audit_read(db, row) for row in rows]


@app.post("/api/audit-events", response_model=AuditEventRead, status_code=status.HTTP_201_CREATED)
def create_audit_event(payload: AuditEventCreate, db: Session = Depends(get_db)):
    if payload.bureau_code and db.get(Bureau, payload.bureau_code) is None:
        raise HTTPException(status_code=404, detail=f"Bureau '{payload.bureau_code}' was not found")
    row = AuditEvent(**payload.model_dump(), is_demo=False)
    db.add(row)
    db.commit()
    db.refresh(row)
    return _audit_read(db, row)



# Serve only public assets; never expose backend configuration or database files.
FRONTEND_ROOT = Path(__file__).resolve().parents[2]
app.mount("/css", StaticFiles(directory=FRONTEND_ROOT / "css"), name="css")
app.mount("/js", StaticFiles(directory=FRONTEND_ROOT / "js"), name="js")

@app.get("/", include_in_schema=False)
@app.get("/AICTE.html", include_in_schema=False)
def frontend():
    return FileResponse(FRONTEND_ROOT / "AICTE.html")
