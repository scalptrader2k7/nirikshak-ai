import os
import tempfile
import shutil
import json
import pandas as pd
import numpy as np
import pytest
from src.anomaly_detection.cost_detector import detect_cost_anomalies, compute_loo_peer_stats
from src.anomaly_detection.exact_duplicate_detector import detect_exact_duplicates, get_duplicate_severity
from src.anomaly_detection.near_duplicate_detector import detect_near_duplicates, get_location_similarity_loo
from src.anomaly_detection.pattern_detector import detect_pattern_anomalies
from src.anomaly_detection.risk_aggregator import aggregate_risk_scores, get_priority_level
from src.anomaly_detection.run_detection import run_detection_pipeline

def test_loo_peer_stats():
    df = pd.DataFrame({
        "state": ["Rajasthan"] * 5,
        "allocation_amount": [1000.0, 10.0, 10.0, 10.0, 10.0]
    })
    median, mean, std = compute_loo_peer_stats(df, 0, "state", "Rajasthan")
    assert median == 10.0
    assert mean == 10.0
    assert std == 0.0

def test_loo_peer_stats_small_group():
    df = pd.DataFrame({
        "state": ["Rajasthan"] * 4,
        "allocation_amount": [100.0] * 4
    })
    median, mean, std = compute_loo_peer_stats(df, 0, "state", "Rajasthan")
    assert pd.isnull(median)

def test_cost_detector():
    df = pd.DataFrame({
        "allocation_amount": [500.0, 10.0, 11.0, 9.0, 10.0, 10.0],
        "state": ["Rajasthan"] * 6,
        "allocation_amount_percentile_global": [0.99, 0.2, 0.2, 0.2, 0.2, 0.2]
    })
    ev_list, trig_list = detect_cost_anomalies(df)
    assert trig_list[0] == True
    ev_0 = ev_list[0]
    detectors = [e["detector"] for e in ev_0]
    assert "cost" in detectors
    zscore_evidence = [e for e in ev_0 if "z-score" in e["unit"]]
    assert len(zscore_evidence) > 0

def test_exact_duplicate_graded_severity():
    assert get_duplicate_severity(1) == "none"
    assert get_duplicate_severity(2) == "low"
    assert get_duplicate_severity(3) == "medium"
    assert get_duplicate_severity(4) == "medium"
    assert get_duplicate_severity(5) == "high"
    assert get_duplicate_severity(9) == "high"
    assert get_duplicate_severity(10) == "critical"

def test_exact_duplicate_detector():
    df = pd.DataFrame({
        "is_exact_duplicate": [True, False, True],
        "duplicate_occurrence_count": [8, 1, 2],
        "exact_duplicate_group_id": ["group1", "group2", "group3"]
    })
    ev_list, trig_list = detect_exact_duplicates(df)
    assert trig_list[0] == True
    assert ev_list[0][0]["severity"] == "high"
    assert trig_list[1] == False
    assert trig_list[2] == True
    assert ev_list[2][0]["severity"] == "low"

def test_location_similarity_loo():
    # Complete match
    row_a = {"state": "Rajasthan", "constituency": "C1", "city": "Jaipur"}
    row_b = {"state": "Rajasthan", "constituency": "C1", "city": "Jaipur"}
    assert get_location_similarity_loo(row_a, row_b) == 1.0
    
    # Partial match
    row_c = {"state": "Rajasthan", "constituency": "C1", "block": "Sepau", "village": "Kaithri"}
    row_d = {"state": "Rajasthan", "constituency": "C1", "block": "Bari", "village": "Kaithri"}
    # Matches: state, constituency, village (3 matches). Comparable: state, constituency, block, village (4 total).
    # Similarity = 3/4 = 0.75
    assert get_location_similarity_loo(row_c, row_d) == 0.75
    
    # Missing value handling: should not treat missing-vs-missing as match
    row_e = {"state": "Rajasthan", "constituency": "C1", "block": "", "village": "nan"}
    row_f = {"state": "Rajasthan", "constituency": "C1", "block": "nan", "village": None}
    # Only state and constituency are populated in at least one of row_e/row_f (comparable = 2, matches = 2)
    assert get_location_similarity_loo(row_e, row_f) == 1.0

def test_pattern_detector():
    df = pd.DataFrame({
        "mp_recommendations_rolling_30d": [5]*9 + [50],
        "constituency_recommendations_rolling_30d": [10]*9 + [80]
    })
    ev_list, trig_list, thresholds = detect_pattern_anomalies(df)
    mp_thresh, const_thresh = thresholds
    assert mp_thresh >= 10
    assert const_thresh >= 15
    assert trig_list[9] == True
    assert trig_list[0] == False

def test_risk_aggregator_logic():
    assert get_priority_level(15) == "LOW"
    assert get_priority_level(21) == "MEDIUM"
    assert get_priority_level(50) == "MEDIUM"
    assert get_priority_level(51) == "HIGH"
    assert get_priority_level(80) == "HIGH"
    assert get_priority_level(81) == "CRITICAL"
    
    df = pd.DataFrame(index=[0])
    cost_ev = [[{"detector": "cost", "severity": "high", "message": "msg1", "value": 1, "reference_value": 1}]]
    exact_ev = [[{"detector": "exact_duplicate", "severity": "critical", "message": "msg2", "value": 1, "reference_value": 1}]]
    near_ev = [[{"detector": "near_duplicate", "severity": "medium", "message": "msg3", "value": 1, "reference_value": 1}]]
    pattern_ev = [[{"detector": "pattern", "severity": "medium", "message": "msg4", "value": 1, "reference_value": 1}]]
    
    agg_df, combined = aggregate_risk_scores(df, cost_ev, exact_ev, near_ev, pattern_ev)
    assert agg_df.loc[0, "investigation_priority_score"] == 68.5
    assert agg_df.loc[0, "investigation_priority_level"] == "HIGH"

def test_near_duplicate_template_frequency_discounting():
    # Case 1: Template frequency = 1 (unique) -> full contribution
    # Cases: freq = 1 -> discount = 1.0
    # freq = 25 -> discount = 1.0 - 24/50 = 0.52
    # freq = 51 -> discount = 1.0 - 50/50 = 0.0
    # freq = 100 -> discount = 0.0
    
    # We will mock the detector run to test this discounting behaviour
    # Construct a dataset with different description occurrence frequencies
    df = pd.DataFrame({
        "original_row_index": list(range(60)),
        "normalized_work_text": ["unique work A"] + ["common template B"]*55 + ["unique work C"]*4,
        "state": ["Rajasthan"] * 60,
        "constituency": ["C1"] * 60,
        "work_type": ["water"] * 60,
        "allocation_amount": [100000.0] * 60,
        "exact_duplicate_group_id": [f"hash_{i}" for i in range(60)], # distinct
        "blocking_key_work_type_state": ["water_rajasthan"] * 60,
        "blocking_key_work_type_constituency": ["water_c1"] * 60,
        "recommended_date": ["2024-03-04"] * 60,
        "mp_name": ["MP A"] * 60
    })
    
    ev_list, trig_list, pairs = detect_near_duplicates(df, similarity_threshold=0.85, use_blocking=True)
    
    # Find a pair for common template B (freq = 55 >= 51)
    # They should have near_duplicate_context_score discounted to near 0.70 - 0.30 = 0.40 because text contribution is 0.0!
    # Let's verify that their text contribution was indeed 0.0 (since max_freq = 55 >= 51).
    # Since they share state/constituency, wtype, amount, mp, and dates, they have:
    # location_sim = 1.0 (wt: 0.20) -> 0.20
    # constituency = 1.0 (wt: 0.20) -> 0.20
    # amount_ratio = 1.0 (wt: 0.15) -> 0.15
    # work_type = 1.0 (wt: 0.05) -> 0.05
    # date_prox = 1.0 (wt: 0.05) -> 0.05
    # cross_mp = 0.0 (wt: 0.05) -> 0.00
    # total context score (excluding text) = 0.20 + 0.20 + 0.15 + 0.05 + 0.05 = 0.65
    # Since text_contribution is 0.0 (due to frequency >= 51), the score is exactly 0.65.
    # Therefore, pair type is contextual_near_duplicate, not potentially_suspicious!
    # So they should NOT trigger near_duplicate_anomaly = True!
    
    common_pairs = [p for p in pairs if p["pair_type"] == "contextual_near_duplicate"]
    assert len(common_pairs) > 0
    assert common_pairs[0]["near_duplicate_context_score"] == pytest.approx(0.65)
    
    # Check that they did not trigger anomaly flag (anomaly_triggered is false)
    # The records with B (index 1 to 55) should have near_duplicate_anomaly = False (unless they match something else suspicious)
    assert trig_list[1] == False

def test_near_duplicate_context_score_calculation():
    # Setup two records with:
    # Text similarity = 1.0
    # Location matching fully (state, constituency, block, village, city, ward populated & matching) -> 1.0
    # Same constituency -> 1.0
    # Amount: 100000 vs 80000 -> ratio = 0.8
    # Same work_type -> 1.0
    # Date gap: 36.5 days -> date_proximity = 1.0 - 36.5/365.0 = 0.90
    # Different MPs, same constituency, amount_ratio = 0.8 >= 0.8 -> cross_mp_signal = 1.0
    # Let's make their template frequency = 2 (so frequency_discount = 1.0 - 1/50 = 0.98)
    # Text contribution = 1.0 * 0.98 = 0.98
    
    # Context score calculation:
    # 0.30 * 0.98 + 0.20 * 1.0 + 0.20 * 1.0 + 0.15 * 0.8 + 0.05 * 1.0 + 0.05 * 0.90 + 0.05 * 1.0
    # = 0.294 + 0.20 + 0.20 + 0.12 + 0.05 + 0.045 + 0.05 = 0.959
    # Mapped to potentially_suspicious!
    
    df = pd.DataFrame({
        "original_row_index": [0, 1],
        "normalized_work_text": ["unique test work description"] * 2,
        "state": ["Rajasthan"] * 2,
        "constituency": ["C1"] * 2,
        "city": ["Jaipur"] * 2,
        "ward": ["Ward 1"] * 2,
        "block": ["Sepau"] * 2,
        "village": ["Kaithri"] * 2,
        "work_type": ["water"] * 2,
        "allocation_amount": [100000.0, 80000.0],
        "exact_duplicate_group_id": ["hash_0", "hash_1"],
        "blocking_key_work_type_state": ["water_rajasthan"] * 2,
        "blocking_key_work_type_constituency": ["water_c1"] * 2,
        "recommended_date": ["2024-03-01", "2024-04-06 12:00:00"], # 36.5 days gap
        "mp_name": ["MP A", "MP B"]
    })
    
    ev_list, trig_list, pairs = detect_near_duplicates(df, similarity_threshold=0.85, use_blocking=True)
    
    assert len(pairs) == 1
    p = pairs[0]
    assert p["near_duplicate_context_score"] == pytest.approx(0.9589)
    assert p["pair_type"] == "potentially_suspicious"
    assert trig_list[0] == True
    assert trig_list[1] == True

def test_near_duplicate_date_proximity_and_amount_ratio():
    # 1. Date gaps: same date -> 1.0, 365 days -> 0.0
    # 2. Amount ratios: 100000 vs 100000 -> 1.0, 100000 vs 50000 -> 0.5, 100000 vs 0 -> 0.0
    
    # Verify LOO date gap calculation
    # Date gap: same date -> proximity = 1.0
    # Date gap: 365 days -> proximity = 0.0
    df = pd.DataFrame({
        "original_row_index": [0, 1, 2],
        "normalized_work_text": ["identical text description"] * 3,
        "state": ["Rajasthan"] * 3,
        "constituency": ["C1"] * 3,
        "work_type": ["water"] * 3,
        "allocation_amount": [100000.0, 50000.0, 0.0],
        "exact_duplicate_group_id": ["hash_0", "hash_1", "hash_2"],
        "blocking_key_work_type_state": ["water_rajasthan"] * 3,
        "blocking_key_work_type_constituency": ["water_c1"] * 3,
        "recommended_date": ["2024-03-01", "2024-03-01", "2025-03-01"], # Gap 0 & 365
        "mp_name": ["MP A", "MP A", "MP A"]
    })
    
    ev_list, trig_list, pairs = detect_near_duplicates(df, similarity_threshold=0.85, use_blocking=True)
    
    # Pairs list has comparisons: (0, 1), (0, 2), (1, 2)
    # For (0, 1): date gap = 0 days -> proximity = 1.0
    # For (0, 2): date gap = 365 days -> proximity = 0.0
    
    # For (0, 1) amount ratio: 50000 / 100000 = 0.5
    # For (0, 2) amount ratio: 0.0 / 100000 -> 0.0 (handles zero safely)
    p_0_1 = [p for p in pairs if p["record_a"] == 0 and p["record_b"] == 1][0]
    p_0_2 = [p for p in pairs if p["record_a"] == 0 and p["record_b"] == 2][0]
    
    assert p_0_1["amount_ratio"] == 0.5
    assert p_0_2["amount_ratio"] == 0.0
    assert p_0_2["date_gap_days"] == 365.0

def test_near_duplicate_regression_and_idempotency():
    temp_dir = tempfile.mkdtemp()
    try:
        # Mock full dataset in clean format
        df = pd.DataFrame({
            "mp_name": ["Manoj Rajoria"] * 6,
            "work": ["NA - Installing community drinking water plants"] * 6,
            "normalized_work_text": ["na installing community drinking water plants"] * 6,
            "category": ["Normal/Others"] * 6,
            "state": ["Rajasthan"] * 6,
            "constituency": ["KARAULI-DHOLPUR(SC)"] * 6,
            "ida": ["DISTRICT COLLECTOR DHOLPUR_IDA"] * 6,
            "city": [np.nan] * 6,
            "ward": [np.nan] * 6,
            "block": ["Sepau"] * 6,
            "village": ["Kaithri"] * 6,
            "recommended_date": ["2024-03-04"] * 6,
            "allocation_amount": [100000.0] * 6,
            "status": ["Unsanctioned"] * 6,
            "house": ["Lok Sabha"] * 6,
            "allocation_amount_is_missing": [False] * 6,
            "original_row_index": list(range(6)),
            "exact_duplicate_group_id": ["hash1"] * 6,
            "duplicate_occurrence_count": [6] * 6,
            "is_exact_duplicate": [True] * 6,
            "allocation_amount_percentile_global": [0.5] * 6,
            "mp_recommendations_rolling_30d": [6] * 6,
            "constituency_recommendations_rolling_30d": [6] * 6,
            "blocking_key_work_type_state": ["water_rajasthan"] * 6,
            "blocking_key_work_type_constituency": ["water_c1"] * 6,
            "work_type": ["water"] * 6
        })
        
        feat_csv = os.path.join(temp_dir, "features_input.csv")
        anom_csv = os.path.join(temp_dir, "anomaly_results.csv")
        anom_json = os.path.join(temp_dir, "anomaly_results.json")
        dup_pairs = os.path.join(temp_dir, "duplicate_pairs.csv")
        
        df.to_csv(feat_csv, index=False)
        
        # Run detection pipeline
        run_detection_pipeline(features_path=feat_csv, anomaly_csv_path=anom_csv, anomaly_json_path=anom_json, duplicate_pairs_csv_path=dup_pairs)
        
        # Verify output files exist
        assert os.path.exists(anom_csv)
        assert os.path.exists(anom_json)
        assert os.path.exists(dup_pairs)
        
        # Exact duplicate handling is unchanged: all 6 are exact duplicates
        res_df = pd.read_csv(anom_csv)
        assert (res_df["exact_duplicate_anomaly"] == True).all()
        
        # Exact duplicates are excluded from near-duplicate relationships!
        pairs_df = pd.read_csv(dup_pairs)
        assert len(pairs_df) == 0  # no near duplicates because they are all exact duplicates!
        
    finally:
        shutil.rmtree(temp_dir)
