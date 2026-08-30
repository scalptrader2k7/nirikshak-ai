import os
import json
import pandas as pd
import numpy as np
import pytest
from src.verification.evidence_service import calculate_freshness, get_evidence_summary
from src.verification.peer_benchmark import calculate_peer_stats, get_peer_benchmark
from src.verification.reality_gap import calculate_reality_gap
from src.verification.integrity_passport import generate_integrity_passport
from src.verification.payment_gate import generate_payment_gate_advisory
from src.verification.verification_brief import compile_verification_brief
from src.verification.build_verification import run_verification_pipeline

# 1. Test Date Freshness Classification
def test_evidence_freshness():
    # Fresh: <= 7 days
    res1 = calculate_freshness("2024-03-10", "2024-03-15")
    assert res1["age_days"] == 5
    assert res1["classification"] == "fresh"

    # Aging: >7 and <=30 days
    res2 = calculate_freshness("2024-03-01", "2024-03-15")
    assert res2["age_days"] == 14
    assert res2["classification"] == "aging"

    # Stale: >30 days
    res3 = calculate_freshness("2024-02-01", "2024-03-15")
    assert res3["age_days"] == 43
    assert res3["classification"] == "stale"

    # Missing / Invalid
    res4 = calculate_freshness("", "2024-03-15")
    assert res4["classification"] == "not_available"
    assert res4["age_days"] is None

    res5 = calculate_freshness("invalid-date", "2024-03-15")
    assert res5["classification"] == "not_available"

# 2. Test Evidence Classification
def test_evidence_classification():
    case_data = {
        "record_id": 1,
        "allocation_amount": 500000.0,
        "mp_name": "Test MP",
        "state": "Karnataka",
        "constituency": "Bangalore Rural",
        "recommended_date": "2024-03-10",
        "work_type": "road",
        "work": "Construction of road",
        "investigation_priority_level": "HIGH",
        "investigation_priority_score": 75.0,
        "cost_anomaly": True
    }
    peer_stats = {
        "status": "success",
        "peer_count": 5,
        "amount_ratio_to_median": 1.5
    }
    
    summary = get_evidence_summary(case_data, peer_stats)
    
    types = [item.evidence_type for item in summary]
    statuses = [item.status for item in summary]
    
    # Check key types exist
    assert "allocation_amount" in types
    assert "mp_name" in types
    assert "location" in types
    assert "recommended_date" in types
    assert "work_type" in types
    assert "peer_comparison_count" in types
    
    # Check unavailable fields are marked as not_available_in_current_dataset
    assert "site_photograph" in types
    photo_idx = types.index("site_photograph")
    assert statuses[photo_idx] == "not_available_in_current_dataset"
    
    # Check derived fields
    assert "peer_amount_ratio" in types
    ratio_idx = types.index("peer_amount_ratio")
    assert statuses[ratio_idx] == "derived"
    assert summary[ratio_idx].value == 1.5

# 3. Test Peer Benchmarking
def test_peer_benchmarking():
    # Setup mock projects database
    # 5 matching local peers
    mock_data = [
        {"original_row_index": 1, "state": "Karnataka", "work_type": "road", "allocation_amount": 100000.0},
        {"original_row_index": 2, "state": "Karnataka", "work_type": "road", "allocation_amount": 150000.0},
        {"original_row_index": 3, "state": "Karnataka", "work_type": "road", "allocation_amount": 200000.0},
        {"original_row_index": 4, "state": "Karnataka", "work_type": "road", "allocation_amount": 250000.0},
        {"original_row_index": 5, "state": "Karnataka", "work_type": "road", "allocation_amount": 300000.0},
        # National fallback peer
        {"original_row_index": 6, "state": "Tamil Nadu", "work_type": "bridge", "allocation_amount": 500000.0},
        {"original_row_index": 7, "state": "Tamil Nadu", "work_type": "bridge", "allocation_amount": 600000.0},
        {"original_row_index": 8, "state": "Karnataka", "work_type": "bridge", "allocation_amount": 700000.0},
        # Insufficient data work type
        {"original_row_index": 9, "state": "Karnataka", "work_type": "collider", "allocation_amount": 9000000.0},
    ]
    df = pd.DataFrame(mock_data)

    # A. Local Group Test (target ID = 3, group has 4 peers: 1, 2, 4, 5)
    # Peers: 100k, 150k, 250k, 300k. Median of peers: (150k + 250k)/2 = 200k. Mean: 200k.
    stats1 = calculate_peer_stats(3, df)
    assert stats1["status"] == "success"
    assert stats1["peer_group_level"] == "local"
    assert stats1["peer_count"] == 4
    assert stats1["peer_median"] == 200000.0
    assert stats1["amount_ratio_to_median"] == 1.0
    assert stats1["amount_deviation_percent"] == 0.0

    # B. Fallback to National (target ID = 8, group has bridge in Karnataka. bridge in KA has 0 other peers in state.
    # bridge nationally has peer IDs 6, 7 (2 peers). Total peers = 2, which is < 3!
    # Let's add one more bridge nationally to trigger national fallback.
    mock_data.append({"original_row_index": 10, "state": "Delhi", "work_type": "bridge", "allocation_amount": 800000.0})
    df = pd.DataFrame(mock_data)
    # bridge in Karnataka target ID 8. Peers: bridge nationally excluding 8 -> IDs 6, 7, 10.
    # Peer amounts: 500k, 600k, 800k. Median = 600k. Count = 3.
    stats2 = calculate_peer_stats(8, df)
    assert stats2["status"] == "success"
    assert stats2["peer_group_level"] == "national"
    assert stats2["peer_count"] == 3
    assert stats2["peer_median"] == 600000.0

    # C. Insufficient Data Test (collider target ID 9. 0 peers)
    stats3 = calculate_peer_stats(9, df)
    assert stats3["status"] == "insufficient_data"
    assert stats3["peer_count"] == 0
    assert stats3["peer_median"] is None

# 4. Test Reality Gap fallback
def test_reality_gap():
    # Empty inputs
    res1 = calculate_reality_gap(None, None)
    assert res1.reality_gap_status == "not_available"
    assert res1.reality_gap is None
    assert "Neither physical_progress nor fund_utilization" in res1.explanation
    
    # Available inputs
    res2 = calculate_reality_gap(90.0, 40.0)
    assert res2.reality_gap_status == "calculated"
    assert res2.reality_gap == 50.0
    assert res2.fund_utilization == 90.0
    assert res2.physical_progress == 40.0
    assert "Reality Gap" in res2.explanation

# 5. Test Integrity Passport
def test_integrity_passport():
    # Test Priority level mapping & clamping
    # HIGH -> RED
    case_red = {
        "investigation_priority_score": 85.0,
        "investigation_priority_level": "HIGH",
        "cost_anomaly": True,
        "exact_duplicate_anomaly": False,
        "near_duplicate_anomaly": False,
        "pattern_anomaly": False,
        "evidence": []
    }
    pass_red = generate_integrity_passport(case_red, {"amount_deviation_percent": 120.0})
    assert pass_red.integrity_status == "RED"
    assert pass_red.integrity_score == 15.0
    assert any("Cost outlier" in sig for sig in pass_red.risk_signals)
    assert "wrongdoing or corruption" in pass_red.explanation

    # MEDIUM -> AMBER
    case_amber = {
        "investigation_priority_score": 40.0,
        "investigation_priority_level": "MEDIUM",
        "cost_anomaly": False,
        "exact_duplicate_anomaly": True,
        "near_duplicate_anomaly": False,
        "pattern_anomaly": False,
        "evidence": [{"detector": "exact_duplicate", "value": 3}]
    }
    pass_amber = generate_integrity_passport(case_amber, {})
    assert pass_amber.integrity_status == "AMBER"
    assert pass_amber.integrity_score == 60.0
    assert any("Exact duplicate" in sig for sig in pass_amber.risk_signals)

    # LOW -> GREEN & clamping limits
    case_green = {
        "investigation_priority_score": -10.0, # testing clamp min
        "investigation_priority_level": "LOW",
        "cost_anomaly": False,
        "exact_duplicate_anomaly": False,
        "near_duplicate_anomaly": False,
        "pattern_anomaly": False,
        "evidence": []
    }
    pass_green = generate_integrity_passport(case_green, {})
    assert pass_green.integrity_status == "GREEN"
    assert pass_green.integrity_score == 100.0  # clamp priority -10.0 to 0.0 -> integrity 100.0

# 6. Test Payment Gate recommendations
def test_payment_gate():
    # LOW -> PROCEED
    advisory1 = generate_payment_gate_advisory({"investigation_priority_level": "LOW"})
    assert advisory1.recommendation == "PROCEED"
    assert "PROCEED" in advisory1.recommendation
    assert len(advisory1.required_next_evidence) > 0
    
    # MEDIUM -> VERIFY
    advisory2 = generate_payment_gate_advisory({"investigation_priority_level": "MEDIUM", "cost_anomaly": True})
    assert advisory2.recommendation == "VERIFY"
    assert any("estimate" in item for item in advisory2.required_next_evidence)
    
    # HIGH -> HOLD_AND_INSPECT
    advisory3 = generate_payment_gate_advisory({"investigation_priority_level": "HIGH", "exact_duplicate_anomaly": True})
    assert advisory3.recommendation == "HOLD_AND_INSPECT"
    assert any("Measurement Book" in item for item in advisory3.required_next_evidence)

# 7. Test Pipeline Determinism & Idempotency
def test_verification_pipeline_determinism(tmp_path):
    investigation_json = "data/reports/investigation_cases.json"
    clean_csv = "data/processed/mplads_clean.csv"
    feat_csv = "data/processed/mplads_features.csv"
    
    if not os.path.exists(investigation_json):
        pytest.skip("Source investigation_cases.json not built. Run pipeline first.")
        
    out_csv1 = tmp_path / "v1.csv"
    out_json1 = tmp_path / "v1.json"
    out_csv2 = tmp_path / "v2.csv"
    out_json2 = tmp_path / "v2.json"
    
    # Run once
    run_verification_pipeline(investigation_json, clean_csv, feat_csv, str(out_csv1), str(out_json1))
    # Run twice
    run_verification_pipeline(investigation_json, clean_csv, feat_csv, str(out_csv2), str(out_json2))
    
    # Assert exact binary parity of JSON reports
    with open(out_json1, "r", encoding="utf-8") as f1, open(out_json2, "r", encoding="utf-8") as f2:
        j1 = json.load(f1)
        j2 = json.load(f2)
        assert j1 == j2
        
    # Assert exact parity of CSVs
    df1 = pd.read_csv(out_csv1)
    df2 = pd.read_csv(out_csv2)
    pd.testing.assert_frame_equal(df1, df2)
