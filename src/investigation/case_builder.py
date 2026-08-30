import pandas as pd
import numpy as np
from src.investigation.risk_explainer import get_primary_evidence, get_case_title, get_case_summary
from src.investigation.evidence_formatter import format_evidence_item

# Severity score mapping for sorting
SEVERITY_SCORES_MAP = {
    "critical": 4,
    "high": 3,
    "medium": 2,
    "low": 1,
    "none": 0
}

def extract_related_exact_duplicates(idx, clean_df):
    """
    Identifies other records belonging to the same exact duplicate group.
    """
    row_data = clean_df[clean_df["original_row_index"] == idx].iloc[0]
    group_id = row_data.get("exact_duplicate_group_id")
    dup_count = row_data.get("duplicate_occurrence_count")
    
    related = []
    if pd.notnull(group_id) and group_id != "" and pd.notnull(dup_count) and int(dup_count) > 1:
        # Find matches sharing the same group_id but excluding current record index
        matches = clean_df[(clean_df["exact_duplicate_group_id"] == group_id) & (clean_df["original_row_index"] != idx)]
        for _, match_row in matches.iterrows():
            related.append({
                "record_id": int(match_row["original_row_index"]),
                "mp_name": match_row["mp_name"],
                "allocation_amount": float(match_row["allocation_amount"]) if pd.notnull(match_row["allocation_amount"]) else None,
                "recommended_date": match_row["recommended_date"] if pd.notnull(match_row["recommended_date"]) else None
            })
    return related

def extract_related_near_duplicates(idx, duplicate_pairs_df, target_pair_type):
    """
    Identifies matching near-duplicate relationships by pair_type.
    """
    if len(duplicate_pairs_df) == 0:
        return []
        
    mask = ((duplicate_pairs_df["record_a"] == idx) | (duplicate_pairs_df["record_b"] == idx)) & \
           (duplicate_pairs_df["pair_type"] == target_pair_type)
    matches = duplicate_pairs_df[mask]
    
    related = []
    for _, pair_row in matches.iterrows():
        other_idx = int(pair_row["record_b"] if pair_row["record_a"] == idx else pair_row["record_a"])
        related.append({
            "record_id": other_idx,
            "text_similarity": float(pair_row["text_similarity"]) if pd.notnull(pair_row["text_similarity"]) else None,
            "location_similarity": float(pair_row["location_similarity"]) if pd.notnull(pair_row["location_similarity"]) else None,
            "amount_ratio": float(pair_row["amount_ratio"]) if pd.notnull(pair_row["amount_ratio"]) else None,
            "date_gap_days": float(pair_row["date_gap_days"]) if pd.notnull(pair_row["date_gap_days"]) else None,
            "near_duplicate_context_score": float(pair_row["near_duplicate_context_score"]) if pd.notnull(pair_row["near_duplicate_context_score"]) else None,
            "pair_type": str(pair_row["pair_type"])
        })
    return related

def build_investigation_cases(anomaly_df, clean_df, features_df, duplicate_pairs_df, evidence_json_dict):
    """
    Builds structured investigation cases from anomaly outputs.
    Only processes records with investigation_priority_score > 0.
    """
    # 1. Map evidence by index
    evidence_by_idx = {}
    for res in evidence_json_dict.get("results", []):
        evidence_by_idx[int(res["original_row_index"])] = res["evidence"]
        
    # Filter flagged records
    flagged_df = anomaly_df[anomaly_df["investigation_priority_score"] > 0].copy()
    
    cases = []
    
    for _, row in flagged_df.iterrows():
        idx = int(row["original_row_index"])
        priority_score = float(row["investigation_priority_score"])
        priority_level = str(row["investigation_priority_level"])
        
        # Load features row to retrieve work_type
        feat_row = features_df[features_df["original_row_index"] == idx].iloc[0]
        work_type = str(feat_row.get("work_type", "other"))
        
        # Original clean fields
        clean_row = clean_df[clean_df["original_row_index"] == idx].iloc[0]
        
        # Retrieve evidence
        raw_evidence_list = evidence_by_idx.get(idx, [])
        evidence_count = len(raw_evidence_list)
        
        # Format each evidence item
        formatted_evidence = []
        for ev in raw_evidence_list:
            ev_formatted = ev.copy()
            ev_formatted["formatted_message"] = format_evidence_item(ev)
            formatted_evidence.append(ev_formatted)
            
        # Determine primary evidence using hierarchy
        primary_ev = get_primary_evidence(formatted_evidence)
        
        if primary_ev:
            primary_detector = str(primary_ev["detector"])
            primary_signal = str(primary_ev["signal"])
            highest_severity = str(primary_ev["severity"])
            highest_severity_score = int(SEVERITY_SCORES_MAP.get(highest_severity, 0))
        else:
            primary_detector = "fallback"
            primary_signal = ""
            highest_severity = "none"
            highest_severity_score = 0
            
        # Title and Summary
        title = get_case_title(primary_detector)
        summary = get_case_summary(primary_ev, evidence_count)
        disclaimer = "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."
        
        # Related records
        related_exact = extract_related_exact_duplicates(idx, clean_df)
        related_suspicious = extract_related_near_duplicates(idx, duplicate_pairs_df, "potentially_suspicious")
        related_contextual = extract_related_near_duplicates(idx, duplicate_pairs_df, "contextual_near_duplicate")
        
        case = {
            "record_id": idx,
            "mp_name": clean_row["mp_name"] if pd.notnull(clean_row["mp_name"]) else None,
            "house": clean_row["house"] if pd.notnull(clean_row["house"]) else None,
            "state": clean_row["state"] if pd.notnull(clean_row["state"]) else None,
            "constituency": clean_row["constituency"] if pd.notnull(clean_row["constituency"]) else None,
            "city": clean_row["city"] if pd.notnull(clean_row["city"]) else None,
            "ward": clean_row["ward"] if pd.notnull(clean_row["ward"]) else None,
            "block": clean_row["block"] if pd.notnull(clean_row["block"]) else None,
            "village": clean_row["village"] if pd.notnull(clean_row["village"]) else None,
            "recommended_date": clean_row["recommended_date"] if pd.notnull(clean_row["recommended_date"]) else None,
            "work": clean_row["work"] if pd.notnull(clean_row["work"]) else None,
            "work_type": work_type,
            "allocation_amount": float(clean_row["allocation_amount"]) if pd.notnull(clean_row["allocation_amount"]) else None,
            
            "investigation_priority_score": priority_score,
            "investigation_priority_level": priority_level,
            "case_status": "OPEN",
            
            "cost_anomaly": bool(row["cost_anomaly"]),
            "exact_duplicate_anomaly": bool(row["exact_duplicate_anomaly"]),
            "near_duplicate_anomaly": bool(row["near_duplicate_anomaly"]),
            "pattern_anomaly": bool(row["pattern_anomaly"]),
            
            "primary_detector": primary_detector,
            "primary_signal": primary_signal,
            "highest_severity": highest_severity,
            "highest_severity_score": highest_severity_score,
            
            "title": title,
            "summary": summary,
            "disclaimer": disclaimer,
            
            "evidence_count": evidence_count,
            "evidence": formatted_evidence,
            
            "related_exact_duplicates": related_exact,
            "related_potentially_suspicious": related_suspicious,
            "related_contextual_near_duplicates": related_contextual
        }
        
        cases.append(case)
        
    return cases
