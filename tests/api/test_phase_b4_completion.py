import pytest
from fastapi.testclient import TestClient
from src.api.main import app
from src.api.config import API_PREFIX
from src.api.data_loader import load_all_datasets, get_clean_df
from src.persistence.database import get_connection, init_db
from src.auth.auth_service import provision_user
from src.auth.session import create_session, COOKIE_NAME
from src.auth.roles import get_official_roles
from src.workflow.workflow_service import ALLOWED_TRANSITIONS, update_case_status
from src.scoping.district_scope import count_trusted_district_mappings, load_trusted_district_mappings, is_record_in_district
from src.verification.data_completeness import (
    classify_field_status,
    FIELD_PRESENT,
    RECORD_LEVEL_MISSING,
    SOURCE_WIDE_UNAVAILABLE,
    DEMONSTRATION_ONLY
)
from src.governance.detector_registry import get_detector_registry
from src.governance.provenance_service import get_system_provenance

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_b4_env():
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
# 1. B3 CORRECTIVE VERIFICATION
# ==================================================

def test_login_works_without_prior_session(clean_db):
    user = provision_user(
        email="public.login.test@gov.in",
        password="ValidPassword123!",
        full_name="Login Test Official",
        role="MOSPI",
        scope_type="NATIONAL"
    )
    # Anonymous client with no cookies/session calls login
    anon_client = TestClient(app)
    res = anon_client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "public.login.test@gov.in", "password": "ValidPassword123!"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["message"] == "Login successful."
    assert data["user"]["email"] == "public.login.test@gov.in"
    assert COOKIE_NAME in res.cookies

def test_public_project_response_is_sanitized():
    # Public detail lookup
    res = client.get(f"{API_PREFIX}/projects/10")
    assert res.status_code == 200
    data = res.json()
    assert data["record_id"] == 10
    assert "work" in data
    assert "allocation_amount" in data
    assert "disclaimer" in data
    
    # Internal forensic/workflow fields must NOT be present
    forbidden_keys = [
        "investigation_notes",
        "reviewer_id",
        "reviewer_notes",
        "workflow_audit_trail",
        "evidence_requests",
        "decision_notes",
        "internal_review_history",
        "payment_anomalies",
        "compliance_screening"
    ]
    for k in forbidden_keys:
        assert k not in data

def test_production_trusted_district_mappings_count_is_zero():
    # Because official MPLADS lacks canonical district and no record has independent gazetteer reference
    assert count_trusted_district_mappings() == 0
    mappings = load_trusted_district_mappings(force_reload=True)
    assert len(mappings) == 0

def test_unmapped_district_project_denied_to_district_authority(clean_db):
    da_user = provision_user(
        email="da.unmapped.test@gov.in",
        password="Pass@12345678",
        full_name="DA Unmapped Tester",
        role="DISTRICT_AUTHORITY",
        scope_type="DISTRICT",
        district="Vikarabad",
        state="Telangana"
    )
    da_client = _create_authenticated_client(da_user)
    # Since production mappings are 0, every project is unmapped -> 403
    res = da_client.get(f"{API_PREFIX}/projects/75/overview")
    assert res.status_code == 403

def test_exact_workflow_graph_and_closed_is_terminal(clean_db):
    assert ALLOWED_TRANSITIONS["DETECTED"] == ["PRIORITIZED"]
    assert ALLOWED_TRANSITIONS["PRIORITIZED"] == ["ASSIGNED"]
    assert ALLOWED_TRANSITIONS["ASSIGNED"] == ["UNDER_REVIEW"]
    assert ALLOWED_TRANSITIONS["UNDER_REVIEW"] == ["EVIDENCE_REQUESTED", "VERIFIED"]
    assert ALLOWED_TRANSITIONS["EVIDENCE_REQUESTED"] == ["EVIDENCE_RECEIVED"]
    assert ALLOWED_TRANSITIONS["EVIDENCE_RECEIVED"] == ["UNDER_REVIEW", "VERIFIED"]
    assert ALLOWED_TRANSITIONS["VERIFIED"] == ["DECIDED"]
    assert ALLOWED_TRANSITIONS["DECIDED"] == ["CLOSED"]
    assert ALLOWED_TRANSITIONS["CLOSED"] == []

    # Attempt transition from CLOSED fails
    rec_id = 101
    update_case_status(rec_id, "PRIORITIZED", "u1", "MOSPI")
    update_case_status(rec_id, "ASSIGNED", "u1", "MOSPI")
    update_case_status(rec_id, "UNDER_REVIEW", "u1", "MOSPI")
    update_case_status(rec_id, "VERIFIED", "u1", "MOSPI")
    update_case_status(rec_id, "DECIDED", "u1", "MOSPI", decision="CONFIRMED_ANOMALY")
    update_case_status(rec_id, "CLOSED", "u1", "MOSPI")

    with pytest.raises(ValueError) as exc:
        update_case_status(rec_id, "UNDER_REVIEW", "u1", "MOSPI")
    assert "Invalid workflow transition from 'CLOSED'" in str(exc.value)

def test_mp_cannot_mutate_workflow(clean_db):
    mp_user = provision_user(
        email="mp.nomutate@sansad.nic.in",
        password="Pass@12345678",
        full_name="Honorable MP",
        role="MP",
        scope_type="CONSTITUENCY",
        constituency="Darbhanga"
    )
    mp_client = _create_authenticated_client(mp_user)
    res = mp_client.patch(
        f"{API_PREFIX}/cases/10/workflow/status",
        json={"new_status": "PRIORITIZED", "reason": "MP attempt"}
    )
    assert res.status_code == 403

def test_four_official_roles_only():
    roles = get_official_roles()
    assert set(roles) == {"MP", "DISTRICT_AUTHORITY", "STATE_NODAL_AUTHORITY", "MOSPI"}
    assert "ADMIN" not in roles
    assert "INVESTIGATOR" not in roles
    assert "CITIZEN" not in roles

# ==================================================
# 2. PEER BENCHMARK ENRICHMENT
# ==================================================

def test_peer_benchmark_endpoint_and_fields(clean_db):
    mospi_user = provision_user(
        email="mospi.bench@gov.in",
        password="Pass@12345678",
        full_name="MoSPI Benchmarker",
        role="MOSPI",
        scope_type="NATIONAL"
    )
    m_client = _create_authenticated_client(mospi_user)
    res = m_client.get(f"{API_PREFIX}/projects/10/peer-benchmark")
    assert res.status_code == 200
    data = res.json()

    # Required B4 fields
    assert data["record_id"] == 10
    assert "project_amount" in data
    assert data["peer_group_level"] in ("local", "national", "insufficient_data")
    assert "peer_group_definition" in data
    assert data["peer_count"] >= 0
    assert "peer_min" in data
    assert "peer_max" in data
    assert "peer_mean" in data
    assert "peer_median" in data
    assert "peer_percentile" in data
    assert "ratio_to_peer_median" in data
    assert "deviation_percent_from_peer_median" in data
    assert data["benchmark_period"] == "Official MPLADS Public Snapshot"
    assert data["benchmark_version"] == "1.0"
    assert isinstance(data["fallback_used"], bool)
    assert "interpretation" in data
    assert "disclaimer" in data

    # No "cost overrun" in interpretation
    assert "true cost overrun" not in data["interpretation"].lower()

# ==================================================
# 3. DUPLICATE EXPLORER
# ==================================================

def test_project_duplicates_endpoint_and_classification(clean_db):
    mospi_user = provision_user(
        email="mospi.dup@gov.in",
        password="Pass@12345678",
        full_name="MoSPI Duplicate Reviewer",
        role="MOSPI",
        scope_type="NATIONAL"
    )
    m_client = _create_authenticated_client(mospi_user)
    # Record 117 is an exact duplicate group member
    res = m_client.get(f"{API_PREFIX}/projects/117/duplicates")
    assert res.status_code == 200
    data = res.json()
    assert data["record_id"] == 117
    assert data["total_matches"] >= 1
    assert "exact_duplicate_count" in data
    assert "near_duplicate_count" in data

    first_match = data["matches"][0]
    assert "matched_record_id" in first_match
    assert first_match["duplicate_type"] in ("EXACT_DUPLICATE", "NEAR_DUPLICATE")
    assert first_match["classification"] in (
        "EXACT_DUPLICATE_RECORD",
        "POTENTIAL_NEAR_DUPLICATE",
        "CONTEXTUAL_SIMILARITY",
        "TEMPLATE_SIMILARITY"
    )
    assert "reason" in first_match

    # Verify absence of improper accusatory terms
    forbidden_terms = ["fraud", "corruption", "confirmed duplicate claim"]
    for m in data["matches"]:
        for term in forbidden_terms:
            assert term not in m["reason"].lower()
            assert term not in m["classification"].lower()

def test_global_duplicates_list(clean_db):
    mospi_user = provision_user(
        email="mospi.dup2@gov.in",
        password="Pass@12345678",
        full_name="MoSPI Global Duplicate Reviewer",
        role="MOSPI",
        scope_type="NATIONAL"
    )
    m_client = _create_authenticated_client(mospi_user)
    res = m_client.get(f"{API_PREFIX}/duplicates?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert "data" in data
    assert "pagination" in data
    assert "disclaimer" in data

# ==================================================
# 4. IMPLEMENTING AUTHORITY ANALYTICS
# ==================================================

def test_implementing_authorities_analytics(clean_db):
    mospi_user = provision_user(
        email="mospi.ida@gov.in",
        password="Pass@12345678",
        full_name="MoSPI IDA Reviewer",
        role="MOSPI",
        scope_type="NATIONAL"
    )
    m_client = _create_authenticated_client(mospi_user)
    res = m_client.get(f"{API_PREFIX}/analytics/implementing-authorities")
    assert res.status_code == 200
    data = res.json()
    assert data["total_authorities"] > 0
    first_ida = data["authorities"][0]

    assert "ida_name" in first_ida
    assert first_ida["project_count"] > 0
    assert first_ida["total_allocation"] > 0.0
    assert "average_allocation" in first_ida
    assert "median_allocation" in first_ida
    assert "average_risk_score" in first_ida
    assert "high_risk_record_count" in first_ida
    assert "exact_duplicate_record_count" in first_ida
    assert "near_duplicate_signal_count" in first_ida
    assert "work_type_distribution" in first_ida
    assert "state_distribution" in first_ida

    # IDA must never be described as contractor or vendor
    ida_str = str(first_ida).lower()
    assert "contractor" not in ida_str
    assert "vendor" not in ida_str

# ==================================================
# 5. CONCENTRATION ANALYTICS
# ==================================================

def test_concentration_analytics(clean_db):
    mospi_user = provision_user(
        email="mospi.conc@gov.in",
        password="Pass@12345678",
        full_name="MoSPI Concentration Analyst",
        role="MOSPI",
        scope_type="NATIONAL"
    )
    m_client = _create_authenticated_client(mospi_user)
    res = m_client.get(f"{API_PREFIX}/analytics/concentration")
    assert res.status_code == 200
    data = res.json()

    assert data["total_projects"] == 742
    assert data["total_allocation"] > 0.0
    assert len(data["category_concentration"]) > 0
    assert len(data["ida_concentration"]) > 0
    assert len(data["constituency_concentration"]) > 0
    assert "allocation_concentration" in data
    assert "temporal_bursts" in data

    # Responsible indicators
    assert "concentration indicator" in str(data) or "standard distribution" in str(data)

# ==================================================
# 6. DETECTOR GOVERNANCE METADATA
# ==================================================

def test_detector_governance_registry(clean_db):
    mospi_user = provision_user(
        email="mospi.gov@gov.in",
        password="Pass@12345678",
        full_name="MoSPI Governance Officer",
        role="MOSPI",
        scope_type="NATIONAL"
    )
    m_client = _create_authenticated_client(mospi_user)
    res = m_client.get(f"{API_PREFIX}/system/detectors")
    assert res.status_code == 200
    data = res.json()

    assert data["registry_version"] == "1.0"
    assert data["total_detectors"] == 5

    detector_ids = [d["detector_id"] for d in data["detectors"]]
    assert "cost_anomaly" in detector_ids
    assert "exact_duplicate_anomaly" in detector_ids
    assert "near_duplicate_anomaly" in detector_ids
    assert "pattern_anomaly" in detector_ids
    assert "investigation_priority_score" in detector_ids

    for d in data["detectors"]:
        assert d["detector_version"] == "1.0"
        assert len(d["input_fields"]) > 0
        assert len(d["limitations"]) > 0
        assert d["interpretation"]
        assert d["last_updated"]

# ==================================================
# 7. DATASET & PIPELINE PROVENANCE
# ==================================================

def test_system_provenance_metadata():
    # Public endpoint
    res = client.get(f"{API_PREFIX}/system/provenance")
    assert res.status_code == 200
    data = res.json()

    assert "generated_at" in data
    assert data["official_data"]["classification"] == "OFFICIAL_DATA"
    assert data["official_data"]["record_count"] == 742
    assert data["official_data"]["snapshot_date"] is None  # Not fabricated
    assert len(data["official_data"]["unavailable_fields"]) > 0

    assert data["derived_analytics"]["classification"] == "DERIVED_ANALYTICS"
    assert data["demonstration_lifecycle"]["classification"] == "DEMONSTRATION_LIFECYCLE_DATA"
    assert data["demonstration_lifecycle"]["is_synthetic"] is True
    assert data["demonstration_lifecycle"]["record_count"] == 12

# ==================================================
# 8. DATA COMPLETENESS TAXONOMY
# ==================================================

def test_data_completeness_taxonomy():
    assert classify_field_status("work", "Construction of Community Hall") == FIELD_PRESENT
    assert classify_field_status("city", None) == RECORD_LEVEL_MISSING
    assert classify_field_status("sanctioned_amount", None) == SOURCE_WIDE_UNAVAILABLE
    assert classify_field_status("sanctioned_amount", 500000.0, is_demo_record=True) == DEMONSTRATION_ONLY

# ==================================================
# 9. ACCESS CONTROL & SCOPING ON B4 ENDPOINTS
# ==================================================

def test_unauthenticated_requests_to_b4_intelligence_rejected():
    assert client.get(f"{API_PREFIX}/projects/10/peer-benchmark").status_code == 401
    assert client.get(f"{API_PREFIX}/projects/10/duplicates").status_code == 401
    assert client.get(f"{API_PREFIX}/duplicates").status_code == 401
    assert client.get(f"{API_PREFIX}/analytics/implementing-authorities").status_code == 401
    assert client.get(f"{API_PREFIX}/analytics/concentration").status_code == 401
    assert client.get(f"{API_PREFIX}/system/detectors").status_code == 401

def test_mp_scope_restriction_on_b4_endpoints(clean_db):
    mp_user = provision_user(
        email="mp.darbhanga@sansad.nic.in",
        password="Pass@12345678",
        full_name="MP Darbhanga",
        role="MP",
        scope_type="CONSTITUENCY",
        constituency="Darbhanga"
    )
    mp_client = _create_authenticated_client(mp_user)

    # In-scope: Record 10 is Darbhanga
    res_in_bench = mp_client.get(f"{API_PREFIX}/projects/10/peer-benchmark")
    assert res_in_bench.status_code == 200

    res_in_dup = mp_client.get(f"{API_PREFIX}/projects/10/duplicates")
    assert res_in_dup.status_code == 200

    # Out-of-scope: Record 26 is Dholpur
    res_out_bench = mp_client.get(f"{API_PREFIX}/projects/26/peer-benchmark")
    assert res_out_bench.status_code == 403

    res_out_dup = mp_client.get(f"{API_PREFIX}/projects/26/duplicates")
    assert res_out_dup.status_code == 403
