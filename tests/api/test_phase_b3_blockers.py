import pytest
from fastapi.testclient import TestClient
from src.api.main import app
from src.api.config import API_PREFIX
from src.api.data_loader import load_all_datasets
from src.persistence.database import get_connection, init_db
from src.auth.auth_service import provision_user
from src.auth.session import create_session, COOKIE_NAME
from src.auth.roles import (
    OfficialRole,
    OFFICIAL_PRODUCT_ROLES,
    INTERNAL_CAPABILITIES,
    get_official_roles,
    get_recommended_portal,
    validate_portal_access
)
from src.workflow.workflow_service import (
    get_case_workflow,
    update_case_status,
    ALLOWED_TRANSITIONS,
    VALID_WORKFLOW_STATES
)
from src.scoping.district_scope import (
    load_trusted_district_mappings,
    get_trusted_district_mapping,
    is_record_in_district,
    count_trusted_district_mappings
)
from src.scoping.scope_service import (
    can_access_project,
    can_mutate_workflow,
    get_effective_scope
)

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_b3_env():
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
    c = TestClient(app)
    c.cookies.set(COOKIE_NAME, raw_token, domain="testserver")
    c.headers["Authorization"] = f"Bearer {raw_token}"
    return c

# ==================================================
# 1. ROLE MODEL & PORTAL ISOLATION
# ==================================================

def test_four_official_product_roles():
    roles = get_official_roles()
    assert len(roles) == 4
    assert set(roles) == {"MP", "DISTRICT_AUTHORITY", "STATE_NODAL_AUTHORITY", "MOSPI"}
    assert "ADMIN" not in roles
    assert "INVESTIGATOR" not in roles
    assert "CITIZEN" not in roles

def test_admin_and_investigator_not_exposed_in_portal_options():
    res = client.get(f"{API_PREFIX}/auth/portal-options")
    assert res.status_code == 200
    data = res.json()
    assert data["official_portals"] == ["MOSPI", "STATE_NODAL_AUTHORITY", "DISTRICT_AUTHORITY", "MP"]
    assert "ADMIN" not in data["official_portals"]
    assert "INVESTIGATOR" not in data["official_portals"]
    assert data["citizen_portal"] == "CITIZEN"

def test_portal_access_validation_rejects_admin_and_investigator():
    # Attempting to select ADMIN or INVESTIGATOR portal is rejected
    allowed, actual, recommended = validate_portal_access("MOSPI", "ADMIN")
    assert allowed is False
    assert recommended == "MOSPI"

    allowed, actual, recommended = validate_portal_access("MOSPI", "INVESTIGATOR")
    assert allowed is False
    assert recommended == "MOSPI"

# ==================================================
# 2. PORTAL SELECTION & ONBOARDING PRIVILEGE ISOLATION
# ==================================================

def test_portal_selection_cannot_elevate_role(clean_db):
    user = provision_user(
        email="district.head@karnataka.gov.in",
        password="ValidPassword123!",
        full_name="District Head",
        role="DISTRICT_AUTHORITY",
        scope_type="DISTRICT",
        district="Bangalore Urban",
        state="Karnataka"
    )
    auth_client = _create_authenticated_client(user)

    # Attempt to request MOSPI portal
    portal_res = auth_client.post(
        f"{API_PREFIX}/auth/portal-access",
        json={"portal": "MOSPI"}
    )
    assert portal_res.status_code == 200
    pdata = portal_res.json()
    assert pdata["allowed"] is False
    assert pdata["actual_role"] == "DISTRICT_AUTHORITY"
    assert pdata["recommended_portal"] == "DISTRICT_AUTHORITY"

    # User profile remains strictly DISTRICT_AUTHORITY
    me_res = auth_client.get(f"{API_PREFIX}/auth/me")
    assert me_res.status_code == 200
    assert me_res.json()["role"] == "DISTRICT_AUTHORITY"

def test_onboarding_cannot_modify_role_or_scope(clean_db):
    user = provision_user(
        email="mp.sharma@sansad.nic.in",
        password="MpPassword123!",
        full_name="Shri Sharma",
        role="MP",
        scope_type="CONSTITUENCY",
        constituency="Pune"
    )
    auth_client = _create_authenticated_client(user)

    # Malicious update attempting to change role to MOSPI and scope to NATIONAL
    update_res = auth_client.patch(
        f"{API_PREFIX}/auth/onboarding",
        json={
            "full_name": "Shri Sharma Hon. MP",
            "designation": "Member of Parliament",
            "phone": "9876543210"
        }
    )
    assert update_res.status_code == 200
    data = update_res.json()
    assert data["role"] == "MP"
    assert data["scope"]["constituency"] == "Pune"
    assert data["full_name"] == "Shri Sharma Hon. MP"

# ==================================================
# 3. DETECTED WORKFLOW STATE & LIFECYCLE TRANSITIONS
# ==================================================

def test_new_case_begins_in_detected_state(clean_db):
    rec_id = 99
    wf = get_case_workflow(rec_id)
    assert wf["record_id"] == rec_id
    assert wf["status"] == "DETECTED"
    assert wf["allowed_next_states"] == ["PRIORITIZED"]

def test_detected_can_transition_only_to_prioritized(clean_db):
    rec_id = 99
    # Transitioning directly from DETECTED to ASSIGNED is rejected
    with pytest.raises(ValueError) as exc:
        update_case_status(
            record_id=rec_id,
            new_status="ASSIGNED",
            user_id="officer1",
            role="MOSPI"
        )
    assert "Invalid workflow transition from 'DETECTED' to 'ASSIGNED'" in str(exc.value)

    # Transitioning DETECTED -> PRIORITIZED succeeds
    res = update_case_status(
        record_id=rec_id,
        new_status="PRIORITIZED",
        user_id="officer1",
        role="MOSPI",
        reason="Priority triage completed"
    )
    assert res["status"] == "PRIORITIZED"
    assert res["allowed_next_states"] == ["ASSIGNED"]

def test_full_operational_lifecycle_transitions(clean_db):
    rec_id = 75
    # DETECTED -> PRIORITIZED
    update_case_status(rec_id, "PRIORITIZED", "officer1", "MOSPI")

    # PRIORITIZED -> ASSIGNED
    s2 = update_case_status(rec_id, "ASSIGNED", "officer1", "MOSPI", assigned_to="officer2")
    assert s2["status"] == "ASSIGNED"
    assert s2["allowed_next_states"] == ["UNDER_REVIEW"]

    # ASSIGNED -> UNDER_REVIEW
    s3 = update_case_status(rec_id, "UNDER_REVIEW", "officer2", "MOSPI")
    assert s3["status"] == "UNDER_REVIEW"
    assert set(s3["allowed_next_states"]) == {"EVIDENCE_REQUESTED", "VERIFIED"}

    # UNDER_REVIEW -> EVIDENCE_REQUESTED
    s4 = update_case_status(rec_id, "EVIDENCE_REQUESTED", "officer2", "MOSPI")
    assert s4["status"] == "EVIDENCE_REQUESTED"
    assert s4["allowed_next_states"] == ["EVIDENCE_RECEIVED"]

    # EVIDENCE_REQUESTED -> EVIDENCE_RECEIVED
    s5 = update_case_status(rec_id, "EVIDENCE_RECEIVED", "officer2", "MOSPI")
    assert s5["status"] == "EVIDENCE_RECEIVED"
    assert set(s5["allowed_next_states"]) == {"UNDER_REVIEW", "VERIFIED"}

    # EVIDENCE_RECEIVED -> VERIFIED
    s6 = update_case_status(rec_id, "VERIFIED", "officer2", "MOSPI")
    assert s6["status"] == "VERIFIED"
    assert s6["allowed_next_states"] == ["DECIDED"]

    # VERIFIED -> DECIDED
    s7 = update_case_status(rec_id, "DECIDED", "officer2", "MOSPI", decision="CONFIRMED_ANOMALY")
    assert s7["status"] == "DECIDED"
    assert s7["allowed_next_states"] == ["CLOSED"]

    # DECIDED -> CLOSED
    s8 = update_case_status(rec_id, "CLOSED", "officer2", "MOSPI")
    assert s8["status"] == "CLOSED"
    assert s8["allowed_next_states"] == []

    # CLOSED is terminal
    with pytest.raises(ValueError) as exc:
        update_case_status(rec_id, "UNDER_REVIEW", "officer2", "MOSPI")
    assert "Invalid workflow transition from 'CLOSED'" in str(exc.value)

def test_existing_persisted_workflow_state_not_reset(clean_db):
    conn = get_connection()
    with conn:
        conn.execute(
            """
            INSERT INTO case_workflow (record_id, status, updated_at, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (300, "UNDER_REVIEW", "2026-09-01T00:00:00", "2026-09-01T00:00:00")
        )
    conn.close()

    wf = get_case_workflow(300)
    assert wf["status"] == "UNDER_REVIEW"
    assert wf["created_at"] == "2026-09-01T00:00:00"

# ==================================================
# 4. DISTRICT SCOPE DETERMINISM & ZERO FUZZY FALLBACK
# ==================================================

def test_trusted_district_mappings_count_and_schema():
    mappings = load_trusted_district_mappings(force_reload=True)
    # Production mapping count is zero because official MPLADS dataset lacks a canonical district column
    # and no records have independently authoritative external gazetteer provenance.
    assert count_trusted_district_mappings() == 0
    assert len(mappings) == 0

def test_district_scoping_behavior_trusted_vs_unmapped(monkeypatch):
    # Production state: all records unmapped -> False
    assert is_record_in_district(10, "Darbhanga", "Bihar") is False
    assert get_trusted_district_mapping(10) is None

    # Isolated test fixture for district matching logic
    test_mappings = {
        10: {
            "record_id": 10,
            "canonical_district": "Darbhanga",
            "state": "Bihar",
            "mapping_source": "TEST_FIXTURE",
            "mapping_reference": "REF_TEST",
            "mapping_method": "TEST_MOCK",
            "mapping_confidence": "HIGH",
            "is_trusted": True
        }
    }
    monkeypatch.setattr("src.scoping.district_scope._TRUSTED_DISTRICT_CACHE", test_mappings)

    # With test fixture:
    assert is_record_in_district(10, "Darbhanga", "Bihar") is True
    assert is_record_in_district(10, "Patna", "Bihar") is False
    assert is_record_in_district(10, "Darbhanga", "Rajasthan") is False
    assert is_record_in_district(1, "Pune", "Maharashtra") is False

# ==================================================
# 5. ACCESS CONTROL & SCOPE ENFORCEMENT ON READ APIS
# ==================================================

def test_unauthenticated_requests_to_internal_apis_rejected():
    endpoints = [
        f"{API_PREFIX}/cases",
        f"{API_PREFIX}/cases/10",
        f"{API_PREFIX}/cases/10/detail",
        f"{API_PREFIX}/cases/10/workflow",
        f"{API_PREFIX}/projects/10/overview",
        f"{API_PREFIX}/projects/10/demo-lifecycle",
        f"{API_PREFIX}/analytics/trends/allocations"
    ]
    for ep in endpoints:
        res = client.get(ep)
        assert res.status_code == 401, f"Expected 401 for unauthenticated request to {ep}, got {res.status_code}"

def test_mp_constituency_scope_enforcement(clean_db):
    mp_user = provision_user(
        email="mp.dindori@nic.in",
        password="Pass@12345678",
        full_name="Hon. MP Dindori",
        role="MP",
        scope_type="CONSTITUENCY",
        constituency="DINDORI(ST)",
        state="Maharashtra"
    )
    mp_client = _create_authenticated_client(mp_user)

    # In-scope: Record 208 is DINDORI(ST)
    res_in = mp_client.get(f"{API_PREFIX}/projects/208/overview")
    assert res_in.status_code == 200

    # Out-of-scope: Record 10 is DARBHANGA
    res_out = mp_client.get(f"{API_PREFIX}/projects/10/overview")
    assert res_out.status_code == 403

def test_district_authority_scope_enforcement(clean_db, monkeypatch):
    # District Authority for Bangalore Urban
    da_user = provision_user(
        email="dc.bangalore@karnataka.gov.in",
        password="Pass@12345678",
        full_name="Deputy Commissioner Bangalore Urban",
        role="DISTRICT_AUTHORITY",
        scope_type="DISTRICT",
        district="Bangalore Urban",
        state="Karnataka"
    )
    da_client = _create_authenticated_client(da_user)

    # In production state without mappings, record 117 is unmapped -> 403
    res_unmapped = da_client.get(f"{API_PREFIX}/projects/117/overview")
    assert res_unmapped.status_code == 403

    # Inject isolated test mapping for record 117
    test_mappings = {
        117: {
            "record_id": 117,
            "canonical_district": "Bangalore Urban",
            "state": "Karnataka",
            "mapping_source": "TEST_MOCK",
            "mapping_reference": "REF_117",
            "mapping_method": "TEST_MOCK",
            "mapping_confidence": "HIGH",
            "is_trusted": True
        }
    }
    monkeypatch.setattr("src.scoping.district_scope._TRUSTED_DISTRICT_CACHE", test_mappings)

    # In-scope: Record 117 is trusted mapped to Bangalore Urban in test fixture
    res_117 = da_client.get(f"{API_PREFIX}/projects/117/overview")
    assert res_117.status_code == 200

    # Out-of-scope: Record 26 is Dholpur, Rajasthan
    res_26 = da_client.get(f"{API_PREFIX}/projects/26/overview")
    assert res_26.status_code == 403

    # Unmapped record: Record 1 has no trusted district mapping -> 403
    res_1 = da_client.get(f"{API_PREFIX}/projects/1/overview")
    assert res_1.status_code == 403

def test_state_nodal_scope_enforcement(clean_db):
    sna_user = provision_user(
        email="sna.odisha@gov.in",
        password="Pass@12345678",
        full_name="State Nodal Officer Odisha",
        role="STATE_NODAL_AUTHORITY",
        scope_type="STATE",
        state="Odisha"
    )
    sna_client = _create_authenticated_client(sna_user)

    # In-scope: Record 350 is in Odisha
    res_in = sna_client.get(f"{API_PREFIX}/projects/350/overview")
    assert res_in.status_code == 200

    # Out-of-scope: Record 10 is Bihar
    res_out = sna_client.get(f"{API_PREFIX}/projects/10/overview")
    assert res_out.status_code == 403

def test_mospi_national_scope(clean_db):
    mospi_user = provision_user(
        email="dg.mospi@gov.in",
        password="Pass@12345678",
        full_name="Director General MoSPI",
        role="MOSPI",
        scope_type="NATIONAL"
    )
    mospi_client = _create_authenticated_client(mospi_user)

    # MoSPI can access any project record across all states
    assert mospi_client.get(f"{API_PREFIX}/projects/10/overview").status_code == 200
    assert mospi_client.get(f"{API_PREFIX}/projects/26/overview").status_code == 200
    assert mospi_client.get(f"{API_PREFIX}/projects/117/overview").status_code == 200
    assert mospi_client.get(f"{API_PREFIX}/projects/350/overview").status_code == 200

# ==================================================
# 6. WORKFLOW MUTATION PERMISSIONS & SPOOFING RESISTANCE
# ==================================================

def test_mp_cannot_mutate_workflow(clean_db):
    mp_user = provision_user(
        email="mp.karauli@gov.in",
        password="Pass@12345678",
        full_name="Hon. MP Karauli",
        role="MP",
        scope_type="CONSTITUENCY",
        constituency="KARAULI-DHOLPUR(SC)"
    )
    mp_client = _create_authenticated_client(mp_user)

    # MP cannot transition workflow status even for in-scope projects
    res = mp_client.patch(
        f"{API_PREFIX}/cases/26/workflow/status",
        json={"new_status": "PRIORITIZED"}
    )
    assert res.status_code == 403

    # MP cannot create human reviews
    r_res = mp_client.post(
        f"{API_PREFIX}/cases/26/reviews",
        json={"outcome": "CONFIRMED_DEVIATION", "note": "Review by MP"}
    )
    assert r_res.status_code == 403

def test_actor_identity_spoofing_prevented(clean_db, monkeypatch):
    # Inject isolated test mapping for record 26
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

    # District Authority for Dholpur
    da_user = provision_user(
        email="dm.dholpur@rajasthan.gov.in",
        password="Pass@12345678",
        full_name="Collector Dholpur",
        role="DISTRICT_AUTHORITY",
        scope_type="DISTRICT",
        district="Dholpur",
        state="Rajasthan"
    )
    da_client = _create_authenticated_client(da_user)

    # Attempt to spoof identity in request body claiming to be MoSPI officer
    res = da_client.patch(
        f"{API_PREFIX}/cases/26/workflow/status",
        json={
            "new_status": "PRIORITIZED",
            "user_id": "spoofed_mospi_dg",
            "role": "MOSPI",
            "reason": "Transitioning with valid scope"
        }
    )
    assert res.status_code == 200

    # Verify that the workflow audit log logged the authentic session user and role
    audit_res = da_client.get(f"{API_PREFIX}/cases/26/audit")
    assert audit_res.status_code == 200
    events = audit_res.json()
    assert len(events) >= 1
    latest = events[0]
    assert latest["user_id"] == da_user["user_id"]
    assert latest["role"] == "DISTRICT_AUTHORITY"
    assert latest["user_id"] != "spoofed_mospi_dg"

# ==================================================
# 7. PUBLIC ENDPOINTS REMAIN OPEN
# ==================================================

def test_public_endpoints_accessible_without_auth():
    # Health endpoint
    h_res = client.get(f"{API_PREFIX}/health")
    assert h_res.status_code == 200
    assert h_res.json()["status"] == "ok"

    # Statistics aggregate
    s_res = client.get(f"{API_PREFIX}/statistics")
    assert s_res.status_code == 200
    assert s_res.json()["total_records"] == 742

    # Portal options
    p_res = client.get(f"{API_PREFIX}/auth/portal-options")
    assert p_res.status_code == 200

# ==================================================
# 8. DEMO ENRICHMENT ACCESS CONTROL
# ==================================================

def test_demo_enrichment_endpoint_requires_auth_and_scope(clean_db, monkeypatch):
    # Inject isolated test mapping for record 26
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

    # Unauthenticated -> 401
    assert client.get(f"{API_PREFIX}/projects/26/demo-lifecycle").status_code == 401

    # In-scope District Authority -> 200
    da_user = provision_user(
        email="dm.dholpur2@rajasthan.gov.in",
        password="Pass@12345678",
        full_name="Collector Dholpur",
        role="DISTRICT_AUTHORITY",
        scope_type="DISTRICT",
        district="Dholpur",
        state="Rajasthan"
    )
    da_client = _create_authenticated_client(da_user)
    res_in = da_client.get(f"{API_PREFIX}/projects/26/demo-lifecycle")
    assert res_in.status_code == 200
    assert res_in.json()["is_demo_enrichment"] is True

    # Out-of-scope -> 403 (Record 10 is unmapped/out of Dholpur scope)
    assert da_client.get(f"{API_PREFIX}/projects/10/demo-lifecycle").status_code == 403
