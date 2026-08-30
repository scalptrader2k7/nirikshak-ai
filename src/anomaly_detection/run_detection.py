import os
import json
import pandas as pd
import numpy as np
from datetime import datetime

from src.anomaly_detection.cost_detector import detect_cost_anomalies
from src.anomaly_detection.exact_duplicate_detector import detect_exact_duplicates
from src.anomaly_detection.near_duplicate_detector import detect_near_duplicates
from src.anomaly_detection.pattern_detector import detect_pattern_anomalies
from src.anomaly_detection.risk_aggregator import aggregate_risk_scores

def compute_similarity_diagnostics(pairs):
    """
    Computes and prints similarity-distribution diagnostics for the inspected text pairs.
    """
    if not pairs:
        print("No near-duplicate pairs detected.")
        return
        
    sims = [p["text_similarity"] for p in pairs]
    sim_series = pd.Series(sims)
    
    print("\n=== Similarity Distribution Diagnostics (Excluding Exact Duplicates) ===")
    print(sim_series.describe(percentiles=[0.5, 0.75, 0.9, 0.95, 0.99]))
    
    thresholds = [0.70, 0.80, 0.85, 0.90, 0.95]
    print("\nPair count exceeding thresholds:")
    for t in thresholds:
        count = sum(1 for s in sims if s >= t)
        print(f"  Similarity >= {t:.2f}: {count} pairs")
    print("=======================================================================\n")

def run_detection_pipeline(features_path, anomaly_csv_path, anomaly_json_path, duplicate_pairs_csv_path):
    print(f"Reading features data from {features_path}...")
    df = pd.read_csv(features_path)
    n_records = len(df)
    
    # 1. Cost anomalies
    print("Running Cost Anomaly Detector...")
    cost_ev, cost_trig = detect_cost_anomalies(df)
    
    # 2. Exact duplicates
    print("Running Exact Duplicate Detector...")
    exact_ev, exact_trig = detect_exact_duplicates(df)
    
    # 3. Near duplicates
    print("Running Near-Duplicate Detector (TF-IDF)...")
    # By default, use blocking to optimize pairs matching, but run E2E
    near_ev, near_trig, duplicate_pairs = detect_near_duplicates(df)
    
    # Run similarity diagnostics printout
    compute_similarity_diagnostics(duplicate_pairs)
    
    # 4. Pattern anomalies
    print("Running Pattern Anomaly Detector...")
    pattern_ev, pattern_trig, (mp_thresh, const_thresh) = detect_pattern_anomalies(df)
    
    # 5. Risk Aggregation
    print("Aggregating Risk Scores...")
    agg_df, combined_evidences = aggregate_risk_scores(df, cost_ev, exact_ev, near_ev, pattern_ev)
    
    # 6. Construct outputs
    # Tabular Results CSV
    source_fields = ["original_row_index", "mp_name", "work", "category", "state", "constituency", "ida", "recommended_date", "allocation_amount", "status", "house"]
    output_df = df[source_fields].copy()
    
    # Append results
    output_df["investigation_priority_score"] = agg_df["investigation_priority_score"]
    output_df["investigation_priority_level"] = agg_df["investigation_priority_level"]
    output_df["primary_reason"] = agg_df["primary_reason"]
    output_df["evidence_count"] = agg_df["evidence_count"]
    
    output_df["cost_anomaly"] = cost_trig
    output_df["exact_duplicate_anomaly"] = exact_trig
    output_df["near_duplicate_anomaly"] = near_trig
    output_df["pattern_anomaly"] = pattern_trig
    
    # Save CSV Results
    os.makedirs(os.path.dirname(anomaly_csv_path), exist_ok=True)
    output_df.to_csv(anomaly_csv_path, index=False)
    print(f"Wrote tabular anomaly results to {anomaly_csv_path}")
    
    # Save Duplicate Pairs CSV
    os.makedirs(os.path.dirname(duplicate_pairs_csv_path), exist_ok=True)
    pairs_df = pd.DataFrame(duplicate_pairs)
    if len(pairs_df) > 0:
        pairs_df = pairs_df.sort_values(by=["record_a", "record_b"]).reset_index(drop=True)
    else:
        default_cols = [
            "record_a", "record_b", "text_similarity", "work_template_frequency_a",
            "work_template_frequency_b", "same_state", "same_constituency", "same_block",
            "same_village", "same_city", "same_ward", "location_similarity",
            "same_work_type", "amount_ratio", "same_mp", "different_mp", "date_gap_days",
            "near_duplicate_context_score", "pair_type", "evidence"
        ]
        pairs_df = pd.DataFrame(columns=default_cols)
    pairs_df.to_csv(duplicate_pairs_csv_path, index=False)
    print(f"Wrote duplicate pairs to {duplicate_pairs_csv_path}")
    
    # Machine Readable JSON
    json_results = []
    for idx in range(n_records):
        # We only log records in the JSON report if they triggered at least 1 evidence item
        if len(combined_evidences[idx]) > 0:
            json_results.append({
                "original_row_index": int(df.loc[idx, "original_row_index"]),
                "mp_name": df.loc[idx, "mp_name"],
                "work": df.loc[idx, "work"],
                "allocation_amount": float(df.loc[idx, "allocation_amount"]) if pd.notnull(df.loc[idx, "allocation_amount"]) else None,
                "investigation_priority_score": float(agg_df.loc[idx, "investigation_priority_score"]),
                "investigation_priority_level": agg_df.loc[idx, "investigation_priority_level"],
                "primary_reason": agg_df.loc[idx, "primary_reason"],
                "evidence_count": int(agg_df.loc[idx, "evidence_count"]),
                "evidence": combined_evidences[idx]
            })
            
    json_report = {
        "timestamp": datetime.now().isoformat(),
        "total_analyzed": n_records,
        "total_flagged": len(json_results),
        "results": json_results
    }
    
    os.makedirs(os.path.dirname(anomaly_json_path), exist_ok=True)
    with open(anomaly_json_path, "w", encoding="utf-8") as f:
        json.dump(json_report, f, indent=2)
    print(f"Wrote machine-readable JSON report to {anomaly_json_path}")
    
    # Calculate statistics for final summary report
    flagged_df = output_df[output_df["evidence_count"] > 0]
    total_flagged = len(flagged_df)
    
    print("\n=== PIPELINE EXECUTION SUCCESSFUL ===")
    print(f"Total analyzed: {n_records}")
    print(f"Total flagged (investigation priority > 0): {total_flagged}")
    print("Level Distribution:")
    print(output_df["investigation_priority_level"].value_counts())
    print("Anomaly triggers:")
    print(f"  Cost Anomalies: {sum(cost_trig)}")
    print(f"  Exact Duplicates: {sum(exact_trig)}")
    print(f"  Near Duplicates (Records with matches): {sum(near_trig)}")
    print(f"  Pattern Anomalies: {sum(pattern_trig)}")
    print("=====================================\n")

if __name__ == "__main__":
    feat_path = r"c:\Users\G.VEDAVYAS\Documents\nirikshak\data\processed\mplads_features.csv"
    anom_csv = r"c:\Users\G.VEDAVYAS\Documents\nirikshak\data\processed\anomaly_results.csv"
    anom_json = r"c:\Users\G.VEDAVYAS\Documents\nirikshak\data\reports\anomaly_results.json"
    dup_pairs = r"c:\Users\G.VEDAVYAS\Documents\nirikshak\data\processed\duplicate_pairs.csv"
    
    run_feature_engineering_pipeline = False # handled separately
    run_detection_pipeline(feat_path, anom_csv, anom_json, dup_pairs)
