import json
import pytest
from fastapi.testclient import TestClient
from src.api.main import app
from src.api.config import API_PREFIX
from src.api.data_loader import load_all_datasets

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_api_data():
    # Guarantee datasets are loaded in memory
    success = load_all_datasets()
    assert success == True, "Failed to load pre-calculated datasets for API tests."

def test_health_endpoint():
    response = client.get(f"{API_PREFIX}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["data_loaded"] == True
    assert "service" in data
    assert "version" in data

def test_cases_endpoint():
    response = client.get(f"{API_PREFIX}/cases")
    assert response.status_code == 200
    res_json = response.json()
    assert "data" in res_json
    assert "pagination" in res_json
    assert "filters" in res_json
    
    # Check default pagination fields
    pagination = res_json["pagination"]
    assert pagination["page"] == 1
    assert pagination["page_size"] == 20
    assert pagination["total_records"] > 0
    assert pagination["total_pages"] > 0
    
    # Check data matches schema
    if len(res_json["data"]) > 0:
        first_case = res_json["data"][0]
        assert "record_id" in first_case
        assert "rank" in first_case
        assert "investigation_priority_score" in first_case
        assert "disclaimer" in first_case

def test_pagination():
    response = client.get(f"{API_PREFIX}/cases?page=2&page_size=5")
    assert response.status_code == 200
    res_json = response.json()
    pagination = res_json["pagination"]
    assert pagination["page"] == 2
    assert pagination["page_size"] == 5
    assert len(res_json["data"]) <= 5

def test_page_size_limit():
    # le=100 on page_size query parameter triggers FastAPI validation (422 Unprocessable Entity)
    response = client.get(f"{API_PREFIX}/cases?page_size=101")
    assert response.status_code == 422

def test_priority_filtering():
    response = client.get(f"{API_PREFIX}/cases?priority=HIGH")
    assert response.status_code == 200
    res_json = response.json()
    for case in res_json["data"]:
        assert case["investigation_priority_level"] == "HIGH"

def test_detector_filtering():
    response = client.get(f"{API_PREFIX}/cases?detector=exact_duplicate")
    assert response.status_code == 200
    res_json = response.json()
    for case in res_json["data"]:
        assert case["primary_detector"] == "exact_duplicate"

def test_severity_filtering():
    response = client.get(f"{API_PREFIX}/cases?severity=high")
    assert response.status_code == 200
    res_json = response.json()
    for case in res_json["data"]:
        assert case["highest_severity"] == "high"

def test_search_case_insensitively():
    # Search for "road"
    response = client.get(f"{API_PREFIX}/cases?search=rOaD")
    assert response.status_code == 200
    res_json = response.json()
    for case in res_json["data"]:
        # Verify text match in any searchable field
        searchable_text = (
            str(case["work"]) + str(case["mp_name"]) + str(case["state"]) +
            str(case["constituency"]) + str(case.get("city", "")) +
            str(case.get("block", "")) + str(case.get("village", ""))
        ).lower()
        assert "road" in searchable_text

def test_score_range_filtering():
    response = client.get(f"{API_PREFIX}/cases?min_score=30&max_score=60")
    assert response.status_code == 200
    res_json = response.json()
    for case in res_json["data"]:
        score = case["investigation_priority_score"]
        assert 30 <= score <= 60

def test_sorting_deterministic():
    # Sort by investigation_priority_score desc
    response = client.get(f"{API_PREFIX}/cases?sort_by=investigation_priority_score&sort_order=desc")
    assert response.status_code == 200
    res_json = response.json()
    scores = [case["investigation_priority_score"] for case in res_json["data"]]
    # Scores should be sorted in descending order
    assert scores == sorted(scores, reverse=True)

def test_single_case_lookup():
    # Fetch list first to get a valid ID
    list_res = client.get(f"{API_PREFIX}/cases?page_size=1")
    assert list_res.status_code == 200
    first_case = list_res.json()["data"][0]
    valid_id = first_case["record_id"]
    
    # Lookup by ID
    single_res = client.get(f"{API_PREFIX}/cases/{valid_id}")
    assert single_res.status_code == 200
    single_data = single_res.json()["data"]
    assert single_data["record_id"] == valid_id
    assert single_data["rank"] == first_case["rank"]

def test_missing_case_returns_404():
    response = client.get(f"{API_PREFIX}/cases/999999")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Investigation case not found"

def test_statistics():
    response = client.get(f"{API_PREFIX}/statistics")
    assert response.status_code == 200
    stats = response.json()
    assert "total_records" in stats
    assert "investigation_cases" in stats
    assert "priority_distribution" in stats
    assert "detector_distribution" in stats
    assert "score" in stats
    
    # Assert counts match known E2E values
    assert stats["total_records"] == 742
    assert stats["investigation_cases"] == 718
    assert stats["priority_distribution"]["HIGH"] == 10
    
    # Assert scores stats
    score = stats["score"]
    assert score["min"] >= 0.0
    assert score["max"] == 61.0

def test_filtered_statistics():
    # Stats for Karnataka
    response = client.get(f"{API_PREFIX}/statistics?state=Karnataka")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total_records"] < 742
    assert stats["total_records"] > 0

def test_invalid_parameters():
    # Invalid priority
    response1 = client.get(f"{API_PREFIX}/cases?priority=URGENT")
    assert response1.status_code == 400
    
    # Invalid detector
    response2 = client.get(f"{API_PREFIX}/cases?detector=grok")
    assert response2.status_code == 400
    
    # Invalid sort order
    response3 = client.get(f"{API_PREFIX}/cases?sort_order=up")
    assert response3.status_code == 400
    
    # min_score > max_score
    response4 = client.get(f"{API_PREFIX}/cases?min_score=50&max_score=30")
    assert response4.status_code == 400

def test_data_immutability():
    # Make sure API calls do not modify the original stored JSON case file
    with open("data/reports/investigation_cases.json", "r", encoding="utf-8") as f:
        original_data = json.load(f)
        
    client.get(f"{API_PREFIX}/cases?page_size=10")
    client.get(f"{API_PREFIX}/statistics?state=Rajasthan")
    
    with open("data/reports/investigation_cases.json", "r", encoding="utf-8") as f:
        current_data = json.load(f)
        
    assert original_data == current_data
