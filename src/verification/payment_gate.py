from typing import Dict, Any, List
from src.verification.verification_models import PaymentGateAdvisory

def generate_payment_gate_advisory(case_data: Dict[str, Any]) -> PaymentGateAdvisory:
    """
    Generates advisory action (PROCEED, VERIFY, HOLD_AND_INSPECT) based on priority level.
    Compiles a required next evidence checklist to request for human review.
    """
    priority_level = str(case_data.get("investigation_priority_level", "LOW")).upper()
    cost_anom = bool(case_data.get("cost_anomaly", False))
    exact_anom = bool(case_data.get("exact_duplicate_anomaly", False))
    near_anom = bool(case_data.get("near_duplicate_anomaly", False))
    pattern_anom = bool(case_data.get("pattern_anomaly", False))
    
    # 1. Map priority to recommendation
    if priority_level in ["HIGH", "CRITICAL"]:
        rec = "HOLD_AND_INSPECT"
        reason = "Case exhibits high/critical investigation priority, indicating substantial statistical anomaly profile."
    elif priority_level == "MEDIUM":
        rec = "VERIFY"
        reason = "Case exhibits medium investigation priority. Standard administrative verification recommended before next disbursements."
    else:
        rec = "PROCEED"
        reason = "Case exhibits low investigation priority within normal data parameters."

    # 2. Compile supporting signals for explanation
    supporting_signals = []
    if cost_anom:
        supporting_signals.append("Cost anomaly detector triggered")
    if exact_anom:
        supporting_signals.append("Exact duplicate anomaly detector triggered")
    if near_anom:
        supporting_signals.append("Near-duplicate anomaly detector triggered")
    if pattern_anom:
        supporting_signals.append("Temporal pattern detector triggered")
    supporting_signals.append(f"Priority rating level: {priority_level}")

    # 3. Build required next evidence checklist (items to request from field)
    checklist = []
    
    if rec in ["HOLD_AND_INSPECT", "VERIFY"]:
        # Required core verification audit package
        checklist.append("Official administrative sanction order copy")
        checklist.append("Latest geo-tagged site photographs validating physical construction")
        checklist.append("Measurement Book extract signed by competent authority")
        checklist.append("Implementing agency completion certificate copy")
        
        # Detector-specific documents to request
        if cost_anom:
            checklist.append("Detailed project cost estimate and technical approvals")
            checklist.append("Itemized vendor bills and payment check disbursement receipts")
        if exact_anom or near_anom:
            checklist.append("Project sanction verification documentation matching related ID scopes")
            checklist.append("Implementing agency certification verifying no physical work overlaps")
        if pattern_anom:
            checklist.append("District recommendation date logs and submission timeline audit")
    else:
        # Simple standard audit check for low risk
        checklist.append("Standard administrative sanction order copy")
        checklist.append("Latest site photograph")
        checklist.append("Implementing agency completion certificate")

    return PaymentGateAdvisory(
        recommendation=rec,
        reason=reason,
        supporting_signals=supporting_signals,
        required_next_evidence=checklist
    )
