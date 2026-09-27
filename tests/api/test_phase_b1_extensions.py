import pytest
from fastapi.testclient import TestClient
from src.api.main import app
from src.api.config import API_PREFIX
from src.api.data_loader import load_all_datasets, get_clean_df, get_cases
from src.verification.data_completeness import compute_data_completeness

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_api_data():
    success = load_all_datasets()
    assert success is True, "Failed to load pre-calculated datasets for API tests."
    from src.persistence.database import get_connection, init_db
    from src.auth.auth_service import provision_user
    from src.auth.session import create_session, COOKIE_NAME
    init_db()
    conn = get_connection()
    with conn:
        conn.execute("DELETE FROM sessions")
        conn.execute("DELETE FROM user_scopes")
        conn.execute("DELETE FROM users")
        conn.execute("DELETE FROM case_workflow")
        conn.execute("DELETE FROM case_reviews")
        conn.execute("DELETE FROM evidence_requests")
        conn.execute("DELETE FROM audit_events")
        conn.execute("INSERT INTO case_workflow (record_id, status, updated_at, created_at) VALUES (117, 'PRIORITIZED', '2026-09-01T00:00:00', '2026-09-01T00:00:00')")
        conn.execute("INSERT INTO case_workflow (record_id, status, updated_at, created_at) VALUES (120, 'PRIORITIZED', '2026-09-01T00:00:00', '2026-09-01T00:00:00')")
        conn.execute("INSERT INTO case_workflow (record_id, status, updated_at, created_at) VALUES (121, 'PRIORITIZED', '2026-09-01T00:00:00', '2026-09-01T00:00:00')")
        conn.execute("INSERT INTO case_workflow (record_id, status, updated_at, created_at) VALUES (122, 'PRIORITIZED', '2026-09-01T00:00:00', '2026-09-01T00:00:00')")
    conn.close()

    # Provision authenticated investigator session for workflow state transitions
    user = provision_user(
        email="investigator.patil@nirikshak.gov.in",
        password="TestPassword123!",
        full_name="Senior Investigator Patil",
        role="INVESTIGATOR",
        scope_type="NATIONAL",
        user_id="investigator_patil"
    )
    conn = get_connection()
    raw_token, session_data = create_session(conn, user["user_id"])
    conn.close()
    client.cookies.set(COOKIE_NAME, raw_token, domain="testserver")
    client.headers["Authorization"] = f"Bearer {raw_token}"

# 1. Project List
def test_project_list_returns_all_records():
    response = client.get(f"{API_PREFIX}/projects?page=1&page_size=20")
    assert response.status_code == 200
    res = response.json()
    assert "data" in res
    assert "pagination" in res
    assert res["pagination"]["total_records"] == 742
    assert len(res["data"]) == 20

def test_project_list_filters_and_search():
    response = client.get(f"{API_PREFIX}/projects?search=water")
    assert response.status_code == 200
    res = response.json()
    assert res["pagination"]["total_records"] > 0
    for item in res["data"]:
        text = f"{item['work']} {item['mp_name']} {item['constituency']} {item['state']}".lower()
        assert "water" in text

# 2. Project Overview with and without Investigation Case
def test_project_overview_with_investigation_case():
    cases = get_cases()
    assert len(cases) > 0
    first_case_id = cases[0]["record_id"]

    response = client.get(f"{API_PREFIX}/projects/{first_case_id}/overview")
    assert response.status_code == 200
    overview = response.json()

    # Check root structures
    assert overview["project"]["record_id"] == first_case_id
    assert overview["risk"]["triggered"] is True
    assert overview["risk"]["risk_score"] > 0
    assert overview["risk"]["review_priority"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert len(overview["evidence_summary"]) > 0
    assert overview["disclaimer"] == "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."

def test_project_overview_without_investigation_case():
    clean_df = get_clean_df()
    cases = get_cases()
    case_ids = {int(c["record_id"]) for c in cases}
    all_ids = set(clean_df["original_row_index"].tolist())
    unflagged_ids = list(all_ids - case_ids)

    assert len(unflagged_ids) > 0, "Expected some unflagged records"
    unflagged_id = unflagged_ids[0]

    response = client.get(f"{API_PREFIX}/projects/{unflagged_id}/overview")
    assert response.status_code == 200
    overview = response.json()

    assert overview["project"]["record_id"] == unflagged_id
    assert overview["risk"]["triggered"] is False
    assert overview["risk"]["risk_score"] == 0.0
    assert overview["risk"]["review_priority"] == "NONE"
    assert overview["risk"]["severity"] == "none"
    assert overview["risk"]["primary_detector"] == "none"
    assert len(overview["evidence_summary"]) == 0

def test_project_overview_404_for_invalid_id():
    response = client.get(f"{API_PREFIX}/projects/999999/overview")
    assert response.status_code == 404

# 3. Lifecycle-ready Unavailable Fields
def test_unavailable_lifecycle_fields_stay_unavailable():
    response = client.get(f"{API_PREFIX}/projects/1/overview")
    assert response.status_code == 200
    overview = response.json()

    lc = overview["lifecycle"]
    # Check unavailable fields
    assert lc["estimate"]["approved_estimate_amount"] is None
    assert lc["estimate"]["availability"] == "NOT_AVAILABLE_IN_CURRENT_DATASET"
    assert lc["expenditure"]["expenditure_amount"] is None
    assert lc["expenditure"]["availability"] == "NOT_AVAILABLE_IN_CURRENT_DATASET"
    assert lc["progress"]["physical_progress_percent"] is None
    assert lc["progress"]["availability"] == "NOT_AVAILABLE_IN_CURRENT_DATASET"
    assert lc["fund_release"]["funds_released_amount"] is None
    assert lc["fund_release"]["availability"] == "NOT_AVAILABLE_IN_CURRENT_DATASET"

    # Financial and progress sections
    assert overview["financial"]["sanctioned_amount"] is None
    assert overview["financial"]["expenditure_amount"] is None
    assert overview["progress"]["physical_progress_percent"] is None
    assert overview["progress"]["reality_gap_status"] == "not_available"

# 4. Data Completeness Module
def test_data_completeness_deterministic():
    sample_record = {
        "work": "Community hall construction",
        "work_type": "building",
        "mp_name": "Test MP",
        "house": "Lok Sabha",
        "category": "Normal",
        "recommended_date": "2024-01-15",
        "allocation_amount": 500000.0,
        "ida_approval": "Approved",
        "status": "Sanctioned",
        "state": "Karnataka",
        "constituency": "Bangalore"
    }
    comp = compute_data_completeness(sample_record)

    assert "dimensions" in comp
    assert "overall_completeness_percent" in comp
    assert "coverage_level" in comp
    assert comp["coverage_level"] in ["HIGH", "MODERATE", "LIMITED", "VERY_LIMITED"]

    dims = comp["dimensions"]
    assert "identity" in dims
    assert "financial" in dims
    assert "progress" in dims
    assert "location" in dims
    assert dims["identity"]["completeness_percent"] == 100.0
    assert dims["progress"]["completeness_percent"] == 0.0

# 5. Workflow State Transitions
def test_workflow_state_default_and_transition():
    rec_id = 117
    # Initial state default
    get_res = client.get(f"{API_PREFIX}/cases/{rec_id}/workflow")
    assert get_res.status_code == 200
    wf = get_res.json()
    assert wf["record_id"] == rec_id
    assert wf["status"] == "PRIORITIZED"
    assert "ASSIGNED" in wf["allowed_next_states"]

    # Transition PRIORITIZED -> ASSIGNED
    patch_res = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={
            "new_status": "ASSIGNED",
            "user_id": "lead_auditor",
            "role": "auditor",
            "assigned_to": "officer_sharma",
            "assigned_role": "investigator",
            "reason": "Assigning for preliminary review"
        }
    )
    assert patch_res.status_code == 200
    wf_updated = patch_res.json()
    assert wf_updated["status"] == "ASSIGNED"
    assert wf_updated["assigned_to"] == "officer_sharma"

    # Transition ASSIGNED -> UNDER_REVIEW
    patch_res2 = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={
            "new_status": "UNDER_REVIEW",
            "user_id": "officer_sharma",
            "role": "investigator",
            "reason": "Beginning evidence cross-referencing"
        }
    )
    assert patch_res2.status_code == 200
    assert patch_res2.json()["status"] == "UNDER_REVIEW"

def test_invalid_workflow_transition_rejected():
    rec_id = 118
    # Try invalid jump from PRIORITIZED to VERIFIED
    patch_res = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={
            "new_status": "VERIFIED",
            "user_id": "officer_sharma",
            "role": "investigator",
            "reason": "Invalid shortcut"
        }
    )
    assert patch_res.status_code == 400
    assert "Invalid workflow transition" in patch_res.json()["detail"]

# 6. Human Review Creation & Retrieval
def test_human_review_lifecycle():
    rec_id = 117
    review_payload = {
        "reviewer_id": "investigator_patil",
        "reviewer_role": "senior_auditor",
        "outcome": "CONFIRMED_DEVIATION",
        "note": "Field verification confirms allocation exceeds peer group median by 140%."
    }
    create_res = client.post(f"{API_PREFIX}/cases/{rec_id}/reviews", json=review_payload)
    assert create_res.status_code == 201
    created_review = create_res.json()
    assert created_review["outcome"] == "CONFIRMED_DEVIATION"
    assert created_review["record_id"] == rec_id

    # List reviews
    list_res = client.get(f"{API_PREFIX}/cases/{rec_id}/reviews")
    assert list_res.status_code == 200
    reviews = list_res.json()
    assert len(reviews) >= 1
    assert reviews[0]["reviewer_id"] == "investigator_patil"

def test_invalid_human_review_outcome_rejected():
    rec_id = 117
    bad_payload = {
        "reviewer_id": "investigator_patil",
        "reviewer_role": "auditor",
        "outcome": "NON_EXISTENT_OUTCOME",
        "note": "Bad review"
    }
    res = client.post(f"{API_PREFIX}/cases/{rec_id}/reviews", json=bad_payload)
    assert res.status_code == 400

# 7. Evidence Request Lifecycle
def test_evidence_request_lifecycle():
    rec_id = 117
    req_payload = {
        "evidence_type": "measurement_book",
        "description": "Certified Measurement Book extract signed by Executive Engineer",
        "requested_by": "officer_sharma",
        "notes": "Urgent request"
    }
    create_res = client.post(f"{API_PREFIX}/cases/{rec_id}/evidence-requests", json=req_payload)
    assert create_res.status_code == 201
    created_req = create_res.json()
    assert created_req["status"] == "REQUESTED"
    req_id = created_req["request_id"]

    # Update to RECEIVED
    patch_res = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/evidence-requests/{req_id}",
        json={"status": "RECEIVED", "notes": "Received scanned MB copy via email"}
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "RECEIVED"
    assert updated["received_at"] is not None

    # List requests
    list_res = client.get(f"{API_PREFIX}/cases/{rec_id}/evidence-requests")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

# 8. Audit Trail Logging
def test_audit_trail_populated():
    rec_id = 117
    audit_res = client.get(f"{API_PREFIX}/cases/{rec_id}/audit")
    assert audit_res.status_code == 200
    events = audit_res.json()
    assert len(events) >= 1
    actions = [e["action"] for e in events]
    assert "TRANSITION_STATUS" in actions or "RECORD_HUMAN_REVIEW" in actions

# 9. Trend Analytics
def test_trend_allocations():
    for interval in ["monthly", "quarterly", "yearly"]:
        res = client.get(f"{API_PREFIX}/analytics/trends/allocations?interval={interval}")
        assert res.status_code == 200
        data = res.json()
        assert data["interval"] == interval
        assert len(data["data"]) > 0
        first_item = data["data"][0]
        assert "period" in first_item
        assert "total_allocation_amount" in first_item
        assert "mean_allocation_amount" in first_item

def test_trend_recommendations():
    res = client.get(f"{API_PREFIX}/analytics/trends/recommendations?interval=monthly")
    assert res.status_code == 200
    data = res.json()
    assert len(data["data"]) > 0
    assert "recommendation_count" in data["data"][0]
    assert "unique_mps" in data["data"][0]

def test_trend_risk():
    res = client.get(f"{API_PREFIX}/analytics/trends/risk?interval=quarterly")
    assert res.status_code == 200
    data = res.json()
    assert len(data["data"]) > 0
    item = data["data"][0]
    assert "mean_priority_score" in item
    assert "priority_distribution" in item

def test_trend_anomalies():
    res = client.get(f"{API_PREFIX}/analytics/trends/anomalies?interval=monthly")
    assert res.status_code == 200
    data = res.json()
    assert len(data["data"]) > 0
    item = data["data"][0]
    assert "total_detector_triggers" in item
    assert "detector_counts" in item
    assert "cost" in item["detector_counts"]

def test_trend_invalid_interval():
    res = client.get(f"{API_PREFIX}/analytics/trends/allocations?interval=hourly")
    assert res.status_code == 400

# 10. Existing Endpoints Unbroken Compatibility Check
def test_existing_health_endpoint_unchanged():
    res = client.get(f"{API_PREFIX}/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["data_loaded"] is True
    assert body["service"] == "NIRIKSHAK AI API"

def test_existing_statistics_endpoint_unchanged():
    res = client.get(f"{API_PREFIX}/statistics")
    assert res.status_code == 200
    body = res.json()
    assert body["total_records"] == 742
    assert body["investigation_cases"] == 718
    assert "LOW" in body["priority_distribution"]
    assert "HIGH" in body["priority_distribution"]
    assert "cost" in body["detector_distribution"]
    assert "score" in body

def test_existing_cases_endpoint_unchanged():
    res = client.get(f"{API_PREFIX}/cases?page=1&page_size=10")
    assert res.status_code == 200
    body = res.json()
    assert "data" in body
    assert "pagination" in body
    assert "filters" in body
    assert body["pagination"]["total_records"] == 718
    assert len(body["data"]) == 10
    first_case = body["data"][0]
    assert "investigation_priority_score" in first_case
    assert "investigation_priority_level" in first_case
    assert "primary_detector" in first_case
    assert "case_status" in first_case
    assert first_case["primary_detector"] in ["cost", "exact_duplicate", "near_duplicate", "pattern"]

def test_existing_case_detail_endpoint_unchanged():
    cases = get_cases()
    rec_id = cases[0]["record_id"]
    res = client.get(f"{API_PREFIX}/cases/{rec_id}/detail")
    assert res.status_code == 200
    detail = res.json()
    assert "case" in detail
    assert "project" in detail
    assert "risk_summary" in detail
    assert "peer_benchmark" in detail
    assert "integrity_passport" in detail
    assert "payment_gate" in detail
    assert "related_records" in detail
    assert "disclaimer" in detail

# ==================================================
# 11. Phase B1 Corrective Pass Tests
# ==================================================

def test_safe_db_schema_migration(tmp_path):
    """
    Verifies that calling init_db on a legacy database safely performs lightweight
    ALTER TABLE migrations without losing existing data.
    """
    import sqlite3
    from src.persistence.database import init_db

    legacy_db_path = str(tmp_path / "legacy.db")
    conn = sqlite3.connect(legacy_db_path)
    conn.executescript("""
    CREATE TABLE case_workflow (
        record_id INTEGER PRIMARY KEY,
        status TEXT NOT NULL,
        assigned_to TEXT,
        assigned_role TEXT,
        updated_at TEXT NOT NULL
    );
    CREATE TABLE evidence_requests (
        request_id TEXT PRIMARY KEY,
        record_id INTEGER NOT NULL,
        evidence_type TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        requested_at TEXT NOT NULL,
        received_at TEXT,
        notes TEXT
    );
    """)
    conn.execute(
        "INSERT INTO case_workflow VALUES (?, ?, ?, ?, ?)",
        (999, "UNDER_REVIEW", "officer1", "auditor", "2026-09-01T10:00:00")
    )
    conn.execute(
        "INSERT INTO evidence_requests VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ("REQ-LEGACY", 999, "site_photos", "Test", "REQUESTED", "officer1", "2026-09-01T10:00:00", None, "Note")
    )
    conn.commit()
    conn.close()

    # Run safe lightweight migration
    init_db(legacy_db_path)

    # Verify migrated schema and preserved rows
    migrated_conn = sqlite3.connect(legacy_db_path)
    migrated_conn.row_factory = sqlite3.Row
    wf_row = migrated_conn.execute("SELECT * FROM case_workflow WHERE record_id = 999").fetchone()
    assert wf_row["record_id"] == 999
    assert wf_row["status"] == "UNDER_REVIEW"
    assert wf_row["created_at"] == "2026-09-01T10:00:00"  # Backfilled from updated_at
    assert wf_row["decision"] is None
    assert wf_row["decision_reason"] is None

    ev_row = migrated_conn.execute("SELECT * FROM evidence_requests WHERE request_id = 'REQ-LEGACY'").fetchone()
    assert ev_row["evidence_type"] == "site_photos"
    assert ev_row["verified_at"] is None
    assert ev_row["verified_by"] is None
    assert ev_row["verification_result"] is None
    assert ev_row["verification_note"] is None
    migrated_conn.close()

def test_created_at_persistence_and_immutability():
    rec_id = 120
    # First update: PRIORITIZED -> ASSIGNED
    res1 = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={
            "new_status": "ASSIGNED",
            "user_id": "auditor_1",
            "role": "auditor",
            "assigned_to": "investigator_x"
        }
    )
    assert res1.status_code == 200
    created_at_val = res1.json()["created_at"]
    assert created_at_val is not None

    # Second update: ASSIGNED -> UNDER_REVIEW
    res2 = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={
            "new_status": "UNDER_REVIEW",
            "user_id": "investigator_x",
            "role": "investigator"
        }
    )
    assert res2.status_code == 200
    assert res2.json()["created_at"] == created_at_val

    # Check GET endpoint
    get_res = client.get(f"{API_PREFIX}/cases/{rec_id}/workflow")
    assert get_res.status_code == 200
    assert get_res.json()["created_at"] == created_at_val

def test_decided_transition_accepts_decision_and_reason_storage():
    rec_id = 121
    # Move to ASSIGNED then UNDER_REVIEW then VERIFIED
    client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "ASSIGNED", "user_id": "u1", "role": "r1"}
    )
    client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "UNDER_REVIEW", "user_id": "u1", "role": "r1"}
    )
    client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "VERIFIED", "user_id": "u1", "role": "r1"}
    )

    # Transition VERIFIED -> DECIDED with decision metadata
    res = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={
            "new_status": "DECIDED",
            "user_id": "chief_investigator",
            "role": "lead_auditor",
            "decision": "CONFIRMED_ANOMALY",
            "decision_reason": "Cost deviation exceeded district threshold by 120%."
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "DECIDED"
    assert data["decision"] == "CONFIRMED_ANOMALY"
    assert data["decision_reason"] == "Cost deviation exceeded district threshold by 120%."

    # Verify retrieval
    wf = client.get(f"{API_PREFIX}/cases/{rec_id}/workflow").json()
    assert wf["status"] == "DECIDED"
    assert wf["decision"] == "CONFIRMED_ANOMALY"
    assert wf["decision_reason"] == "Cost deviation exceeded district threshold by 120%."

    # Verify audit event logged
    audit_events = client.get(f"{API_PREFIX}/cases/{rec_id}/audit").json()
    decided_events = [e for e in audit_events if e["new_state"] == "DECIDED"]
    assert len(decided_events) >= 1
    assert "CONFIRMED_ANOMALY" in (decided_events[0]["reason"] or "") or decided_events[0]["evidence_reference"] == "CONFIRMED_ANOMALY"

def test_decided_to_closed_succeeds():
    rec_id = 121
    # Record 121 is in DECIDED status; transition to CLOSED
    res = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={
            "new_status": "CLOSED",
            "user_id": "chief_investigator",
            "role": "lead_auditor",
            "reason": "Final audit report published and case closed."
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "CLOSED"
    assert data["decision"] == "CONFIRMED_ANOMALY"
    assert data["decision_reason"] == "Cost deviation exceeded district threshold by 120%."
    assert data["allowed_next_states"] == []

def test_removed_direct_closure_transitions_return_http_400():
    rec_id = 122
    # 1. From PRIORITIZED -> CLOSED: Rejected
    res_p = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "CLOSED", "user_id": "u", "role": "r"}
    )
    assert res_p.status_code == 400

    # Move to ASSIGNED
    client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "ASSIGNED", "user_id": "u", "role": "r"}
    )
    # 2. From ASSIGNED -> CLOSED: Rejected
    res_a = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "CLOSED", "user_id": "u", "role": "r"}
    )
    assert res_a.status_code == 400

    # Move to UNDER_REVIEW
    client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "UNDER_REVIEW", "user_id": "u", "role": "r"}
    )
    # 3. From UNDER_REVIEW -> CLOSED: Rejected
    res_ur = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "CLOSED", "user_id": "u", "role": "r"}
    )
    assert res_ur.status_code == 400

    # Move to EVIDENCE_REQUESTED
    client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "EVIDENCE_REQUESTED", "user_id": "u", "role": "r"}
    )
    # 4. From EVIDENCE_REQUESTED -> CLOSED: Rejected
    res_er = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "CLOSED", "user_id": "u", "role": "r"}
    )
    assert res_er.status_code == 400

    # Move to EVIDENCE_RECEIVED
    client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "EVIDENCE_RECEIVED", "user_id": "u", "role": "r"}
    )
    # 5. From EVIDENCE_RECEIVED -> CLOSED: Rejected
    res_rc = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "CLOSED", "user_id": "u", "role": "r"}
    )
    assert res_rc.status_code == 400

    # Move to VERIFIED
    client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "VERIFIED", "user_id": "u", "role": "r"}
    )
    # 6. From VERIFIED -> CLOSED: Rejected
    res_v = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "CLOSED", "user_id": "u", "role": "r"}
    )
    assert res_v.status_code == 400

def test_evidence_verification_metadata():
    rec_id = 123
    create_res = client.post(
        f"{API_PREFIX}/cases/{rec_id}/evidence-requests",
        json={
            "evidence_type": "measurement_book",
            "description": "Certified copy of MB",
            "requested_by": "auditor_smith"
        }
    )
    assert create_res.status_code == 201
    req_id = create_res.json()["request_id"]
    assert create_res.json()["verified_at"] is None
    assert create_res.json()["verified_by"] is None

    # Transition: REQUESTED -> RECEIVED -> UNDER_VERIFICATION -> VERIFIED
    recv_res = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/evidence-requests/{req_id}",
        json={"status": "RECEIVED"}
    )
    assert recv_res.status_code == 200

    uv_res = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/evidence-requests/{req_id}",
        json={"status": "UNDER_VERIFICATION"}
    )
    assert uv_res.status_code == 200

    # Transition to VERIFIED with verification metadata
    patch_res = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/evidence-requests/{req_id}",
        json={
            "status": "VERIFIED",
            "user_id": "chief_inspector",
            "role": "inspector",
            "verified_by": "Eng. Raman",
            "verification_result": "MB_VERIFIED_CORRECT",
            "verification_note": "Signed by Executive Engineer on site.",
            "notes": "Verified at district office"
        }
    )
    assert patch_res.status_code == 200
    verified_data = patch_res.json()
    assert verified_data["status"] == "VERIFIED"
    assert verified_data["verified_at"] is not None
    assert verified_data["verified_by"] == "Eng. Raman"
    assert verified_data["verification_result"] == "MB_VERIFIED_CORRECT"
    assert verified_data["verification_note"] == "Signed by Executive Engineer on site."

    # Check GET endpoint retrieves metadata
    list_res = client.get(f"{API_PREFIX}/cases/{rec_id}/evidence-requests")
    assert list_res.status_code == 200
    item = next(x for x in list_res.json() if x["request_id"] == req_id)
    assert item["verified_at"] is not None
    assert item["verified_by"] == "Eng. Raman"
    assert item["verification_result"] == "MB_VERIFIED_CORRECT"
    assert item["verification_note"] == "Signed by Executive Engineer on site."

    # Preserves audit history on status changes
    audit_res = client.get(f"{API_PREFIX}/cases/{rec_id}/audit")
    assert audit_res.status_code == 200
    ev_events = [e for e in audit_res.json() if e["evidence_reference"] == req_id]
    assert len(ev_events) >= 2  # CREATE + UPDATE

def test_data_completeness_distinguishes_source_unavailable_vs_record_missing():
    sample_record = {
        "work": "Road construction",
        "work_type": "road",
        "mp_name": "Test MP",
        "house": "Lok Sabha",
        "category": "Normal",
        "recommended_date": "2024-01-01",
        "allocation_amount": 1000000.0,
        "ida_approval": "Approved",
        "status": "Completed",
        "state": "Maharashtra",
        "constituency": "Pune"
        # block, village, city, ward are missing for this specific record
    }
    comp = compute_data_completeness(sample_record)

    # In location dimension, block/village/city/ward are record-level missing
    loc_dim = comp["dimensions"]["location"]
    for f in ["block", "village", "city", "ward"]:
        assert f in loc_dim["missing_fields"]
    assert loc_dim["not_available_in_source_dataset"] == []

    # In financial dimension, sanctioned_amount etc are source-wide unavailable
    fin_dim = comp["dimensions"]["financial"]
    assert "allocation_amount" in fin_dim["available_fields"]
    for f in ["sanctioned_amount", "expenditure_amount", "funds_released", "payment_records"]:
        assert f in fin_dim["not_available_in_source_dataset"]
    assert fin_dim["missing_fields"] == []

    # In progress dimension, all fields are source-wide unavailable
    prog_dim = comp["dimensions"]["progress"]
    for f in ["physical_progress_percent", "milestones", "expected_completion_date", "actual_completion_date", "delay_days"]:
        assert f in prog_dim["not_available_in_source_dataset"]
    assert prog_dim["missing_fields"] == []

    # Top-level lists populated
    assert "sanctioned_amount" in comp["not_available_in_source_dataset"]
    assert "physical_progress_percent" in comp["not_available_in_source_dataset"]
    assert "block" in comp["missing_fields"]

    # Verify project overview API propagates the distinction
    res = client.get(f"{API_PREFIX}/projects/1/overview")
    assert res.status_code == 200
    overview = res.json()
    ov_comp = overview["data_completeness"]
    assert len(ov_comp["not_available_in_source_dataset"]) > 0
    assert "sanctioned_amount" in ov_comp["dimensions"]["financial"]["not_available_in_source_dataset"]

