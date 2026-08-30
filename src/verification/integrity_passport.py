from typing import Dict, Any, List
from src.verification.verification_models import IntegrityPassport, COST_DEVIATION_HIGH_LIMIT
from src.verification.evidence_service import calculate_freshness

def generate_integrity_passport(
    case_data: Dict[str, Any],
    peer_stats: Dict[str, Any]
) -> IntegrityPassport:
    """
    Generates a deterministic IntegrityPassport summary based on existing case data and peer stats.
    """
    priority_score = float(case_data.get("investigation_priority_score", 0.0))
    priority_level = str(case_data.get("investigation_priority_level", "LOW")).upper()
    
    # 1. Calculate integrity score
    integrity_score = 100.0 - priority_score
    integrity_score = max(0.0, min(100.0, integrity_score))
    
    # 2. Map priority levels to RED, AMBER, GREEN
    if priority_level in ["HIGH", "CRITICAL"]:
        integrity_status = "RED"
    elif priority_level == "MEDIUM":
        integrity_status = "AMBER"
    else:
        integrity_status = "GREEN"
        
    positive_signals = []
    risk_signals = []
    data_limitations = []
    
    # 3. Assess positive / risk signals based on anomaly columns
    cost_anom = bool(case_data.get("cost_anomaly", False))
    exact_anom = bool(case_data.get("exact_duplicate_anomaly", False))
    near_anom = bool(case_data.get("near_duplicate_anomaly", False))
    pattern_anom = bool(case_data.get("pattern_anomaly", False))
    
    signal_count = sum([cost_anom, exact_anom, near_anom, pattern_anom])
    
    # Cost Signals
    dev = peer_stats.get("amount_deviation_percent")
    if cost_anom:
        msg = "Cost outlier detected"
        if dev is not None:
            msg += f" ({dev:+.1f}% deviation from peer median)"
        risk_signals.append(msg)
    else:
        if dev is not None and abs(dev) < COST_DEVIATION_HIGH_LIMIT:
            positive_signals.append(f"Budget allocation is within normal peer range ({dev:+.1f}% deviation)")
        else:
            positive_signals.append("No cost anomaly detected")
            
    # Exact Duplicate Signals
    if exact_anom:
        # Try to find exact duplicate count in evidence
        dup_count = None
        for ev in case_data.get("evidence", []):
            if ev.get("detector") == "exact_duplicate" and ev.get("value") is not None:
                dup_count = int(ev["value"])
        if dup_count:
            risk_signals.append(f"Exact duplicate record group: appears {dup_count} times in dataset")
        else:
            risk_signals.append("Exact duplicate record pattern detected")
    else:
        positive_signals.append("Record description is unique (no exact duplicates)")
        
    # Near Duplicate & Pattern Signals
    if near_anom:
        risk_signals.append("Suspicious textual similarity detected with related work records")
    else:
        positive_signals.append("No suspicious near-duplicate similarity detected")
        
    if pattern_anom:
        risk_signals.append("Temporal cluster burst: records recommended in a narrow time window")
    else:
        positive_signals.append("No suspicious recommendation time clusters detected")
        
    # Priority Risk Signal
    if priority_level in ["HIGH", "CRITICAL"]:
        risk_signals.append(f"Elevated risk score (priority level: {priority_level})")
        
    # 4. Compile Data Limitations (incorporate freshness checks)
    data_limitations.append("Physical progress percentage is unavailable in current public spending dataset")
    data_limitations.append("Fund utilization percentage is unavailable in current public spending dataset")
    data_limitations.append("Audit transaction payment details and vendor identity records are missing")
    
    rec_date = case_data.get("recommended_date")
    freshness = calculate_freshness(rec_date)
    if freshness["classification"] == "stale":
        data_limitations.append(f"Audit date is stale (recommended {rec_date}, age {freshness['age_days']} days)")
    elif freshness["classification"] == "aging":
        data_limitations.append(f"Audit date is aging (recommended {rec_date}, age {freshness['age_days']} days)")
        
    # 5. Formulate Neutral Explanation
    explanation_parts = [
        f"Integrity Passport status is {integrity_status} (score: {integrity_score:.1f})."
    ]
    if risk_signals:
        explanation_parts.append(f"Triggers {len(risk_signals)} risk indicator(s): {'; '.join(risk_signals)}.")
    else:
        explanation_parts.append("No major risk indicators triggered.")
        
    if integrity_status == "RED":
        explanation_parts.append("RED status indicates that available indicators justify increased human verification and does not establish wrongdoing or corruption.")
    elif integrity_status == "AMBER":
        explanation_parts.append("AMBER status indicates moderate risk signals warranting standard administrative verification.")
    else:
        explanation_parts.append("GREEN status indicates low risk profile within normal data parameters.")
        
    explanation = " ".join(explanation_parts)
    
    return IntegrityPassport(
        integrity_status=integrity_status,
        integrity_score=integrity_score,
        signal_count=signal_count,
        positive_signals=positive_signals,
        risk_signals=risk_signals,
        data_limitations=data_limitations,
        explanation=explanation
    )
