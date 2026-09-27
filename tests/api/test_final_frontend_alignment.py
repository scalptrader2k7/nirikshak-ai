import pytest
from fastapi.testclient import TestClient
from src.api.main import app
from src.api.config import API_PREFIX
from src.api.data_loader import load_all_datasets
from src.persistence.database import get_connection, init_db
from src.auth.auth_service import provision_user
from src.auth.session import create_session, COOKIE_NAME
from src.auth.roles import get_official_roles
from src.enrichment.demo_service import get_demo_lifecycle_payload
from src.enrichment.demo_loader import get_demo_record_ids
from src.scoping.district_scope import count_trusted_district_mappings

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_alignment_env():
    success = load_all_datasets()
    assert success is True, "Failed to load pre-calculated datasets."
    init_db()

@pytest.fixture
def clean_db():
    conn = get_connection()
    with conn:
        conn.execute("DELETE FROM sessions")
        conn.execute("DELETE FROM auth_events")
        conn.execute("DELETE FROM user_scopes")
        conn.execute("DELETE FROM users")
        conn.execute("DELETE FROM case_workflow")
        conn.execute("DELETE FROM case_reviews")
        conn.execute("DELETE FROM evidence_requests")
        conn.execute("DELETE FROM audit_events")
    conn.close()

def _create_authenticated_client(user: dict) -> TestClient:
    conn = get_connection()
    raw_token, _ = create_session(conn, user["user_id"])
    conn.close()
    auth_client = TestClient(app)
    auth_client.cookies.set(COOKIE_NAME, raw_token, domain="testserver")
    auth_client.headers["Authorization"] = f"Bearer {raw_token}"
    return auth_client

# ==================================================
# 1. RBAC BOUNDARIES: DENIED MUTATIONS
# ==================================================

def test_mp_operational_mutations_blocked(clean_db):
    """
    MP is MONITOR only (constituency read).
    All operational investigation mutations MUST return 403 Forbidden.
    """
    mp_user = provision_user(
        email="mp.varanasi@sansad.nic.in",
        password="Password123!",
        full_name="Honorable MP Varanasi",
        role="MP",
        scope_type="CONSTITUENCY",
        constituency="Varanasi"
    )
    mp_client = _create_authenticated_client(mp_user)
    rec_id = 117

    # 1. PATCH workflow status -> 403
    r1 = mp_client.patch(f"{API_PREFIX}/cases/{rec_id}/workflow/status", json={"new_status": "PRIORITIZED"})
    assert r1.status_code == 403
    assert "not authorized to mutate" in r1.json()["detail"]

    # 2. POST review -> 403
    r2 = mp_client.post(f"{API_PREFIX}/cases/{rec_id}/reviews", json={"outcome": "VALID_RISK_SIGNAL", "note": "MP test"})
    assert r2.status_code == 403
    assert "not authorized to mutate" in r2.json()["detail"]

    # 3. POST evidence request -> 403
    r3 = mp_client.post(f"{API_PREFIX}/cases/{rec_id}/evidence-requests", json={"evidence_type": "site_photo", "description": "MP test"})
    assert r3.status_code == 403
    assert "not authorized to mutate" in r3.json()["detail"]

    # 4. PATCH evidence request -> 403
    r4 = mp_client.patch(f"{API_PREFIX}/cases/{rec_id}/evidence-requests/REQ-DUMMY", json={"status": "RECEIVED"})
    assert r4.status_code == 403
    assert "not authorized to mutate" in r4.json()["detail"]

def test_state_nodal_operational_mutations_blocked(clean_db):
    """
    STATE_NODAL_AUTHORITY is COORDINATE / MONITOR only (state read).
    State attempts to transition workflow, request/verify evidence, or submit decisions MUST return 403 Forbidden.
    """
    state_user = provision_user(
        email="sno.up@gov.in",
        password="Password123!",
        full_name="State Nodal Officer UP",
        role="STATE_NODAL_AUTHORITY",
        scope_type="STATE",
        state="Uttar Pradesh"
    )
    state_client = _create_authenticated_client(state_user)
    rec_id = 117

    # 1. PATCH workflow status -> 403
    r1 = state_client.patch(f"{API_PREFIX}/cases/{rec_id}/workflow/status", json={"new_status": "PRIORITIZED"})
    assert r1.status_code == 403
    assert "not authorized to mutate" in r1.json()["detail"]

    # 2. POST review -> 403
    r2 = state_client.post(f"{API_PREFIX}/cases/{rec_id}/reviews", json={"outcome": "VALID_RISK_SIGNAL", "note": "State attempt"})
    assert r2.status_code == 403
    assert "not authorized to mutate" in r2.json()["detail"]

    # 3. POST evidence request -> 403
    r3 = state_client.post(f"{API_PREFIX}/cases/{rec_id}/evidence-requests", json={"evidence_type": "inspection_report", "description": "State request"})
    assert r3.status_code == 403
    assert "not authorized to mutate" in r3.json()["detail"]

    # 4. PATCH evidence request -> 403
    r4 = state_client.patch(f"{API_PREFIX}/cases/{rec_id}/evidence-requests/REQ-DUMMY", json={"status": "RECEIVED"})
    assert r4.status_code == 403
    assert "not authorized to mutate" in r4.json()["detail"]

def test_mospi_operational_mutations_blocked(clean_db):
    """
    MOSPI is OVERSEE / ANALYZE only (national read & governance).
    MoSPI attempts to transition district workflow, request/verify evidence, or decide cases MUST return 403 Forbidden.
    """
    mospi_user = provision_user(
        email="officer.mospi@nic.in",
        password="Password123!",
        full_name="Director General MoSPI",
        role="MOSPI",
        scope_type="NATIONAL"
    )
    mospi_client = _create_authenticated_client(mospi_user)
    rec_id = 117

    # 1. PATCH workflow status -> 403
    r1 = mospi_client.patch(f"{API_PREFIX}/cases/{rec_id}/workflow/status", json={"new_status": "PRIORITIZED"})
    assert r1.status_code == 403
    assert "not authorized to mutate" in r1.json()["detail"]

    # 2. POST review -> 403
    r2 = mospi_client.post(f"{API_PREFIX}/cases/{rec_id}/reviews", json={"outcome": "VALID_RISK_SIGNAL", "note": "MoSPI attempt"})
    assert r2.status_code == 403
    assert "not authorized to mutate" in r2.json()["detail"]

    # 3. POST evidence request -> 403
    r3 = mospi_client.post(f"{API_PREFIX}/cases/{rec_id}/evidence-requests", json={"evidence_type": "audit_memo", "description": "MoSPI request"})
    assert r3.status_code == 403
    assert "not authorized to mutate" in r3.json()["detail"]

    # 4. PATCH evidence request -> 403
    r4 = mospi_client.patch(f"{API_PREFIX}/cases/{rec_id}/evidence-requests/REQ-DUMMY", json={"status": "RECEIVED"})
    assert r4.status_code == 403
    assert "not authorized to mutate" in r4.json()["detail"]

def test_district_authority_mutation_allowed_in_scope_and_blocked_out_of_scope(clean_db, monkeypatch):
    """
    DISTRICT_AUTHORITY is ACT / OPERATE:
    - Allowed to perform operational mutations for in-scope projects via trusted mapping
    - Blocked with 403 for out-of-scope or unmapped records
    """
    # Record 26 mapped to Dholpur, Rajasthan
    test_mappings = {
        26: {
            "record_id": 26,
            "canonical_district": "Dholpur",
            "state": "Rajasthan",
            "mapping_source": "TEST_MOCK",
            "mapping_reference": "REF_26",
            "mapping_method": "TEST_MOCK",
            "mapping_confidence": "HIGH",
            "is_trusted": True
        }
    }
    monkeypatch.setattr("src.scoping.district_scope._TRUSTED_DISTRICT_CACHE", test_mappings)

    da_dholpur = provision_user(
        email="dm.dholpur@rajasthan.gov.in",
        password="Password123!",
        full_name="Collector Dholpur",
        role="DISTRICT_AUTHORITY",
        scope_type="DISTRICT",
        district="Dholpur",
        state="Rajasthan"
    )
    da_client = _create_authenticated_client(da_dholpur)

    # In-scope mutation on record 26: SUCCESS (200 / 201)
    wf_res = da_client.patch(f"{API_PREFIX}/cases/26/workflow/status", json={"new_status": "PRIORITIZED"})
    assert wf_res.status_code == 200
    assert wf_res.json()["status"] == "PRIORITIZED"

    ev_res = da_client.post(
        f"{API_PREFIX}/cases/26/evidence-requests",
        json={"evidence_type": "site_measurement", "description": "Measurement book verification"}
    )
    assert ev_res.status_code == 201
    assert ev_res.json()["status"] == "REQUESTED"
    req_id = ev_res.json()["evidence_request_id"]

    # Out-of-scope mutation on unmapped record 117: BLOCKED (403)
    unmapped_res = da_client.patch(f"{API_PREFIX}/cases/117/workflow/status", json={"new_status": "PRIORITIZED"})
    assert unmapped_res.status_code == 403
    assert "outside assigned administrative scope or lacks a trusted district mapping" in unmapped_res.json()["detail"] or "not authorized" in unmapped_res.json()["detail"]

# ==================================================
# 2. SEPARATE EVIDENCE WORKFLOW STATE MACHINE
# ==================================================

def test_evidence_lifecycle_state_machine_valid_transitions(clean_db, monkeypatch):
    """
    Separate evidence-item status lifecycle:
    REQUESTED -> RECEIVED -> UNDER_VERIFICATION -> {VERIFIED, REJECTED}
    """
    test_mappings = {
        26: {
            "record_id": 26,
            "canonical_district": "Dholpur",
            "state": "Rajasthan",
            "mapping_source": "TEST_MOCK",
            "is_trusted": True
        }
    }
    monkeypatch.setattr("src.scoping.district_scope._TRUSTED_DISTRICT_CACHE", test_mappings)

    da_user = provision_user(
        email="dm.dholpur2@rajasthan.gov.in",
        password="Password123!",
        full_name="Collector Dholpur",
        role="DISTRICT_AUTHORITY",
        scope_type="DISTRICT",
        district="Dholpur",
        state="Rajasthan"
    )
    client_da = _create_authenticated_client(da_user)

    # 1. Create: status = REQUESTED
    c_res = client_da.post(
        f"{API_PREFIX}/cases/26/evidence-requests",
        json={
            "evidence_type": "physical_inspection",
            "description": "Culvert construction inspection",
            "evidence_reference": "REF-CULVERT-001",
            "metadata": {"gps_lat": 26.7, "gps_lon": 77.9}
        }
    )
    assert c_res.status_code == 201
    data = c_res.json()
    assert data["status"] == "REQUESTED"
    req_id = data["evidence_request_id"]
    assert data["evidence_reference"] == "REF-CULVERT-001"
    assert data["metadata"]["gps_lat"] == 26.7

    # 2. REQUESTED -> RECEIVED
    r_res = client_da.patch(
        f"{API_PREFIX}/cases/26/evidence-requests/{req_id}",
        json={"status": "RECEIVED", "notes": "Photographs received from junior engineer"}
    )
    assert r_res.status_code == 200
    assert r_res.json()["status"] == "RECEIVED"
    assert r_res.json()["received_at"] is not None

    # 3. RECEIVED -> UNDER_VERIFICATION
    uv_res = client_da.patch(
        f"{API_PREFIX}/cases/26/evidence-requests/{req_id}",
        json={"status": "UNDER_VERIFICATION", "notes": "District technical team reviewing"}
    )
    assert uv_res.status_code == 200
    assert uv_res.json()["status"] == "UNDER_VERIFICATION"
    assert uv_res.json()["verification_started_at"] is not None

    # 4. UNDER_VERIFICATION -> VERIFIED
    v_res = client_da.patch(
        f"{API_PREFIX}/cases/26/evidence-requests/{req_id}",
        json={
            "status": "VERIFIED",
            "verification_note": "Culvert dimensions match sanctioned estimate.",
            "verification_result": "CONSTRUCTION_CONFIRMED"
        }
    )
    assert v_res.status_code == 200
    v_data = v_res.json()
    assert v_data["status"] == "VERIFIED"
    assert v_data["verified_at"] is not None
    assert v_data["reviewer_user_id"] == da_user["user_id"]
    assert v_data["reviewer_role"] == "DISTRICT_AUTHORITY"
    assert v_data["verification_note"] == "Culvert dimensions match sanctioned estimate."

def test_evidence_lifecycle_rejection_transition(clean_db, monkeypatch):
    """
    Evidence item can transition UNDER_VERIFICATION -> REJECTED.
    REJECTED represents rejection of the evidence item, not the case.
    """
    test_mappings = {
        26: {
            "record_id": 26,
            "canonical_district": "Dholpur",
            "state": "Rajasthan",
            "mapping_source": "TEST_MOCK",
            "is_trusted": True
        }
    }
    monkeypatch.setattr("src.scoping.district_scope._TRUSTED_DISTRICT_CACHE", test_mappings)

    da_user = provision_user(
        email="dm.dholpur3@rajasthan.gov.in",
        password="Password123!",
        full_name="Collector Dholpur",
        role="DISTRICT_AUTHORITY",
        scope_type="DISTRICT",
        district="Dholpur",
        state="Rajasthan"
    )
    client_da = _create_authenticated_client(da_user)

    # Create -> REQUESTED
    c_res = client_da.post(
        f"{API_PREFIX}/cases/26/evidence-requests",
        json={"evidence_type": "vendor_invoice", "description": "Material supply invoice"}
    )
    req_id = c_res.json()["evidence_request_id"]

    # Step: REQUESTED -> RECEIVED -> UNDER_VERIFICATION -> REJECTED
    client_da.patch(f"{API_PREFIX}/cases/26/evidence-requests/{req_id}", json={"status": "RECEIVED"})
    client_da.patch(f"{API_PREFIX}/cases/26/evidence-requests/{req_id}", json={"status": "UNDER_VERIFICATION"})

    rej_res = client_da.patch(
        f"{API_PREFIX}/cases/26/evidence-requests/{req_id}",
        json={
            "status": "REJECTED",
            "rejection_reason": "Invoice signature does not match authorized signatory.",
            "verification_note": "Document failed authentication audit."
        }
    )
    assert rej_res.status_code == 200
    rej_data = rej_res.json()
    assert rej_data["status"] == "REJECTED"
    assert rej_data["rejected_at"] is not None
    assert rej_data["rejection_reason"] == "Invoice signature does not match authorized signatory."
    assert rej_data["reviewer_user_id"] == da_user["user_id"]

def test_evidence_lifecycle_skipping_under_verification_rejected(clean_db, monkeypatch):
    """
    Evidence statuses must NOT jump directly:
    REQUESTED -> VERIFIED (rejected with 400)
    REQUESTED -> REJECTED (rejected with 400)
    RECEIVED -> VERIFIED (rejected with 400)
    RECEIVED -> REJECTED (rejected with 400)
    Must be routed through UNDER_VERIFICATION.
    """
    test_mappings = {
        26: {
            "record_id": 26,
            "canonical_district": "Dholpur",
            "state": "Rajasthan",
            "mapping_source": "TEST_MOCK",
            "is_trusted": True
        }
    }
    monkeypatch.setattr("src.scoping.district_scope._TRUSTED_DISTRICT_CACHE", test_mappings)

    da_user = provision_user(
        email="dm.dholpur4@rajasthan.gov.in",
        password="Password123!",
        full_name="Collector Dholpur",
        role="DISTRICT_AUTHORITY",
        scope_type="DISTRICT",
        district="Dholpur",
        state="Rajasthan"
    )
    client_da = _create_authenticated_client(da_user)

    # Jump 1: REQUESTED -> VERIFIED
    c1 = client_da.post(f"{API_PREFIX}/cases/26/evidence-requests", json={"evidence_type": "site_photo"})
    id1 = c1.json()["evidence_request_id"]
    j1 = client_da.patch(f"{API_PREFIX}/cases/26/evidence-requests/{id1}", json={"status": "VERIFIED"})
    assert j1.status_code == 400
    assert "Invalid evidence status transition" in j1.json()["detail"]

    # Jump 2: REQUESTED -> REJECTED
    c2 = client_da.post(f"{API_PREFIX}/cases/26/evidence-requests", json={"evidence_type": "site_photo"})
    id2 = c2.json()["evidence_request_id"]
    j2 = client_da.patch(f"{API_PREFIX}/cases/26/evidence-requests/{id2}", json={"status": "REJECTED"})
    assert j2.status_code == 400
    assert "Invalid evidence status transition" in j2.json()["detail"]

    # Jump 3: RECEIVED -> VERIFIED
    client_da.patch(f"{API_PREFIX}/cases/26/evidence-requests/{id1}", json={"status": "RECEIVED"})
    j3 = client_da.patch(f"{API_PREFIX}/cases/26/evidence-requests/{id1}", json={"status": "VERIFIED"})
    assert j3.status_code == 400
    assert "Invalid evidence status transition" in j3.json()["detail"]

    # Jump 4: RECEIVED -> REJECTED
    client_da.patch(f"{API_PREFIX}/cases/26/evidence-requests/{id2}", json={"status": "RECEIVED"})
    j4 = client_da.patch(f"{API_PREFIX}/cases/26/evidence-requests/{id2}", json={"status": "REJECTED"})
    assert j4.status_code == 400
    assert "Invalid evidence status transition" in j4.json()["detail"]

def test_evidence_terminal_state_immutability(clean_db, monkeypatch):
    """
    VERIFIED and REJECTED evidence items are terminal states.
    Transitions from terminal states MUST return 400 Bad Request.
    """
    test_mappings = {
        26: {
            "record_id": 26,
            "canonical_district": "Dholpur",
            "state": "Rajasthan",
            "mapping_source": "TEST_MOCK",
            "is_trusted": True
        }
    }
    monkeypatch.setattr("src.scoping.district_scope._TRUSTED_DISTRICT_CACHE", test_mappings)

    da_user = provision_user(
        email="dm.dholpur5@rajasthan.gov.in",
        password="Password123!",
        full_name="Collector Dholpur",
        role="DISTRICT_AUTHORITY",
        scope_type="DISTRICT",
        district="Dholpur",
        state="Rajasthan"
    )
    client_da = _create_authenticated_client(da_user)

    # Create and advance to VERIFIED
    c = client_da.post(f"{API_PREFIX}/cases/26/evidence-requests", json={"evidence_type": "site_photo"})
    req_id = c.json()["evidence_request_id"]
    client_da.patch(f"{API_PREFIX}/cases/26/evidence-requests/{req_id}", json={"status": "RECEIVED"})
    client_da.patch(f"{API_PREFIX}/cases/26/evidence-requests/{req_id}", json={"status": "UNDER_VERIFICATION"})
    client_da.patch(f"{API_PREFIX}/cases/26/evidence-requests/{req_id}", json={"status": "VERIFIED"})

    # Attempt to reopen/transition from VERIFIED
    t1 = client_da.patch(f"{API_PREFIX}/cases/26/evidence-requests/{req_id}", json={"status": "UNDER_VERIFICATION"})
    assert t1.status_code == 400
    assert "Terminal state" in t1.json()["detail"]

# ==================================================
# 3. EVIDENCE DATA MODEL & SCHEMA COMPLIANCE
# ==================================================

def test_evidence_data_model_exposes_all_fields(clean_db, monkeypatch):
    """
    Validates complete evidence schema exposing:
    evidence_request_id, case_id, record_id, evidence_type, status,
    requested_at, received_at, verification_started_at, verified_at,
    rejected_at, reviewer_user_id, reviewer_role, verification_note,
    rejection_reason, evidence_reference, metadata.
    """
    test_mappings = {
        26: {
            "record_id": 26,
            "canonical_district": "Dholpur",
            "state": "Rajasthan",
            "mapping_source": "TEST_MOCK",
            "is_trusted": True
        }
    }
    monkeypatch.setattr("src.scoping.district_scope._TRUSTED_DISTRICT_CACHE", test_mappings)

    da_user = provision_user(
        email="dm.dholpur6@rajasthan.gov.in",
        password="Password123!",
        full_name="Collector Dholpur",
        role="DISTRICT_AUTHORITY",
        scope_type="DISTRICT",
        district="Dholpur",
        state="Rajasthan"
    )
    client_da = _create_authenticated_client(da_user)

    c_res = client_da.post(
        f"{API_PREFIX}/cases/26/evidence-requests",
        json={
            "evidence_type": "lab_quality_test",
            "description": "Concrete compressive strength test report",
            "evidence_reference": "DOC-REF-LAB-992",
            "metadata": {"batch": "B12", "strength_psi": 4200}
        }
    )
    assert c_res.status_code == 201
    item = c_res.json()

    expected_keys = [
        "evidence_request_id",
        "case_id",
        "record_id",
        "evidence_type",
        "status",
        "requested_at",
        "received_at",
        "verification_started_at",
        "verified_at",
        "rejected_at",
        "reviewer_user_id",
        "reviewer_role",
        "verification_note",
        "rejection_reason",
        "evidence_reference",
        "metadata"
    ]
    for key in expected_keys:
        assert key in item, f"Missing key '{key}' in evidence response"

    # Also verify GET /cases/{record_id}/evidence-requests returns all fields
    list_res = client_da.get(f"{API_PREFIX}/cases/26/evidence-requests")
    assert list_res.status_code == 200
    listed_item = list_res.json()[0]
    for key in expected_keys:
        assert key in listed_item, f"Missing key '{key}' in listed evidence item"

# ==================================================
# 4. DATA SEPARATION & DEFERRED FEATURES
# ==================================================

def test_demo_cohort_synthetic_provenance_isolated():
    """
    Validates all 12 demo lifecycle records carry strict synthetic flags.
    """
    demo_ids = get_demo_record_ids()
    assert len(demo_ids) == 12
    for rec_id in demo_ids:
        demo_rec = get_demo_lifecycle_payload(rec_id)
        assert demo_rec is not None
        assert demo_rec["data_source"] == "DEMONSTRATION_LIFECYCLE_DATA"
        assert demo_rec["is_demo_enrichment"] is True
        assert demo_rec["source_classification"] == "SYNTHETIC_DEMONSTRATION"
        assert "disclaimer" in demo_rec

def test_official_project_does_not_expose_demo_values(clean_db):
    """
    Official project overview for a non-demo record does NOT absorb synthetic values.
    """
    demo_ids = get_demo_record_ids()
    non_demo_id = 1  # Record 1 is not in demo cohort
    assert non_demo_id not in demo_ids

    mospi_user = provision_user(
        email="mospi.viewer@gov.in",
        password="Password123!",
        full_name="MoSPI Viewer",
        role="MOSPI",
        scope_type="NATIONAL"
    )
    mospi_client = _create_authenticated_client(mospi_user)

    res = mospi_client.get(f"{API_PREFIX}/projects/{non_demo_id}/overview")
    assert res.status_code == 200
    overview = res.json()
    assert overview["demo_enrichment"] is None
    assert overview["lifecycle"]["estimate"]["availability"] == "NOT_AVAILABLE_IN_CURRENT_DATASET"

def test_production_trusted_districts_zero():
    """
    Confirms production trusted district mappings count = 0 (no fuzzy inferences).
    """
    assert count_trusted_district_mappings() == 0

def test_deferred_capabilities_routes_not_accidentally_introduced():
    """
    Confirms deferred routes (citizen observations, report generation, real GIS) do not exist.
    """
    paths = app.openapi()["paths"]
    deferred_endpoints = [
        f"{API_PREFIX}/citizen-observations",
        f"{API_PREFIX}/reports/export",
        f"{API_PREFIX}/reports/generate",
        f"{API_PREFIX}/evidence/upload",
        f"{API_PREFIX}/gis/official-shapefiles"
    ]
    for ep in deferred_endpoints:
        assert ep not in paths, f"Deferred endpoint '{ep}' found in registered OpenAPI paths!"
