import os
import json
import pandas as pd
import numpy as np

from src.investigation.case_builder import build_investigation_cases
from src.investigation.investigation_export import export_cases_to_files

def validate_inputs(anomaly_csv, anomaly_json, dup_pairs_csv, clean_csv, feat_csv):
    """
    Validates input files existence and columns format.
    """
    print("Validating input datasets...")
    for fpath in [anomaly_csv, anomaly_json, dup_pairs_csv, clean_csv, feat_csv]:
        if not os.path.exists(fpath):
            raise FileNotFoundError(f"Required input file missing: {fpath}")
            
    # Load and check columns
    anom_df = pd.read_csv(anomaly_csv)
    dup_df = pd.read_csv(dup_pairs_csv)
    clean_df = pd.read_csv(clean_csv)
    feat_df = pd.read_csv(feat_csv)
    
    anom_cols = ["original_row_index", "investigation_priority_score", "investigation_priority_level",
                 "cost_anomaly", "exact_duplicate_anomaly", "near_duplicate_anomaly", "pattern_anomaly"]
    for c in anom_cols:
        if c not in anom_df.columns:
            raise KeyError(f"Column '{c}' missing from anomaly_results.csv")
            
    clean_cols = ["original_row_index", "exact_duplicate_group_id", "duplicate_occurrence_count",
                  "mp_name", "state", "constituency", "allocation_amount", "recommended_date", "house"]
    for c in clean_cols:
        if c not in clean_df.columns:
            raise KeyError(f"Column '{c}' missing from mplads_clean.csv")
            
    if len(dup_df) > 0:
        dup_cols = ["record_a", "record_b", "pair_type", "text_similarity", "near_duplicate_context_score"]
        for c in dup_cols:
            if c not in dup_df.columns:
                raise KeyError(f"Column '{c}' missing from duplicate_pairs.csv")
                
    # Validate JSON structure
    with open(anomaly_json, "r", encoding="utf-8") as f:
        try:
            anom_json_dict = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON file in anomaly_results.json: {e}")
            
    if "results" not in anom_json_dict:
        raise KeyError("Key 'results' missing from anomaly_results.json")
        
    print("Inputs successfully validated.")
    return anom_df, clean_df, feat_df, dup_df, anom_json_dict

def validate_outputs(cases, anomaly_df):
    """
    Runs sanity checks on the generated investigation cases.
    """
    print("Validating generated cases...")
    expected_count = len(anomaly_df[anomaly_df["investigation_priority_score"] > 0])
    if len(cases) != expected_count:
        raise ValueError(f"Case count mismatch: got {len(cases)} cases, expected {expected_count}")
        
    seen_ids = set()
    ranks = []
    expected_disclaimer = "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."
    
    for case in cases:
        idx = case["record_id"]
        # 1. Unique ID check
        if idx in seen_ids:
            raise ValueError(f"Duplicate record_id found in cases: {idx}")
        seen_ids.add(idx)
        
        # 2. Ranks collection
        ranks.append(case["rank"])
        
        # 3. Score checks
        score = case["investigation_priority_score"]
        if score <= 0 or pd.isnull(score) or np.isinf(score):
            raise ValueError(f"Invalid priority score {score} for record {idx}")
            
        # 4. Disclaimer check
        if case["disclaimer"] != expected_disclaimer:
            raise ValueError(f"Invalid disclaimer wording for record {idx}")
            
        # 5. Evidence counts
        if case["evidence_count"] != len(case["evidence"]):
            raise ValueError(f"Evidence count mismatch for record {idx}")
            
        # 6. Related records self-containment check
        for group_type in ["related_exact_duplicates", "related_potentially_suspicious", "related_contextual_near_duplicates"]:
            for rel in case[group_type]:
                if rel["record_id"] == idx:
                    raise ValueError(f"Record {idx} listed as its own related record in {group_type}")
                # 7. Exclude template matches from related records
                if group_type != "related_exact_duplicates":
                    if rel.get("pair_type") == "template_match":
                        raise ValueError(f"Record {idx} contains template_match inside suspicious related group {group_type}")
                        
        # 8. Check for NaNs/infs in critical fields
        for field in ["investigation_priority_score", "investigation_priority_level", "title", "summary"]:
            val = case[field]
            if pd.isnull(val) or val == "":
                raise ValueError(f"Critical field '{field}' is null/empty for record {idx}")
                
    # Rank contiguity check
    ranks.sort()
    if ranks != list(range(1, len(cases) + 1)):
        raise ValueError("Ranks are not unique and contiguous starting from 1")
        
    print("Outputs successfully validated.")

def run_investigation_pipeline(anomaly_csv, anomaly_json, dup_pairs_csv, clean_csv, feat_csv, out_csv, out_json):
    # 1. Load & Validate input
    anom_df, clean_df, feat_df, dup_df, anom_json_dict = validate_inputs(
        anomaly_csv, anomaly_json, dup_pairs_csv, clean_csv, feat_csv
    )
    
    # 2. Build cases
    print("Building cases...")
    cases = build_investigation_cases(anom_df, clean_df, feat_df, dup_df, anom_json_dict)
    
    # 3. Export & Rank
    print("Ranking and exporting cases...")
    total_exported = export_cases_to_files(cases, out_csv, out_json)
    
    # 4. Validate output (ranked cases now have ranks assigned)
    # Load ranked cases from json to be absolutely sure what was written passes validation
    with open(out_json, "r", encoding="utf-8") as f:
        saved_report = json.load(f)
    validate_outputs(saved_report["cases"], anom_df)
    
    # 5. Print statistics
    print_summary_statistics(saved_report["cases"], anom_df)

def print_summary_statistics(cases, anomaly_df):
    total_records = len(anomaly_df)
    total_cases = len(cases)
    
    # Detectors count
    det_counts = {"exact_duplicate": 0, "cost": 0, "near_duplicate": 0, "pattern": 0, "fallback": 0}
    # Levels count
    level_counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    # Related records count
    rel_exact = 0
    rel_susp = 0
    rel_context = 0
    cases_with_related = 0
    
    for c in cases:
        det_counts[c["primary_detector"]] = det_counts.get(c["primary_detector"], 0) + 1
        level_counts[c["investigation_priority_level"]] = level_counts.get(c["investigation_priority_level"], 0) + 1
        
        n_exact = len(c["related_exact_duplicates"])
        n_susp = len(c["related_potentially_suspicious"])
        n_cont = len(c["related_contextual_near_duplicates"])
        
        rel_exact += n_exact
        rel_susp += n_susp
        rel_context += n_cont
        
        if (n_exact + n_susp + n_cont) > 0:
            cases_with_related += 1
            
    print("\n================== STEP 4A SUMMARY STATISTICS ==================")
    print(f"Total input anomaly records: {total_records}")
    print(f"Priority > 0 anomaly records: {len(anomaly_df[anomaly_df['investigation_priority_score'] > 0])}")
    print(f"Investigation cases generated: {total_cases}")
    print("\nPrimary Detector Distribution:")
    for det, count in det_counts.items():
        print(f"  - {det}: {count}")
    print("\nPriority Level Distribution:")
    for lvl, count in level_counts.items():
        print(f"  - {lvl}: {count}")
    print(f"\nRelated exact duplicate relationships: {rel_exact}")
    print(f"Related potentially suspicious relationships: {rel_susp}")
    print(f"Related contextual relationships: {rel_context}")
    print(f"Cases with related record connections: {cases_with_related}")
    
    print("\nTop 10 Ranked Investigation Cases:")
    print("| Rank | Index | MP Name | Work (Shortened) | Amount | Score (Level) | Primary Detector |")
    print("|---|---|---|---|---|---|---|")
    for c in cases[:10]:
        work_short = c["work"][:40] + "..." if len(c["work"]) > 40 else c["work"]
        amt_str = f"INR {c['allocation_amount']:,.0f}" if c["allocation_amount"] is not None else "NaN"
        print(f"| {c['rank']} | {c['record_id']} | {c['mp_name']} | {work_short} | {amt_str} | {c['investigation_priority_score']} ({c['investigation_priority_level']}) | {c['primary_detector']} |")
    print("================================================================\n")

if __name__ == "__main__":
    anomaly_csv = r"data/processed/anomaly_results.csv"
    anomaly_json = r"data/reports/anomaly_results.json"
    dup_pairs_csv = r"data/processed/duplicate_pairs.csv"
    clean_csv = r"data/processed/mplads_clean.csv"
    feat_csv = r"data/processed/mplads_features.csv"
    
    out_csv = r"data/processed/investigation_cases.csv"
    out_json = r"data/reports/investigation_cases.json"
    
    run_investigation_pipeline(anomaly_csv, anomaly_json, dup_pairs_csv, clean_csv, feat_csv, out_csv, out_json)
