from typing import Optional, Dict, Any
from src.verification.verification_models import RealityGapResult

def calculate_reality_gap(
    fund_utilization: Optional[float] = None,
    physical_progress: Optional[float] = None
) -> RealityGapResult:
    """
    Computes reality_gap = fund_utilization - physical_progress when both are available.
    Otherwise returns status = not_available.
    """
    if fund_utilization is None or physical_progress is None:
        explanation = (
            "Reality Gap analysis requires both physical progress and fund utilization percentages. "
            "Neither physical_progress nor fund_utilization columns are available in the current public spending dataset."
        )
        return RealityGapResult(
            reality_gap_status="not_available",
            reality_gap=None,
            fund_utilization=None,
            physical_progress=None,
            explanation=explanation
        )

    reality_gap = fund_utilization - physical_progress
    
    if reality_gap <= 10.0:
        gap_level = "low"
    elif reality_gap <= 30.0:
        gap_level = "moderate"
    else:
        gap_level = "high"
        
    explanation = (
        f"Reality Gap calculated as {reality_gap:.1f} percentage points based on fund utilization "
        f"of {fund_utilization:.1f}% and physical progress of {physical_progress:.1f}% (gap severity: {gap_level})."
    )
    
    return RealityGapResult(
        reality_gap_status="calculated",
        reality_gap=reality_gap,
        fund_utilization=fund_utilization,
        physical_progress=physical_progress,
        explanation=explanation
    )
