from typing import Dict, Any, Optional
from datetime import datetime, date, timedelta

# Reference date for static evaluation of synthetic progress timeline
REFERENCE_EVAL_DATE = date(2024, 6, 15)

def compute_demo_progress(raw: Dict[str, Any], financials: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes physical vs financial progress alignment, delay days,
    and linear trajectory prediction for demonstration lifecycle records.
    """
    physical_progress = float(raw.get("physical_progress_percent", 0.0) or 0.0)
    utilization_percent = financials.get("utilization_percent", 0.0)

    # Reality Gap Calculation
    reality_gap_percent = round(abs(utilization_percent - physical_progress), 2)
    if utilization_percent - physical_progress >= 30.0:
        reality_gap_status = "HIGH_EXPENDITURE_LOW_PHYSICAL_PROGRESS"
        reality_gap_alert = True
        reality_gap_explanation = (
            f"Early Warning: Fund expenditure ({utilization_percent}%) significantly outpaces "
            f"verified physical progress ({physical_progress}%). Reality gap of {reality_gap_percent}%."
        )
    else:
        reality_gap_status = "NORMAL_PROGRESS_ALIGNMENT"
        reality_gap_alert = False
        reality_gap_explanation = "Physical execution rate aligns with fund expenditure."

    # Dates & Delay Calculation
    expected_str = raw.get("expected_completion_date")
    actual_str = raw.get("actual_completion_date")
    sanction_str = raw.get("sanction_date") or raw.get("work_order_date") or "2024-01-01"

    expected_dt: Optional[date] = None
    if expected_str:
        try:
            expected_dt = datetime.strptime(expected_str, "%Y-%m-%d").date()
        except Exception:
            expected_dt = None

    actual_dt: Optional[date] = None
    if actual_str:
        try:
            actual_dt = datetime.strptime(actual_str, "%Y-%m-%d").date()
        except Exception:
            actual_dt = None

    sanction_dt: date = date(2024, 1, 1)
    if sanction_str:
        try:
            sanction_dt = datetime.strptime(sanction_str, "%Y-%m-%d").date()
        except Exception:
            sanction_dt = date(2024, 1, 1)

    delay_days = 0
    if actual_dt and expected_dt:
        if actual_dt > expected_dt:
            delay_days = (actual_dt - expected_dt).days
        else:
            delay_days = 0
        delay_status = "COMPLETED_ON_TIME" if delay_days == 0 else "COMPLETED_WITH_DELAY"
    elif expected_dt:
        if REFERENCE_EVAL_DATE > expected_dt:
            delay_days = (REFERENCE_EVAL_DATE - expected_dt).days
            delay_status = "CRITICAL_DELAY" if delay_days > 90 else "DELAYED"
        else:
            if physical_progress == 0.0:
                delay_status = "STALLED"
            else:
                delay_status = "ON_SCHEDULE"
    else:
        delay_status = "UNKNOWN"

    # Linear Trajectory Prediction (DEMO_LINEAR_TRAJECTORY_V1)
    predicted_completion_date: Optional[str] = None
    projected_additional_days: Optional[int] = None
    prediction_confidence: str = "NOT_APPLICABLE"

    if actual_dt:
        predicted_completion_date = actual_dt.strftime("%Y-%m-%d")
        projected_additional_days = 0
        prediction_confidence = "ACTUAL_COMPLETED"
    elif physical_progress <= 0.0:
        predicted_completion_date = None
        projected_additional_days = None
        prediction_confidence = "CANNOT_PREDICT_STALLED"
    elif physical_progress >= 100.0:
        predicted_completion_date = REFERENCE_EVAL_DATE.strftime("%Y-%m-%d")
        projected_additional_days = 0
        prediction_confidence = "ESTIMATED_COMPLETED"
    else:
        elapsed_days = max(1, (REFERENCE_EVAL_DATE - sanction_dt).days)
        estimated_total_days = int(elapsed_days / (physical_progress / 100.0))
        remaining_days = max(1, estimated_total_days - elapsed_days)
        predicted_dt = REFERENCE_EVAL_DATE + timedelta(days=remaining_days)
        predicted_completion_date = predicted_dt.strftime("%Y-%m-%d")
        projected_additional_days = remaining_days
        prediction_confidence = "ESTIMATED_LINEAR"

    return {
        "physical_progress_percent": physical_progress,
        "financial_progress_percent": utilization_percent,
        "reality_gap_percent": reality_gap_percent,
        "reality_gap_status": reality_gap_status,
        "reality_gap_alert": reality_gap_alert,
        "reality_gap_explanation": reality_gap_explanation,
        "expected_completion_date": expected_str,
        "actual_completion_date": actual_str,
        "delay_days": delay_days,
        "delay_status": delay_status,
        "prediction": {
            "trajectory_algorithm": "DEMO_LINEAR_TRAJECTORY_V1",
            "predicted_completion_date": predicted_completion_date,
            "projected_additional_days": projected_additional_days,
            "confidence": prediction_confidence
        }
    }
