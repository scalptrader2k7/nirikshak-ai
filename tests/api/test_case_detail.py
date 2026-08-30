import pytest
from fastapi.testclient import TestClient
from src.api.main import app
from src.api.config import API_PREFIX
from src.api.data_loader import load_all_datasets, get_cases, get_verification_cases

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_api():
    success = load_all_datasets()
    assert success is True, "Failed to load cached datasets for API tests."

def test_case_detail_endpoint_valid():
    # 1. Fetch a valid record ID from the cache
    cases = get_cases()
    assert len(cases) > 0, "No investigation cases available to test."
    
    target_id = int(cases[0]["record_id"])
    
    # 2. Query the detail endpoint
    response = client.get(f"{API_PREFIX}/cases/{target_id}/detail")
    assert response.status_code == 200
    
    data = response.json()
    
    # 3. Schema validation
    assert "case" in data
    assert "project" in data
    assert "risk_summary" in data
    assert "primary_evidence" in data
    assert "evidence" in data
    assert "verification" in data
    assert "peer_benchmark" in data
    assert "integrity_passport" in data
    assert "payment_gate" in data
    assert "related_records" in data
    assert "available_information" in data
    assert "missing_information" in data
    assert "disclaimer" in data
    
    # 4. Content and details validation
    # Case section
    case = data["case"]
    assert int(case["record_id"]) == target_id
    assert "rank" in case
    assert "investigation_priority_score" in case
    
    # Project section
    project = data["project"]
    assert int(project["record_id"]) == target_id
    assert "work" in project
    assert "state" in project
    assert "allocation_amount" in project
    
    # Risk Summary
    risk_summary = data["risk_summary"]
    assert risk_summary["priority_level"] == case["investigation_priority_level"]
    assert risk_summary["priority_score"] == case["investigation_priority_score"]
    
    # Exact Disclaimer Text
    assert data["disclaimer"] == "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."

def test_case_detail_endpoint_invalid():
    # Large invalid ID should return 404
    response = client.get(f"{API_PREFIX}/cases/99999999/detail")
    assert response.status_code == 404
    assert response.json()["detail"] == "Investigation case not found"

def test_case_detail_data_consistency():
    # Find a case that has verification results loaded
    verification_cases = get_verification_cases()
    assert len(verification_cases) > 0, "No verification cases cached."
    
    target_id = int(verification_cases[0]["record_id"])
    ver_case = verification_cases[0]
    
    # Query API
    response = client.get(f"{API_PREFIX}/cases/{target_id}/detail")
    assert response.status_code == 200
    data = response.json()
    
    # Assert priority match Step 4A
    assert data["case"]["investigation_priority_score"] == ver_case["investigation_priority_score"]
    assert data["case"]["investigation_priority_level"] == ver_case["investigation_priority_level"]
    
    # Assert primary detector match Step 4A
    assert data["case"]["primary_detector"] == ver_case["primary_detector"]
    
    # Assert integrity passport match Step 6
    assert data["integrity_passport"]["integrity_status"] == ver_case["integrity_passport"]["integrity_status"]
    assert data["integrity_passport"]["integrity_score"] == ver_case["integrity_passport"]["integrity_score"]
    
    # Assert payment gate match Step 6
    assert data["payment_gate"]["recommendation"] == ver_case["payment_gate"]["recommendation"]
    assert data["payment_gate"]["reason"] == ver_case["payment_gate"]["reason"]
    
    # Assert peer benchmark match Step 6
    assert data["peer_benchmark"]["status"] == ver_case["peer_benchmark"]["status"]
    assert data["peer_benchmark"]["peer_count"] == ver_case["peer_benchmark"]["peer_count"]
    assert data["peer_benchmark"]["peer_median"] == ver_case["peer_benchmark"]["peer_median"]
    assert data["peer_benchmark"]["amount_deviation_percent"] == ver_case["peer_benchmark"]["amount_deviation_percent"]
    assert data["peer_benchmark"]["peer_scope"] == ver_case["peer_benchmark"]["peer_scope"]

def test_case_detail_related_records():
    # Find a case with related records in the cached list to test mapping
    cases = get_cases()
    target_case = None
    for c in cases:
        total_rel = (
            len(c.get("related_exact_duplicates", [])) + 
            len(c.get("related_potentially_suspicious", [])) + 
            len(c.get("related_contextual_near_duplicates", []))
        )
        if total_rel > 0:
            target_case = c
            break
            
    if target_case is None:
        pytest.skip("No cases with related record connections found for related records test.")
        
    target_id = int(target_case["record_id"])
    response = client.get(f"{API_PREFIX}/cases/{target_id}/detail")
    assert response.status_code == 200
    data = response.json()
    
    related_records = data["related_records"]
    assert "exact_duplicates" in related_records
    assert "potentially_suspicious" in related_records
    assert "contextual" in related_records
    
    # Confirm values inside related records contain enriched fields
    all_related = (
        related_records["exact_duplicates"] + 
        related_records["potentially_suspicious"] + 
        related_records["contextual"]
    )
    for r in all_related:
        assert "record_id" in r
        assert "work" in r
        assert "mp_name" in r
        assert "state" in r
        assert "allocation_amount" in r
        assert "relationship_type" in r
        assert "priority_level" in r
        assert r["relationship_type"] != "template_match"
