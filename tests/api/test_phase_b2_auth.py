import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from src.api.main import app
from src.api.config import API_PREFIX
from src.api.data_loader import load_all_datasets
from src.persistence.database import get_connection, init_db
from src.auth.password import hash_password, verify_password
from src.auth.auth_service import provision_user
from src.auth.roles import Role, ScopeType, validate_portal_access
from src.auth.authorization import authorize_record_access, filter_records_by_scope
from src.auth.session import COOKIE_NAME

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_auth_test_env():
    success = load_all_datasets()
    assert success is True, "Failed to load pre-calculated datasets for API tests."
    init_db()

@pytest.fixture
def clean_db():
    """Cleans auth and workflow tables for isolated testing."""
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

# 1. Password Security
def test_password_hashing_and_verification():
    raw_pwd = "GovAuditSecret@2026"
    pwd_hash = hash_password(raw_pwd)
    
    # Hash is not plaintext
    assert raw_pwd not in pwd_hash
    assert pwd_hash.startswith("$2b$") or pwd_hash.startswith("$2a$")
    
    # Verification works
    assert verify_password(raw_pwd, pwd_hash) is True
    assert verify_password("WrongPassword!", pwd_hash) is False
    assert verify_password("", pwd_hash) is False

# 2. User Provisioning & Schema Persistence
def test_user_provisioning_and_schema(clean_db):
    user = provision_user(
        email="district.officer@nic.in",
        password="ValidPassword123!",
        full_name="Dr. S. K. Raman",
        role="DISTRICT_AUTHORITY",
        scope_type="DISTRICT",
        state="Karnataka",
        district="Bangalore",
        designation="District Magistrate"
    )
    assert user["user_id"].startswith("USR-")
    assert user["role"] == "DISTRICT_AUTHORITY"
    assert user["onboarding_completed"] is False
    assert user["recommended_portal"] == "DISTRICT_AUTHORITY"
    
    # Verify in DB: Plaintext password is NEVER stored
    conn = get_connection()
    cur = conn.execute("SELECT password_hash FROM users WHERE user_id = ?", (user["user_id"],))
    row = cur.fetchone()
    conn.close()
    assert row is not None
    assert "ValidPassword123!" not in row["password_hash"]

# 3. Successful Login & Session Cookie Set
def test_login_successful_and_cookie_set(clean_db):
    provision_user(
        email="mospi.officer@gov.in",
        password="OfficialPassword@123",
        full_name="Shri A. Verma",
        role="MOSPI",
        scope_type="NATIONAL"
    )
    
    res = client.post(
        f"{API_PREFIX}/auth/login",
        json={
            "email": "mospi.officer@gov.in",
            "password": "OfficialPassword@123"
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["message"] == "Login successful."
    assert data["user"]["email"] == "mospi.officer@gov.in"
    assert data["user"]["role"] == "MOSPI"
    assert data["user"]["scope"]["scope_type"] == "NATIONAL"
    assert data["user"]["onboarding_completed"] is False
    
    # Check HttpOnly cookie set
    assert COOKIE_NAME in res.cookies
    raw_cookie = res.cookies[COOKIE_NAME]
    assert len(raw_cookie) > 20

# 4. Login Failure Security: Generic Error Message
def test_login_invalid_credentials_generic_message(clean_db):
    provision_user(
        email="officer@nic.in",
        password="CorrectPassword123",
        full_name="Officer Test",
        role="INVESTIGATOR"
    )
    
    # Wrong password
    res1 = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "officer@nic.in", "password": "WrongPassword!"}
    )
    assert res1.status_code == 401
    assert res1.json()["detail"] == "Invalid credentials."
    
    # Non-existent user
    res2 = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "ghost.user@nic.in", "password": "AnyPassword!"}
    )
    assert res2.status_code == 401
    assert res2.json()["detail"] == "Invalid credentials."

# 5. Inactive Account Login Rejected
def test_login_inactive_account_rejected(clean_db):
    provision_user(
        email="deactivated@nic.in",
        password="SomePassword123!",
        full_name="Deactivated User",
        role="INVESTIGATOR",
        is_active=False
    )
    res = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "deactivated@nic.in", "password": "SomePassword123!"}
    )
    assert res.status_code == 403
    assert "inactive" in res.json()["detail"].lower()

# 6. /auth/me with Valid Session
def test_auth_me_with_valid_session(clean_db):
    provision_user(
        email="auditor.karnataka@gov.in",
        password="AuditorPass2026!",
        full_name="Smt. Revathi",
        role="STATE_NODAL",
        scope_type="STATE",
        state="Karnataka"
    )
    login_res = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "auditor.karnataka@gov.in", "password": "AuditorPass2026!"}
    )
    assert login_res.status_code == 200
    
    # Call /auth/me with cookie attached
    me_res = client.get(f"{API_PREFIX}/auth/me", cookies=login_res.cookies)
    assert me_res.status_code == 200
    user_me = me_res.json()
    assert user_me["authenticated"] is True
    assert user_me["email"] == "auditor.karnataka@gov.in"
    assert user_me["role"] == "STATE_NODAL"
    assert user_me["scope"]["state"] == "Karnataka"
    assert user_me["onboarding_completed"] is False
    assert user_me["recommended_portal"] == "STATE_NODAL"

# 7. /auth/me with No Session Returns 401
def test_auth_me_with_no_session_returns_401():
    client_unauth = TestClient(app)
    res = client_unauth.get(f"{API_PREFIX}/auth/me")
    assert res.status_code == 401
    assert "Authentication required" in res.json()["detail"]

# 8. Expired Session Rejected
def test_expired_session_rejected(clean_db):
    provision_user(
        email="expiring@nic.in",
        password="Password123!",
        full_name="Test User",
        role="INVESTIGATOR"
    )
    login_res = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "expiring@nic.in", "password": "Password123!"}
    )
    assert login_res.status_code == 200
    
    # Artificially expire the session in the database
    conn = get_connection()
    past_iso = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    with conn:
        conn.execute("UPDATE sessions SET expires_at = ?", (past_iso,))
    conn.close()
    
    # Should now fail with 401
    me_res = client.get(f"{API_PREFIX}/auth/me", cookies=login_res.cookies)
    assert me_res.status_code == 401

# 9. Logout Revokes Session & Clears Cookie
def test_logout_revokes_session_and_clears_cookie(clean_db):
    provision_user(
        email="logout.user@nic.in",
        password="LogoutPassword123!",
        full_name="Logout Test User",
        role="MP",
        scope_type="CONSTITUENCY",
        constituency="Bangalore South"
    )
    login_res = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "logout.user@nic.in", "password": "LogoutPassword123!"}
    )
    assert login_res.status_code == 200
    cookies = login_res.cookies
    
    # Call logout
    logout_res = client.post(f"{API_PREFIX}/auth/logout", cookies=cookies)
    assert logout_res.status_code == 200
    assert logout_res.json()["message"] == "Logged out successfully."
    
    # Verify DB session revoked
    conn = get_connection()
    cur = conn.execute("SELECT revoked_at FROM sessions")
    row = cur.fetchone()
    conn.close()
    assert row["revoked_at"] is not None
    
    # Subsequent /auth/me returns 401
    me_res = client.get(f"{API_PREFIX}/auth/me", cookies=cookies)
    assert me_res.status_code == 401

# 10. Role Cannot Be Self-Assigned at Login
def test_role_cannot_be_self_assigned_at_login(clean_db):
    provision_user(
        email="citizen@public.in",
        password="CitizenPassword123!",
        full_name="Citizen User",
        role="CITIZEN"
    )
    
    # Attempting to supply role in login payload should be rejected by strict schema validation
    res = client.post(
        f"{API_PREFIX}/auth/login",
        json={
            "email": "citizen@public.in",
            "password": "CitizenPassword123!",
            "role": "ADMIN"  # Malicious injection attempt
        }
    )
    assert res.status_code == 422  # Extra fields forbidden

# 11. Portal Selection Does Not Grant Role
def test_portal_selection_does_not_grant_role(clean_db):
    provision_user(
        email="district.user@nic.in",
        password="DistrictPass123!",
        full_name="District Officer",
        role="DISTRICT_AUTHORITY"
    )
    login_res = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "district.user@nic.in", "password": "DistrictPass123!"}
    )
    cookies = login_res.cookies
    
    # Check portal access for MOSPI (Disallowed)
    access_res1 = client.post(
        f"{API_PREFIX}/auth/portal-access",
        json={"portal": "MOSPI"},
        cookies=cookies
    )
    assert access_res1.status_code == 200
    body1 = access_res1.json()
    assert body1["allowed"] is False
    assert body1["actual_role"] == "DISTRICT_AUTHORITY"
    assert body1["recommended_portal"] == "DISTRICT_AUTHORITY"
    
    # Check portal access for DISTRICT_AUTHORITY (Allowed)
    access_res2 = client.post(
        f"{API_PREFIX}/auth/portal-access",
        json={"portal": "DISTRICT_AUTHORITY"},
        cookies=cookies
    )
    assert access_res2.status_code == 200
    body2 = access_res2.json()
    assert body2["allowed"] is True
    assert body2["actual_role"] == "DISTRICT_AUTHORITY"

# 12. Onboarding Lifecycle & Role Immutability
def test_onboarding_lifecycle_and_role_immutability(clean_db):
    provision_user(
        email="new.investigator@nic.in",
        password="NewUserPassword123!",
        full_name="Inspector Rao",
        role="INVESTIGATOR"
    )
    login_res = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "new.investigator@nic.in", "password": "NewUserPassword123!"}
    )
    cookies = login_res.cookies
    
    # Check onboarding state
    ob_res = client.get(f"{API_PREFIX}/auth/onboarding", cookies=cookies)
    assert ob_res.status_code == 200
    assert ob_res.json()["onboarding_completed"] is False
    
    # Attempting to elevate role in onboarding is rejected by schema
    hack_res = client.patch(
        f"{API_PREFIX}/auth/onboarding",
        json={"role": "ADMIN"},
        cookies=cookies
    )
    assert hack_res.status_code == 422  # Extra fields forbidden
    
    # Valid profile update
    update_res = client.patch(
        f"{API_PREFIX}/auth/onboarding",
        json={"designation": "Senior Forensic Auditor", "phone": "+91-9876543210"},
        cookies=cookies
    )
    assert update_res.status_code == 200
    assert update_res.json()["designation"] == "Senior Forensic Auditor"
    assert update_res.json()["role"] == "INVESTIGATOR"  # Role remains unchanged
    
    # Complete onboarding
    comp_res = client.post(f"{API_PREFIX}/auth/onboarding/complete", cookies=cookies)
    assert comp_res.status_code == 200
    assert comp_res.json()["onboarding_completed"] is True
    
    # /auth/me now reflects completed onboarding
    me_res = client.get(f"{API_PREFIX}/auth/me", cookies=cookies)
    assert me_res.json()["onboarding_completed"] is True

# 13. Session Identity Overrides Client-Claimed Identity in Workflow
def test_session_identity_overrides_client_claimed_user_in_workflow(clean_db):
    user = provision_user(
        email="real.investigator@gov.in",
        password="Password123!",
        full_name="Officer Real",
        role="INVESTIGATOR"
    )
    login_res = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "real.investigator@gov.in", "password": "Password123!"}
    )
    cookies = login_res.cookies
    rec_id = 117
    conn = get_connection()
    with conn:
        conn.execute("INSERT OR REPLACE INTO case_workflow (record_id, status, updated_at, created_at) VALUES (?, 'PRIORITIZED', '2026-09-01T00:00:00', '2026-09-01T00:00:00')", (rec_id,))
    conn.close()

    # Perform status update claiming to be 'spoofed_admin' with role 'MOSPI'
    patch_res = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={
            "new_status": "ASSIGNED",
            "user_id": "spoofed_admin",
            "role": "MOSPI",
            "reason": "Test audit identity enforcement"
        },
        cookies=cookies
    )
    assert patch_res.status_code == 200
    
    # Verify in audit events that the actor is user["user_id"] and INVESTIGATOR, NOT spoofed_admin
    conn = get_connection()
    cur = conn.execute(
        "SELECT user_id, role FROM audit_events WHERE record_id = ? ORDER BY timestamp DESC LIMIT 1",
        (rec_id,)
    )
    audit_row = cur.fetchone()
    conn.close()
    assert audit_row is not None
    assert audit_row["user_id"] == user["user_id"]
    assert audit_row["role"] == "INVESTIGATOR"

# 14. Scope Enforcement and Limitation Handling
def test_scope_enforcement_and_limitations():
    records = [
        {"record_id": 1, "state": "Karnataka", "constituency": "Bangalore North"},
        {"record_id": 2, "state": "Karnataka", "constituency": "Bangalore South"},
        {"record_id": 3, "state": "Maharashtra", "constituency": "Pune"},
    ]
    
    # National scope
    national_scope = {"scope_type": "NATIONAL"}
    assert len(filter_records_by_scope(records, national_scope)) == 3
    
    # State scope
    state_scope = {"scope_type": "STATE", "state": "Karnataka"}
    karnataka_recs = filter_records_by_scope(records, state_scope)
    assert len(karnataka_recs) == 2
    assert all(r["state"] == "Karnataka" for r in karnataka_recs)
    
    # Constituency scope
    const_scope = {"scope_type": "CONSTITUENCY", "constituency": "Bangalore South"}
    const_recs = filter_records_by_scope(records, const_scope)
    assert len(const_recs) == 1
    assert const_recs[0]["constituency"] == "Bangalore South"

# 15. B1 Tables Preserved and Backward Compatibility Maintained
def test_b1_tables_preserved(clean_db):
    # Verify B1 tables exist and operate non-destructively alongside B2 tables
    conn = get_connection()
    cur = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = {row[0] for row in cur.fetchall()}
    conn.close()
    
    # B1 tables
    assert "case_workflow" in tables
    assert "case_reviews" in tables
    assert "evidence_requests" in tables
    assert "audit_events" in tables
    
    # B2 tables
    assert "users" in tables
    assert "user_scopes" in tables
    assert "sessions" in tables
    assert "auth_events" in tables

# 16. Unauthenticated Workflow Mutations Return 401
def test_unauthenticated_workflow_mutations_return_401():
    client_unauth = TestClient(app)
    rec_id = 117
    
    # Status transition
    res1 = client_unauth.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "ASSIGNED"}
    )
    assert res1.status_code == 401
    assert "Authentication required" in res1.json()["detail"]
    
    # Review creation
    res2 = client_unauth.post(
        f"{API_PREFIX}/cases/{rec_id}/reviews",
        json={"outcome": "CONFIRMED_DEVIATION", "note": "Unauthenticated review attempt"}
    )
    assert res2.status_code == 401
    
    # Evidence request creation
    res3 = client_unauth.post(
        f"{API_PREFIX}/cases/{rec_id}/evidence-requests",
        json={"evidence_type": "site_photo", "description": "Unauthenticated test"}
    )
    assert res3.status_code == 401
    
    # Evidence request status update
    res4 = client_unauth.patch(
        f"{API_PREFIX}/cases/{rec_id}/evidence-requests/REQ-DUMMY",
        json={"status": "RECEIVED"}
    )
    assert res4.status_code == 401

# 17. Authenticated Review Creation Derives Reviewer Identity from Session
def test_authenticated_review_derives_identity_from_session(clean_db):
    provision_user(
        email="lead.auditor@nic.in",
        password="ValidPassword123!",
        full_name="Lead Auditor Sharma",
        role="INVESTIGATOR",
        user_id="USR-AUDITOR-01"
    )
    login_res = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "lead.auditor@nic.in", "password": "ValidPassword123!"}
    )
    assert login_res.status_code == 200
    cookies = login_res.cookies
    rec_id = 117

    res = client.post(
        f"{API_PREFIX}/cases/{rec_id}/reviews",
        json={
            "reviewer_id": "spoofed_auditor",
            "reviewer_role": "ADMIN",
            "outcome": "CONFIRMED_DEVIATION",
            "note": "Field audit verified allocation variance."
        },
        cookies=cookies
    )
    assert res.status_code == 201
    review = res.json()
    assert review["reviewer_id"] == "USR-AUDITOR-01"
    assert review["reviewer_role"] == "INVESTIGATOR"

# 18. Citizen Role Forbidden from Mutating Investigation Workflow
def test_citizen_role_forbidden_from_workflow_mutations(clean_db):
    provision_user(
        email="citizen.observer@gmail.com",
        password="CitizenPassword123!",
        full_name="Ramesh Citizen",
        role="CITIZEN"
    )
    login_res = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "citizen.observer@gmail.com", "password": "CitizenPassword123!"}
    )
    assert login_res.status_code == 200
    cookies = login_res.cookies
    rec_id = 117

    # PATCH status -> 403
    res1 = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "ASSIGNED"},
        cookies=cookies
    )
    assert res1.status_code == 403
    assert "not authorized to mutate investigation workflows" in res1.json()["detail"]

    # POST review -> 403
    res2 = client.post(
        f"{API_PREFIX}/cases/{rec_id}/reviews",
        json={"outcome": "CONFIRMED_DEVIATION", "note": "Citizen review attempt"},
        cookies=cookies
    )
    assert res2.status_code == 403

    # POST evidence request -> 403
    res3 = client.post(
        f"{API_PREFIX}/cases/{rec_id}/evidence-requests",
        json={"evidence_type": "site_photo", "description": "Citizen evidence request"},
        cookies=cookies
    )
    assert res3.status_code == 403

# 19. MP Role Forbidden from Mutating Official Investigation Workflow
def test_mp_role_forbidden_from_workflow_mutations(clean_db):
    provision_user(
        email="mp.representative@sansad.nic.in",
        password="MpPassword123!",
        full_name="Shri MP",
        role="MP"
    )
    login_res = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "mp.representative@sansad.nic.in", "password": "MpPassword123!"}
    )
    assert login_res.status_code == 200
    cookies = login_res.cookies
    rec_id = 117

    res = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "ASSIGNED"},
        cookies=cookies
    )
    assert res.status_code == 403
    assert "not authorized to mutate investigation workflows" in res.json()["detail"]

# 20. District Authority (In-Scope) and Internal Compatibility Capabilities Can Mutate Workflow
# NOTE: DISTRICT_AUTHORITY is the ONLY official product portal role authorized for operational mutations.
# ADMIN and INVESTIGATOR are strictly internal backend/service compatibility capabilities for maintenance/testing,
# never user-facing product roles.
def test_district_authority_and_internal_compat_capabilities_can_mutate_workflow(clean_db, monkeypatch):
    test_mappings = {
        117: {
            "record_id": 117,
            "canonical_district": "Pune",
            "state": "Maharashtra",
            "mapping_source": "TEST_MOCK",
            "mapping_reference": "REF_117",
            "mapping_method": "TEST_MOCK",
            "mapping_confidence": "HIGH",
            "is_trusted": True
        }
    }
    monkeypatch.setattr("src.scoping.district_scope._TRUSTED_DISTRICT_CACHE", test_mappings)

    rec_id = 117

    # Official product operational mutation role: DISTRICT_AUTHORITY (in-scope).
    # Internal service capabilities for test/maintenance: INVESTIGATOR, ADMIN.
    allowed_mutation_roles = [
        ("DISTRICT_AUTHORITY", "DISTRICT", "Maharashtra", "Pune"),
        ("INVESTIGATOR", "NATIONAL", None, None),
        ("ADMIN", "NATIONAL", None, None)
    ]
    for role_name, scope_type, state, district in allowed_mutation_roles:
        email = f"user.{role_name.lower()}@nirikshak.gov.in"
        provision_user(
            email=email,
            password="RolePassword123!",
            full_name=f"Official {role_name}",
            role=role_name,
            scope_type=scope_type,
            state=state,
            district=district
        )
        login_res = client.post(
            f"{API_PREFIX}/auth/login",
            json={"email": email, "password": "RolePassword123!"}
        )
        assert login_res.status_code == 200
        cookies = login_res.cookies

        # Submit evidence request as authorized reviewer
        res = client.post(
            f"{API_PREFIX}/cases/{rec_id}/evidence-requests",
            json={
                "evidence_type": "audit_memo",
                "description": f"Verification initiated by {role_name}"
            },
            cookies=cookies
        )
        assert res.status_code == 201
        assert res.json()["status"] == "REQUESTED"

    # Blocked oversight/coordination roles: MOSPI, STATE_NODAL
    blocked_roles = ["MOSPI", "STATE_NODAL"]
    for role_name in blocked_roles:
        email = f"user.{role_name.lower()}@nirikshak.gov.in"
        provision_user(
            email=email,
            password="RolePassword123!",
            full_name=f"Official {role_name}",
            role=role_name
        )
        login_res = client.post(
            f"{API_PREFIX}/auth/login",
            json={"email": email, "password": "RolePassword123!"}
        )
        assert login_res.status_code == 200
        cookies = login_res.cookies

        res = client.post(
            f"{API_PREFIX}/cases/{rec_id}/evidence-requests",
            json={
                "evidence_type": "audit_memo",
                "description": f"Blocked attempt by {role_name}"
            },
            cookies=cookies
        )
        assert res.status_code == 403
        assert "not authorized to mutate investigation workflows" in res.json()["detail"]

# 21. District Scope Safety: No Loose Location Fallback
def test_district_scope_safety_no_loose_location_fallback():
    # Record lacking canonical district column but with matching city and state
    record_without_district = {
        "record_id": 99,
        "state": "Maharashtra",
        "city": "Nagpur",
        "constituency": "Nagpur",
        "block": "Nagpur Rural"
    }
    district_scope = {"scope_type": "DISTRICT", "district": "Nagpur"}

    # Must be DENIED: direct district filtering is not directly enforceable without canonical column
    assert authorize_record_access(record_without_district, district_scope) is False

    # Record with canonical district matching target
    record_with_district = {
        "record_id": 100,
        "district": "Nagpur",
        "state": "Maharashtra"
    }
    assert authorize_record_access(record_with_district, district_scope) is True

    # Record with mismatched canonical district
    record_mismatched = {
        "record_id": 101,
        "district": "Pune",
        "state": "Maharashtra"
    }
    assert authorize_record_access(record_mismatched, district_scope) is False

# 22. Actual Registered Route Inventory Verification
def test_route_inventory_matches_actual_registered_routes():
    schema = app.openapi()
    paths = schema.get("paths", {})

    # Verify phantom/non-existent routes do NOT exist
    phantom_routes = [
        f"{API_PREFIX}/records",
        f"{API_PREFIX}/summary",
        f"{API_PREFIX}/analytics/summary",
        f"{API_PREFIX}/analytics/geographic",
        f"{API_PREFIX}/analytics/temporal",
        f"{API_PREFIX}/analytics/risk-distribution",
        f"{API_PREFIX}/analytics/completeness",
    ]
    for phantom in phantom_routes:
        assert phantom not in paths, f"Phantom route {phantom} found in registered OpenAPI paths"

    # Verify actual expected endpoints exist
    expected_real_routes = [
        f"{API_PREFIX}/health",
        f"{API_PREFIX}/statistics",
        f"{API_PREFIX}/cases",
        f"{API_PREFIX}/cases/{{record_id}}",
        f"{API_PREFIX}/cases/{{record_id}}/detail",
        f"{API_PREFIX}/cases/{{record_id}}/workflow",
        f"{API_PREFIX}/cases/{{record_id}}/workflow/status",
        f"{API_PREFIX}/cases/{{record_id}}/reviews",
        f"{API_PREFIX}/cases/{{record_id}}/evidence-requests",
        f"{API_PREFIX}/cases/{{record_id}}/evidence-requests/{{request_id}}",
        f"{API_PREFIX}/cases/{{record_id}}/audit",
        f"{API_PREFIX}/projects",
        f"{API_PREFIX}/projects/{{record_id}}/overview",
        f"{API_PREFIX}/analytics/trends/allocations",
        f"{API_PREFIX}/analytics/trends/recommendations",
        f"{API_PREFIX}/analytics/trends/risk",
        f"{API_PREFIX}/analytics/trends/anomalies",
        f"{API_PREFIX}/auth/login",
        f"{API_PREFIX}/auth/me",
        f"{API_PREFIX}/auth/logout",
        f"{API_PREFIX}/auth/portal-access",
        f"{API_PREFIX}/auth/onboarding",
        f"{API_PREFIX}/auth/onboarding/complete",
    ]
    for real in expected_real_routes:
        assert real in paths, f"Expected route {real} not found in registered OpenAPI paths"

# 23. Untrusted Origin Rejected on Workflow Mutation
def test_untrusted_origin_rejected_on_workflow_mutation(clean_db):
    provision_user(
        email="trusted.investigator@nic.in",
        password="ValidPassword123!",
        full_name="Trusted Investigator",
        role="INVESTIGATOR"
    )
    login_res = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "trusted.investigator@nic.in", "password": "ValidPassword123!"}
    )
    cookies = login_res.cookies
    rec_id = 117

    # Request from untrusted external domain
    res = client.patch(
        f"{API_PREFIX}/cases/{rec_id}/workflow/status",
        json={"new_status": "ASSIGNED"},
        cookies=cookies,
        headers={"Origin": "https://malicious-cross-origin.com"}
    )
    assert res.status_code == 403
    assert "Untrusted request origin" in res.json()["detail"]
