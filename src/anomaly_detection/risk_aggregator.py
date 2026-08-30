import pandas as pd
from src.anomaly_detection.config import (
    WEIGHT_COST,
    WEIGHT_EXACT_DUPLICATE,
    WEIGHT_NEAR_DUPLICATE,
    WEIGHT_PATTERN
)

SEVERITY_SCORES = {
    "low": 0.2,
    "medium": 0.4,
    "high": 0.7,
    "critical": 1.0,
    "none": 0.0
}

def get_priority_level(score):
    if score >= 81:
        return "CRITICAL"
    elif score >= 51:
        return "HIGH"
    elif score >= 21:
        return "MEDIUM"
    else:
        return "LOW"

def aggregate_risk_scores(df, cost_ev, exact_ev, near_ev, pattern_ev):
    """
    Combines evidence from all detectors to compute the Investigation Priority Score
    and Review Priority Level.
    
    Adjustments applied:
    - Retains ALL evidence items while taking the max severity per detector category for scoring.
    - Configurable weights are documented.
    - Relabeled levels as Review Priorities.
    """
    priority_scores = []
    priority_levels = []
    primary_reasons = []
    evidence_counts = []
    combined_evidences = []
    
    for idx in range(len(df)):
        # Collect all evidence items for this record
        row_ev = cost_ev[idx] + exact_ev[idx] + near_ev[idx] + pattern_ev[idx]
        combined_evidences.append(row_ev)
        evidence_counts.append(len(row_ev))
        
        # Calculate max severity score per detector
        max_cost = 0.0
        max_exact = 0.0
        max_near = 0.0
        max_pattern = 0.0
        
        highest_severity_val = 0.0
        primary_msg = "No anomalies detected."
        
        for ev in row_ev:
            det = ev["detector"]
            sev = ev["severity"]
            score_val = SEVERITY_SCORES.get(sev, 0.0)
            
            if det == "cost":
                max_cost = max(max_cost, score_val)
            elif det == "exact_duplicate":
                max_exact = max(max_exact, score_val)
            elif det == "near_duplicate":
                max_near = max(max_near, score_val)
            elif det == "pattern":
                max_pattern = max(max_pattern, score_val)
                
            # Track highest overall severity message for primary reason
            if score_val > highest_severity_val:
                highest_severity_val = score_val
                primary_msg = ev["message"]
                
        # Calculate weighted sum
        weighted_score = (
            WEIGHT_COST * max_cost +
            WEIGHT_EXACT_DUPLICATE * max_exact +
            WEIGHT_NEAR_DUPLICATE * max_near +
            WEIGHT_PATTERN * max_pattern
        )
        
        # Scaling score to 0-100
        score_100 = round(weighted_score * 100, 1)
        level = get_priority_level(score_100)
        
        priority_scores.append(score_100)
        priority_levels.append(level)
        primary_reasons.append(primary_msg if len(row_ev) > 0 else "")
        
    agg_results = pd.DataFrame({
        "investigation_priority_score": priority_scores,
        "investigation_priority_level": priority_levels,
        "primary_reason": primary_reasons,
        "evidence_count": evidence_counts
    })
    
    return agg_results, combined_evidences
