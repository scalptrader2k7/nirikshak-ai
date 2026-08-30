import os
import json
import pandas as pd
from datetime import datetime

def rank_and_sort_cases(cases):
    """
    Sorts investigation cases deterministically using:
    1. investigation_priority_score (descending)
    2. highest_severity_score (descending)
    3. allocation_amount (descending, NaNs treated as -1)
    4. record_id (ascending)
    Then assigns 1-indexed ranks.
    """
    def sorting_key(c):
        score = c["investigation_priority_score"]
        sev_score = c["highest_severity_score"]
        amount = c["allocation_amount"] if c["allocation_amount"] is not None else -1.0
        rec_id = c["record_id"]
        
        # We negate descending numeric criteria for sorting ascending in python sorted()
        # or we sort directly. We can use a custom sorting tuple:
        # (-score, -sev_score, -amount, rec_id)
        return (-score, -sev_score, -amount, rec_id)
        
    sorted_cases = sorted(cases, key=sorting_key)
    
    # Assign ranks
    for rank_idx, case in enumerate(sorted_cases):
        case["rank"] = rank_idx + 1
        
    return sorted_cases

def export_cases_to_files(cases, csv_path, json_path):
    """
    Exports cases to CSV (flat with JSON strings for nested lists) and JSON (full nested).
    """
    # 1. Rank and sort
    ranked_cases = rank_and_sort_cases(cases)
    
    # 2. Export JSON
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    
    levels = [c["investigation_priority_level"] for c in ranked_cases]
    level_dist = {
        "LOW": levels.count("LOW"),
        "MEDIUM": levels.count("MEDIUM"),
        "HIGH": levels.count("HIGH"),
        "CRITICAL": levels.count("CRITICAL")
    }
    
    json_output = {
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "total_cases": len(ranked_cases),
            "priority_level_distribution": level_dist
        },
        "cases": ranked_cases
    }
    
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(json_output, f, indent=2)
    print(f"Wrote structured investigation cases JSON to {json_path}")
    
    # 3. Export CSV (flat representation)
    flat_cases = []
    for c in ranked_cases:
        c_flat = c.copy()
        # JSON serialize nested objects for CSV
        c_flat["evidence"] = json.dumps(c["evidence"])
        c_flat["related_exact_duplicates"] = json.dumps(c["related_exact_duplicates"])
        c_flat["related_potentially_suspicious"] = json.dumps(c["related_potentially_suspicious"])
        c_flat["related_contextual_near_duplicates"] = json.dumps(c["related_contextual_near_duplicates"])
        flat_cases.append(c_flat)
        
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    df = pd.DataFrame(flat_cases)
    
    # Ensure rank is the first column in the CSV
    cols = ["rank"] + [col for col in df.columns if col != "rank"]
    df = df[cols]
    
    df.to_csv(csv_path, index=False)
    print(f"Wrote flat investigation cases CSV to {csv_path}")
    
    return len(ranked_cases)
