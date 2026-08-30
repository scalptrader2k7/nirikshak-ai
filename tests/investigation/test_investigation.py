import os
import json
import tempfile
import shutil
import pandas as pd
import numpy as np
import pytest

from src.investigation.evidence_formatter import format_evidence_item
from src.investigation.risk_explainer import get_primary_evidence, get_case_title, get_case_summary
from src.investigation.case_builder import build_investigation_cases, extract_related_exact_duplicates, extract_related_near_duplicates
from src.investigation.investigation_export import rank_and_sort_cases, export_cases_to_files
from src.investigation.build_investigation import run_investigation_pipeline

def test_evidence_formatter():
    # 1. Cost
    ev_cost = {
        "detector": "cost",
        "signal": "amount_vs_peer_state_median_loo",
        "value": 500000.0,
        "reference_value": 100000.0,
        "message": "Allocation is 5.0x the median of state peers."
    }
    assert format_evidence_item(ev_cost) == "Allocation is 5.0x the median amount among comparable state works."
    
    # 2. Exact duplicate
    ev_dup = {
        "detector": "exact_duplicate",
        "value": 7.0,
        "message": "Repeated row"
    }
    assert format_evidence_item(ev_dup) == "This exact project record appears 7 times in the dataset."
    
    # 3. Near duplicate
    ev_near = {
        "detector": "near_duplicate",
        "message": "Some near duplicate message"
    }
    assert format_evidence_item(ev_near) == "This project has a high contextual similarity with related project records."
    
    # 4. Pattern
    ev_pat = {
        "detector": "pattern",
        "message": "Unusual temporal concentration"
    }
    assert format_evidence_item(ev_pat) == "This recommendation occurred during an unusually high concentration of recommendations within the observed 30-day period."
    
    # 5. Fallback
    ev_fallback = {
        "detector": "cost",
        "signal": "other_signal",
        "message": "Fallback message"
    }
    assert format_evidence_item(ev_fallback) == "Fallback message"

def test_primary_evidence_selection_and_tie_breaking():
    # Hierarchy: critical (4) > high (3) > medium (2) > low (1)
    # Tie-breaker: exact_duplicate (4) > cost (3) > near_duplicate (2) > pattern (1)
    
    # Tie in severity (critical), tie-breaker exact_duplicate beats cost
    ev1 = {"detector": "cost", "severity": "critical", "signal": "sig1"}
    ev2 = {"detector": "exact_duplicate", "severity": "critical", "signal": "sig2"}
    primary = get_primary_evidence([ev1, ev2])
    assert primary["detector"] == "exact_duplicate"
    
    # High exact_duplicate beats high cost
    ev3 = {"detector": "cost", "severity": "high", "signal": "sig3"}
    ev4 = {"detector": "exact_duplicate", "severity": "high", "signal": "sig4"}
    primary2 = get_primary_evidence([ev3, ev4])
    assert primary2["detector"] == "exact_duplicate"
    
    # Critical pattern beats high exact_duplicate
    ev5 = {"detector": "exact_duplicate", "severity": "high", "signal": "sig5"}
    ev6 = {"detector": "pattern", "severity": "critical", "signal": "sig6"}
    primary3 = get_primary_evidence([ev5, ev6])
    assert primary3["detector"] == "pattern"

def test_case_titles():
    assert get_case_title("exact_duplicate") == "Repeated Project Record Requires Review"
    assert get_case_title("cost") == "High-Cost Allocation Requires Review"
    assert get_case_title("near_duplicate") == "Potentially Suspicious Project Similarity"
    assert get_case_title("pattern") == "Unusual Recommendation Pattern"
    assert get_case_title("unknown") == "Anomaly Flagged for Review"

def test_case_summary():
    ev = {"detector": "cost", "severity": "high", "signal": "amount_vs_peer_state_median_loo", "value": 500000.0, "reference_value": 100000.0}
    # Formatted message is "Allocation is 5.0x the median amount among comparable state works."
    # Summarized is "This project was flagged for review because allocation is 5.0x the median..."
    summary = get_case_summary(ev, 3)
    assert "flagged for review because allocation is 5.0x" in summary
    assert "triggered 3 total indicator(s)" in summary

def test_ranking_determinism():
    # Ranked by:
    # 1. investigation_priority_score descending
    # 2. highest_severity_score descending
    # 3. allocation_amount descending
    # 4. record_id ascending
    cases = [
        {"record_id": 1, "investigation_priority_score": 50.0, "highest_severity_score": 2, "allocation_amount": 1000.0},
        {"record_id": 2, "investigation_priority_score": 50.0, "highest_severity_score": 3, "allocation_amount": 1000.0}, # higher severity
        {"record_id": 3, "investigation_priority_score": 50.0, "highest_severity_score": 3, "allocation_amount": 2000.0}, # higher amount
        {"record_id": 4, "investigation_priority_score": 60.0, "highest_severity_score": 1, "allocation_amount": 1000.0}, # higher score
        {"record_id": 5, "investigation_priority_score": 50.0, "highest_severity_score": 2, "allocation_amount": 1000.0}  # same as 1, tie-breaker is record_id (1 vs 5) -> 1 wins
    ]
    
    ranked = rank_and_sort_cases(cases)
    # Expected order:
    # 1. Row 4 (score 60)
    # 2. Row 3 (score 50, sev 3, amount 2000)
    # 3. Row 2 (score 50, sev 3, amount 1000)
    # 4. Row 1 (score 50, sev 2, amount 1000, ID 1)
    # 5. Row 5 (score 50, sev 2, amount 1000, ID 5)
    assert [c["record_id"] for c in ranked] == [4, 3, 2, 1, 5]
    assert ranked[0]["rank"] == 1
    assert ranked[4]["rank"] == 5

def test_related_records_selection():
    # Mock clean_df
    clean_df = pd.DataFrame({
        "original_row_index": [0, 1, 2],
        "exact_duplicate_group_id": ["group_1", "group_1", "group_2"],
        "duplicate_occurrence_count": [2, 2, 1],
        "mp_name": ["MP A", "MP A", "MP B"],
        "allocation_amount": [10000.0, 10000.0, 50000.0],
        "recommended_date": ["2024-03-01", "2024-03-01", "2024-03-05"]
    })
    
    # 0 and 1 are exact duplicates of each other
    related_0 = extract_related_exact_duplicates(0, clean_df)
    assert len(related_0) == 1
    assert related_0[0]["record_id"] == 1
    
    related_2 = extract_related_exact_duplicates(2, clean_df)
    assert len(related_2) == 0
    
    # Mock duplicate_pairs_df
    duplicate_pairs_df = pd.DataFrame({
        "record_a": [0, 1],
        "record_b": [2, 2],
        "pair_type": ["potentially_suspicious", "template_match"],
        "text_similarity": [0.90, 1.00],
        "location_similarity": [1.00, 1.00],
        "amount_ratio": [0.20, 0.20],
        "date_gap_days": [4, 4],
        "near_duplicate_context_score": [0.75, 0.35]
    })
    
    # For record 0 matching record 2 as potentially suspicious
    rel_susp = extract_related_near_duplicates(0, duplicate_pairs_df, "potentially_suspicious")
    assert len(rel_susp) == 1
    assert rel_susp[0]["record_id"] == 2
    
    # Template matches are not parsed in related contextual near duplicates
    rel_cont = extract_related_near_duplicates(1, duplicate_pairs_df, "contextual_near_duplicate")
    assert len(rel_cont) == 0

def test_disclaimer_presence():
    # Every case must contain the exact disclaimer
    clean_df = pd.DataFrame({
        "original_row_index": [0],
        "mp_name": ["MP A"],
        "house": ["Lok Sabha"],
        "state": ["Rajasthan"],
        "constituency": ["C1"],
        "city": [None], "ward": [None], "block": [None], "village": [None],
        "recommended_date": ["2024-03-01"],
        "work": ["Road works"],
        "allocation_amount": [100000.0]
    })
    anomaly_df = pd.DataFrame({
        "original_row_index": [0],
        "investigation_priority_score": [50.0],
        "investigation_priority_level": ["MEDIUM"],
        "cost_anomaly": [True],
        "exact_duplicate_anomaly": [False],
        "near_duplicate_anomaly": [False],
        "pattern_anomaly": [False]
    })
    features_df = pd.DataFrame({
        "original_row_index": [0],
        "work_type": ["road"]
    })
    duplicate_pairs_df = pd.DataFrame(columns=["record_a", "record_b", "pair_type"])
    evidence_json_dict = {
        "results": [
            {
                "original_row_index": 0,
                "evidence": [{"detector": "cost", "severity": "medium", "signal": "amount_vs_peer_state_median_loo", "value": 100, "reference_value": 10}]
            }
        ]
    }
    
    cases = build_investigation_cases(anomaly_df, clean_df, features_df, duplicate_pairs_df, evidence_json_dict)
    assert len(cases) == 1
    assert cases[0]["disclaimer"] == "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."

def test_pipeline_idempotency_and_e2e():
    # Runs the actual pipeline on real files (E2E) and checks idempotency
    anomaly_csv = r"data/processed/anomaly_results.csv"
    anomaly_json = r"data/reports/anomaly_results.json"
    dup_pairs_csv = r"data/processed/duplicate_pairs.csv"
    clean_csv = r"data/processed/mplads_clean.csv"
    feat_csv = r"data/processed/mplads_features.csv"
    
    temp_dir = tempfile.mkdtemp()
    try:
        out_csv1 = os.path.join(temp_dir, "investigation_cases1.csv")
        out_json1 = os.path.join(temp_dir, "investigation_cases1.json")
        out_csv2 = os.path.join(temp_dir, "investigation_cases2.csv")
        out_json2 = os.path.join(temp_dir, "investigation_cases2.json")
        
        # First Run
        run_investigation_pipeline(anomaly_csv, anomaly_json, dup_pairs_csv, clean_csv, feat_csv, out_csv1, out_json1)
        assert os.path.exists(out_csv1)
        assert os.path.exists(out_json1)
        
        # Second Run
        run_investigation_pipeline(anomaly_csv, anomaly_json, dup_pairs_csv, clean_csv, feat_csv, out_csv2, out_json2)
        
        # Check idempotency
        csv1 = pd.read_csv(out_csv1)
        csv2 = pd.read_csv(out_csv2)
        pd.testing.assert_frame_equal(csv1, csv2)
        
        with open(out_json1, "r", encoding="utf-8") as f1, open(out_json2, "r", encoding="utf-8") as f2:
            j1 = json.load(f1)
            j2 = json.load(f2)
            # Remove timestamp for direct comparison
            j1["metadata"]["timestamp"] = ""
            j2["metadata"]["timestamp"] = ""
            assert j1 == j2
            
    finally:
        shutil.rmtree(temp_dir)
