import pandas as pd
from src.investigation.evidence_formatter import format_evidence_item

SEVERITY_MAP = {
    "critical": 4,
    "high": 3,
    "medium": 2,
    "low": 1
}

DETECTOR_MAP = {
    "exact_duplicate": 4,
    "cost": 3,
    "near_duplicate": 2,
    "pattern": 1
}

def get_primary_evidence(evidence_list):
    """
    Determines the primary evidence item based on severity and detector hierarchy.
    """
    if not evidence_list:
        return None
        
    def score_evidence(ev):
        sev = str(ev.get("severity", "")).lower()
        det = str(ev.get("detector", "")).lower()
        
        sev_score = SEVERITY_MAP.get(sev, 0)
        det_score = DETECTOR_MAP.get(det, 0)
        
        return (sev_score, det_score)
        
    # Sort descending
    sorted_ev = sorted(evidence_list, key=score_evidence, reverse=True)
    return sorted_ev[0]

def get_case_title(primary_detector):
    """
    Generates a deterministic title based on the primary detector.
    """
    det = str(primary_detector).lower()
    if det == "exact_duplicate":
        return "Repeated Project Record Requires Review"
    elif det == "cost":
        return "High-Cost Allocation Requires Review"
    elif det == "near_duplicate":
        return "Potentially Suspicious Project Similarity"
    elif det == "pattern":
        return "Unusual Recommendation Pattern"
    else:
        return "Anomaly Flagged for Review"

def get_case_summary(primary_ev, evidence_count):
    """
    Generates a concise case summary explaining the primary indicator.
    """
    if not primary_ev:
        return ""
        
    formatted_msg = format_evidence_item(primary_ev)
    # Lowercase the first letter for natural grammar flow in the summary sentence
    if formatted_msg and len(formatted_msg) > 0 and formatted_msg[0].isupper():
        formatted_msg = formatted_msg[0].lower() + formatted_msg[1:]
        
    return f"This project was flagged for review because {formatted_msg} It triggered {evidence_count} total indicator(s)."
