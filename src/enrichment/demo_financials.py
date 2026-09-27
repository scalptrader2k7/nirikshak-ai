from typing import Dict, Any

def compute_demo_financials(raw: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes financial metrics, utilization rates, and cost overrun signals
    for demonstration lifecycle projects.
    """
    sanctioned = float(raw.get("sanctioned_amount", 0.0) or 0.0)
    approved_est = float(raw.get("approved_estimate", 0.0) or 0.0)
    revised_est = float(raw.get("revised_estimate", approved_est) or approved_est)
    released = float(raw.get("funds_released", 0.0) or 0.0)
    expenditure = float(raw.get("expenditure_amount", 0.0) or 0.0)

    # Remaining unspent balance from released funds
    remaining_balance = round(max(0.0, released - expenditure), 2)

    # Fund utilization % (relative to funds released)
    if released > 0:
        utilization_percent = round((expenditure / released) * 100.0, 2)
    else:
        utilization_percent = 0.0

    # Cost overrun (revised estimate vs approved estimate)
    cost_overrun_amount = round(max(0.0, revised_est - approved_est), 2)
    if approved_est > 0 and revised_est > approved_est:
        cost_overrun_percent = round(((revised_est - approved_est) / approved_est) * 100.0, 2)
        cost_overrun_status = "OVERRUN"
    else:
        cost_overrun_percent = 0.0
        cost_overrun_status = "WITHIN_ESTIMATE"

    # Health classification
    if released > 0 and expenditure == 0:
        financial_status = "UNSPENT_FUNDS_STALLED"
    elif cost_overrun_percent > 10.0:
        financial_status = "BUDGET_OVERRUN_DETECTED"
    elif utilization_percent >= 80.0:
        financial_status = "HEALTHY_HIGH_UTILIZATION"
    else:
        financial_status = "NORMAL_PROGRESSION"

    return {
        "sanctioned_amount": sanctioned,
        "approved_estimate": approved_est,
        "revised_estimate": revised_est,
        "funds_released": released,
        "expenditure_amount": expenditure,
        "remaining_balance": remaining_balance,
        "utilization_percent": utilization_percent,
        "cost_overrun_amount": cost_overrun_amount,
        "cost_overrun_percent": cost_overrun_percent,
        "cost_overrun_status": cost_overrun_status,
        "financial_status": financial_status
    }
