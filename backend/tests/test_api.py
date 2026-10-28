from sqlalchemy import func, select
from sqlalchemy.exc import OperationalError

from app.database import get_db
from app.main import app
from app.models import AuditEvent, WorkflowEvent


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


def test_validation_rejects_bad_case_id_and_priority(client, complaint_payload):
    complaint_payload["case_id"] = "not-a-case-id"
    response = client.post("/api/complaints", json=complaint_payload)
    assert response.status_code == 422

    complaint_payload["case_id"] = "CMP-2026-0100"
    complaint_payload["priority"] = "Urgent"
    response = client.post("/api/complaints", json=complaint_payload)
    assert response.status_code == 422

    complaint_payload["priority"] = "High"
    complaint_payload["due_date"] = "2026-09-01"
    assert client.post("/api/complaints", json=complaint_payload).status_code == 422


def test_validation_rejects_blank_fields(client, complaint_payload):
    complaint_payload["title"] = "     "
    assert client.post("/api/complaints", json=complaint_payload).status_code == 422


def test_create_retrieve_and_reference_reads(client, complaint_payload):
    response = client.post("/api/complaints", json=complaint_payload)
    assert response.status_code == 201
    assert response.json()["case_id"] == "CMP-2026-0100"
    assert response.json()["institution_name"] == "Satpura Institute of Engineering & Tech"
    assert response.json()["bureau"] == "Public Grievance Cell"
    assert client.post("/api/complaints", json=complaint_payload).status_code == 409

    fetched = client.get("/api/complaints/CMP-2026-0100")
    assert fetched.status_code == 200
    assert fetched.json()["status"] == "Submitted"
    assert len(client.get("/api/complaints").json()) == 1

    assert len(client.get("/api/institutions").json()) == 1
    assert client.get("/api/institutions/1-482910412").status_code == 200
    assert len(client.get("/api/bureaus").json()) == 2
    assert client.get("/api/bureaus/public-grievance").json()["name"] == "Public Grievance Cell"
    assert len(client.get("/api/complaints/CMP-2026-0100/workflow-events").json()) == 1


def test_create_rejects_unknown_references(client, complaint_payload):
    complaint_payload["institution_id"] = "missing-institution"
    response = client.post("/api/complaints", json=complaint_payload)
    assert response.status_code == 404
    assert "Institution" in response.json()["detail"]


def test_update_validates_resolution_note_and_records_events(client, complaint_payload):
    created = client.post("/api/complaints", json=complaint_payload)
    assert created.status_code == 201

    missing_note = client.patch(
        "/api/complaints/CMP-2026-0100", json={"status": "Resolved"}
    )
    assert missing_note.status_code == 422

    updated = client.patch(
        "/api/complaints/CMP-2026-0100",
        json={
            "status": "Resolved",
            "bureau_code": "approval",
            "assigned_officer": "Dr. Meenakshi Iyer",
            "resolution_note": "Verified official resolution note with evidence.",
        },
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "Resolved"
    assert updated.json()["bureau"] == "Approval Bureau"
    assert updated.json()["resolution_notes"] == "Verified official resolution note with evidence."
    with client.app.state.testing_sessionmaker() as db:
        assert db.scalar(select(func.count()).select_from(WorkflowEvent)) == 2
        assert db.scalar(select(func.count()).select_from(AuditEvent)) == 2


def test_delete_and_not_found(client, complaint_payload):
    client.post("/api/complaints", json=complaint_payload)
    deleted = client.delete("/api/complaints/CMP-2026-0100")
    assert deleted.status_code == 204
    assert client.get("/api/complaints/CMP-2026-0100").status_code == 404
    assert client.delete("/api/complaints/no-such-case").status_code == 404


def test_related_case_links_are_persisted_and_reviewed(client, complaint_payload):
    first = client.post("/api/complaints", json=complaint_payload)
    assert first.status_code == 201

    second_payload = {**complaint_payload, "case_id": "CMP-2026-0101", "bureau_code": "approval"}
    second_payload["linked_case_ids"] = ["CMP-2026-0100"]
    second = client.post("/api/complaints", json=second_payload)
    assert second.status_code == 201
    assert second.json()["linked_cases"] == []
    assert client.get("/api/complaints/CMP-2026-0100").json()["linked_cases"] == []

    links = client.get("/api/case-links").json()
    assert len(links) == 1
    assert links[0]["relationship_type"] == "Cross-Bureau Causal Link"
    reviewed = client.patch(
        f"/api/case-links/{links[0]['id']}",
        json={"state": "Confirmed Link", "note": "Reviewed by the command desk.", "actor": "Test Officer"},
    )
    assert reviewed.status_code == 200
    assert reviewed.json()["state"] == "Confirmed Link"
    assert client.get("/api/complaints/CMP-2026-0100").json()["linked_cases"] == ["CMP-2026-0101"]
    assert client.get("/api/complaints/CMP-2026-0101").json()["linked_cases"] == ["CMP-2026-0100"]
    audit_events = client.get("/api/audit-events").json()
    assert len(audit_events) == 4
    assert sum(event["action_type"] == "RELATIONSHIP_LINKED" for event in audit_events) == 1


def test_institution_and_audit_event_updates(client):
    updated = client.patch(
        "/api/institutions/1-482910412",
        json={
            "eoa_hold": False,
            "eoa_status": "Conditional EoA Active",
            "actor": "Chairman Command Desk",
        },
    )
    assert updated.status_code == 200
    assert updated.json()["eoa_hold"] is False
    assert updated.json()["is_demo"] is False

    created = client.post(
        "/api/audit-events",
        json={
            "action_type": "SUGGESTIONS_REFRESHED",
            "entity_type": "system",
            "entity_id": "AI-NLP-SCAN-2026",
            "actor": "Officer Triggered Scan",
            "bureau_label": "AI Correlation Engine",
            "details": "Logged a prototype refresh request; no matching was run.",
        },
    )
    assert created.status_code == 201
    assert created.json()["bureau"] == "AI Correlation Engine"
    events = client.get("/api/audit-events").json()
    assert events[0]["action_type"] == "SUGGESTIONS_REFRESHED"
    assert events[1]["action_type"] == "EOA_HOLD_TOGGLED"


def test_cors_allows_only_configured_local_frontend_origin(client):
    response = client.options(
        "/api/complaints",
        headers={
            "Origin": "http://127.0.0.1:8000",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:8000"
    assert "access-control-allow-credentials" not in response.headers


def test_next_id_analytics_and_filtered_csv_use_persisted_records(client, complaint_payload):
    assert client.get("/api/complaints/next-id").status_code == 200
    created = client.post("/api/complaints", json=complaint_payload)
    assert created.status_code == 201
    assert client.get("/api/complaints/next-id").json()["case_id"] == "CMP-2026-0101"

    analytics = client.get("/api/analytics")
    assert analytics.status_code == 200
    assert analytics.json()["total"] == 1
    assert analytics.json()["open"] == 1
    assert sum(row["total"] for row in analytics.json()["bureau_stats"]) == 1
    assert analytics.json()["categories"][0]["category"] == complaint_payload["category"]

    report = client.get("/api/reports/complaints.csv?scope=OPEN&priority=High")
    assert report.status_code == 200
    assert "CMP-2026-0100" in report.text
    assert client.get("/api/reports/complaints.csv?scope=INVALID").status_code == 422
    dossier = client.get("/api/reports/shc.json?scope=OPEN")
    assert dossier.status_code == 200
    assert dossier.json()["executiveSummary"]["totalLedgerComplaints"] == 1
    assert dossier.json()["exportedCasesCount"] == 1
    assert "CMP-2026-0100" in client.get("/api/reports/audit.csv").text


def test_explainable_candidates_require_explicit_link_confirmation(client, complaint_payload):
    first = client.post("/api/complaints", json=complaint_payload)
    second_payload = {
        **complaint_payload,
        "case_id": "CMP-2026-0101",
        "bureau_code": "approval",
        "title": "Faculty salary payments overdue at the institute",
    }
    second = client.post("/api/complaints", json=second_payload)
    assert first.status_code == second.status_code == 201
    assert client.get("/api/case-links").json() == []

    candidates = client.get("/api/case-links/suggestions").json()
    match = next(item for item in candidates if {item["caseA"]["id"], item["caseB"]["id"]} == {"CMP-2026-0100", "CMP-2026-0101"})
    assert match["state"] == "Pending Review"
    assert match["match_source"] == "rule_based"
    assert "Rule-based candidate" in match["aiExplanation"]
    assert match["matchedEntities"]

    confirmed = client.post("/api/case-links", json={
        "source_case_id": match["caseA"]["id"],
        "target_case_id": match["caseB"]["id"],
        "relationship_type": match["relationshipType"],
        "similarity_score": match["similarity"],
        "suggestion_id": match["id"],
        "state": "Confirmed Link",
        "note": match["aiExplanation"],
    })
    assert confirmed.status_code == 201
    assert client.get("/api/complaints/CMP-2026-0100").json()["linked_cases"] == ["CMP-2026-0101"]
    audit_actions = [row["action_type"] for row in client.get("/api/audit-events").json()]
    assert "RELATIONSHIP_LINKED" in audit_actions


def test_case_link_suggestions_and_confirmed_relationships_stay_distinct(client, complaint_payload):
    client.post("/api/complaints", json=complaint_payload)
    second_payload = {
        **complaint_payload,
        "case_id": "CMP-2026-0101",
        "bureau_code": "approval",
        "title": "Faculty salary arrears reported at the institution",
    }
    client.post("/api/complaints", json=second_payload)

    candidate = next(
        item for item in client.get("/api/case-links/suggestions").json()
        if {item["caseA"]["id"], item["caseB"]["id"]} == {"CMP-2026-0100", "CMP-2026-0101"}
    )
    assert candidate["state"] == "Pending Review"
    assert candidate["match_source"] == "rule_based"
    assert client.get("/api/complaints/CMP-2026-0100").json()["linked_cases"] == []

    created = client.post("/api/case-links", json={
        "source_case_id": "CMP-2026-0100",
        "target_case_id": "CMP-2026-0101",
        "relationship_type": candidate["relationshipType"],
        "similarity_score": candidate["similarity"],
        "suggestion_id": candidate["id"],
        "state": "Pending Review",
        "note": candidate["aiExplanation"],
    })
    assert created.status_code == 201
    assert client.get("/api/complaints/CMP-2026-0100").json()["linked_cases"] == []

    confirmed = client.patch(f"/api/case-links/{created.json()['id']}", json={"state": "Confirmed Link"})
    assert confirmed.status_code == 200
    assert client.get("/api/complaints/CMP-2026-0100").json()["linked_cases"] == ["CMP-2026-0101"]

    dismissed = client.patch(f"/api/case-links/{created.json()['id']}", json={"state": "Dismissed"})
    assert dismissed.status_code == 200
    assert client.get("/api/complaints/CMP-2026-0100").json()["linked_cases"] == []
    dismissed_candidate = next(
        item for item in client.get("/api/case-links/suggestions").json()
        if item["id"] == candidate["id"]
    )
    assert dismissed_candidate["state"] == "Dismissed"


def test_duplicate_detection_uses_persisted_title_and_category(client, complaint_payload):
    complaint_payload["category"] = "Faculty Salary Non-Payment"
    complaint_payload["title"] = "Faculty salary arrears remain unpaid for several months"
    client.post("/api/complaints", json=complaint_payload)
    second_payload = {
        **complaint_payload,
        "case_id": "CMP-2026-0101",
        "bureau_code": "approval",
        "title": "Faculty salary arrears remain unpaid for several months",
    }
    client.post("/api/complaints", json=second_payload)
    candidates = client.get("/api/case-links/suggestions").json()
    duplicate = next(
        item for item in candidates
        if {item["caseA"]["id"], item["caseB"]["id"]} == {"CMP-2026-0100", "CMP-2026-0101"}
    )
    assert duplicate["relationshipType"] == "Duplicate"
    assert duplicate["similarity"] >= 78
    assert duplicate["matchedEntities"]


def test_workflow_event_history_returns_persisted_transitions(client, complaint_payload):
    client.post("/api/complaints", json=complaint_payload)
    updated = client.patch("/api/complaints/CMP-2026-0100", json={
        "status": "In Progress",
        "assigned_officer": "Officer Test",
        "resolution_note": "Initial evidence review started.",
        "actor": "Officer Test",
    })
    assert updated.status_code == 200
    events = client.get("/api/complaints/CMP-2026-0100/workflow-events").json()
    assert len(events) == 2
    assert events[0]["event_type"] == "CASE_CREATED"
    assert events[-1]["to_status"] == "In Progress"
    assert events[-1]["note"] == "Initial evidence review started."


def test_database_error_returns_safe_service_unavailable_response(client):
    class BrokenSession:
        def execute(self, *_args, **_kwargs):
            raise OperationalError("select", {}, Exception("private connection details"))

    def broken_db():
        yield BrokenSession()

    app.dependency_overrides[get_db] = broken_db
    try:
        response = client.get("/api/health")
        assert response.status_code == 503
        assert "migrations" in response.json()["detail"]
        assert "private connection details" not in response.text
    finally:
        app.dependency_overrides.clear()

