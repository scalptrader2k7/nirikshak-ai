import pandas as pd
from src.anomaly_detection.config import (
    DUP_SEVERITY_WEAK_THRESHOLD,
    DUP_SEVERITY_MEDIUM_THRESHOLD,
    DUP_SEVERITY_HIGH_THRESHOLD,
    DUP_SEVERITY_CRITICAL_THRESHOLD
)
from src.anomaly_detection.evidence import create_evidence

def get_duplicate_severity(occurrence_count):
    if occurrence_count >= DUP_SEVERITY_CRITICAL_THRESHOLD:
        return "critical"
    elif occurrence_count >= DUP_SEVERITY_HIGH_THRESHOLD:
        return "high"
    elif occurrence_count >= DUP_SEVERITY_MEDIUM_THRESHOLD:
        return "medium"
    elif occurrence_count >= DUP_SEVERITY_WEAK_THRESHOLD:
        return "low"
    else:
        return "none"

def detect_exact_duplicates(df):
    """
    Checks exact duplicate features and returns:
    1. A list of list of evidence dictionaries (one list per row).
    2. A boolean mask indicating if an exact duplicate anomaly is triggered.
    """
    evidence_list = []
    anomaly_triggered = []
    
    for i in range(len(df)):
        row_evidence = []
        is_dup = df.loc[i, "is_exact_duplicate"]
        count = df.loc[i, "duplicate_occurrence_count"]
        group_id = df.loc[i, "exact_duplicate_group_id"]
        
        # Only trigger for duplicates (count > 1)
        if is_dup and count > 1:
            severity = get_duplicate_severity(count)
            row_evidence.append(create_evidence(
                detector="exact_duplicate",
                signal="duplicate_occurrence_count",
                severity=severity,
                message=f"Exact duplicate detected. This record occurs {count} times in the dataset.",
                value=count,
                reference_value=group_id,
                unit="occurrences"
            ))
            
        evidence_list.append(row_evidence)
        anomaly_triggered.append(len(row_evidence) > 0)
        
    return evidence_list, anomaly_triggered
