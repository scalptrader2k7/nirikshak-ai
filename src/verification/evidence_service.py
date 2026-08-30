from datetime import datetime
from typing import List, Dict, Any, Optional
from src.verification.verification_models import (
    EvidenceItem,
    REFERENCE_DATE,
    FRESHNESS_FRESH_DAYS,
    FRESHNESS_AGING_DAYS
)

def calculate_freshness(rec_date_str: Optional[str], ref_date_str: str = REFERENCE_DATE) -> Dict[str, Any]:
    """
    Calculates evidence age and classifies freshness:
    fresh (<= 7 days), aging (7 to 30 days), stale (> 30 days), or not_available.
    """
    if not rec_date_str or rec_date_str.strip() == "":
        return {"age_days": None, "classification": "not_available"}
    
    try:
        ref_dt = datetime.strptime(ref_date_str, "%Y-%m-%d")
        rec_dt = datetime.strptime(rec_date_str, "%Y-%m-%d")
        age_days = (ref_dt - rec_dt).days
        
        # Clamp age to positive value or allow negative in case of future dates
        if age_days < 0:
            age_days = 0
            
        if age_days <= FRESHNESS_FRESH_DAYS:
            classification = "fresh"
        elif age_days <= FRESHNESS_AGING_DAYS:
            classification = "aging"
        else:
            classification = "stale"
            
        return {"age_days": age_days, "classification": classification}
    except Exception:
        return {"age_days": None, "classification": "not_available"}

def get_evidence_summary(case_data: Dict[str, Any], peer_stats: Dict[str, Any]) -> List[EvidenceItem]:
    """
    Classifies all available, derived, and missing/stale evidence for an investigation case.
    """
    evidence_items = []
    
    # 1. AVAILABLE Evidence
    # Allocation Amount
    amt = case_data.get("allocation_amount")
    evidence_items.append(EvidenceItem(
        evidence_type="allocation_amount",
        status="available" if amt is not None else "missing",
        value=amt,
        unit="INR",
        source="mplads_clean.csv",
        explanation=f"Project allocation amount of INR {amt:,.0f} is available" if amt is not None else "Allocation amount is missing",
        confidence=1.0
    ))
    
    # MP Name
    mp = case_data.get("mp_name")
    evidence_items.append(EvidenceItem(
        evidence_type="mp_name",
        status="available" if mp else "missing",
        value=mp,
        unit="text",
        source="mplads_clean.csv",
        explanation=f"Member of Parliament is recorded as '{mp}'" if mp else "MP Name is missing",
        confidence=1.0
    ))
    
    # State & Constituency
    state = case_data.get("state")
    constituency = case_data.get("constituency")
    evidence_items.append(EvidenceItem(
        evidence_type="location",
        status="available" if state and constituency else "missing",
        value={"state": state, "constituency": constituency} if state or constituency else None,
        unit="text",
        source="mplads_clean.csv",
        explanation=f"Located in State: '{state}', Constituency: '{constituency}'" if state and constituency else "Location information is incomplete",
        confidence=1.0
    ))
    
    # Recommended Date (includes Freshness check)
    rec_date = case_data.get("recommended_date")
    freshness = calculate_freshness(rec_date)
    age_suffix = f" (age: {freshness['age_days']} days, classification: {freshness['classification']})" if freshness['age_days'] is not None else ""
    evidence_items.append(EvidenceItem(
        evidence_type="recommended_date",
        status="available" if rec_date else "missing",
        value=rec_date,
        unit="date",
        source="mplads_clean.csv",
        explanation=f"Project recommended date is {rec_date}{age_suffix}" if rec_date else "Recommendation date is missing",
        confidence=1.0
    ))
    
    # Work Type
    w_type = case_data.get("work_type")
    evidence_items.append(EvidenceItem(
        evidence_type="work_type",
        status="available" if w_type else "missing",
        value=w_type,
        unit="text",
        source="mplads_features.csv",
        explanation=f"Work category classified as '{w_type}'" if w_type else "Work type category is missing",
        confidence=0.9
    ))
    
    # Work description
    work = case_data.get("work")
    evidence_items.append(EvidenceItem(
        evidence_type="work_description",
        status="available" if work else "missing",
        value=work,
        unit="text",
        source="mplads_clean.csv",
        explanation="Original work description is available" if work else "Work description is missing",
        confidence=1.0
    ))

    # 2. DERIVED Evidence
    # Peer Group Stats
    peer_status = peer_stats.get("status", "insufficient_data")
    peer_count = peer_stats.get("peer_count")
    evidence_items.append(EvidenceItem(
        evidence_type="peer_comparison_count",
        status="derived",
        value=peer_count,
        unit="count",
        source="peer_benchmark.py",
        explanation=f"Identified {peer_count} peers in reference comparison group (status: {peer_status})" if peer_count is not None else "Insufficient comparable peers available",
        confidence=0.95
    ))
    
    # Amount Ratio
    ratio = peer_stats.get("amount_ratio_to_median")
    evidence_items.append(EvidenceItem(
        evidence_type="peer_amount_ratio",
        status="derived" if ratio is not None else "missing",
        value=ratio,
        unit="ratio",
        source="peer_benchmark.py",
        explanation=f"Ratio of project amount to median peer amount is {ratio:.2f}" if ratio is not None else "Amount ratio calculation is unavailable",
        confidence=0.95
    ))

    # Investigation Priority Level
    priority_level = case_data.get("investigation_priority_level", "LOW")
    priority_score = case_data.get("investigation_priority_score", 0.0)
    evidence_items.append(EvidenceItem(
        evidence_type="priority_scoring",
        status="derived",
        value={"level": priority_level, "score": priority_score},
        unit="score",
        source="investigation_cases.json",
        explanation=f"Investigation priority level is {priority_level} (score: {priority_score:.1f})",
        confidence=1.0
    ))

    # Active Detectors list
    active_detectors = []
    if case_data.get("cost_anomaly"): active_detectors.append("cost")
    if case_data.get("exact_duplicate_anomaly"): active_detectors.append("exact_duplicate")
    if case_data.get("near_duplicate_anomaly"): active_detectors.append("near_duplicate")
    if case_data.get("pattern_anomaly"): active_detectors.append("pattern")
    evidence_items.append(EvidenceItem(
        evidence_type="detector_triggers",
        status="derived",
        value=active_detectors,
        unit="list",
        source="investigation_cases.json",
        explanation=f"Active detectors triggered: {', '.join(active_detectors)}" if active_detectors else "No anomaly detectors triggered",
        confidence=1.0
    ))

    # 3. MISSING Evidence (Explicitly flagged as unavailable in dataset)
    missing_fields = [
        ("vendor_name", "Vendor information is not captured in the current public database"),
        ("site_photograph", "Physical progress site photographs are not linked in the current schema"),
        ("measurement_book_extract", "Audited engineering Measurement Book logs are missing"),
        ("sanction_order", "Official administrative project sanction order document is unavailable"),
        ("payment_details", "Bank transaction details and check disbursements are not available"),
        ("physical_progress", "Physical construction progress percentage is not available"),
        ("fund_utilization", "Actual fund utilization percentage is not available")
    ]
    
    for field_type, desc in missing_fields:
        evidence_items.append(EvidenceItem(
            evidence_type=field_type,
            status="not_available_in_current_dataset",
            value=None,
            unit="none",
            source="external",
            explanation=desc,
            confidence=1.0
        ))
        
    return evidence_items
