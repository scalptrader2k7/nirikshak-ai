from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from src.api.schemas import StatisticsResponse
from src.api.services.statistics_service import get_statistics

router = APIRouter()

ALLOWED_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

@router.get("/statistics", response_model=StatisticsResponse)
def get_stats(
    state: Optional[str] = Query(default=None, description="Filter statistics by state"),
    constituency: Optional[str] = Query(default=None, description="Filter statistics by constituency"),
    mp_name: Optional[str] = Query(default=None, description="Filter statistics by MP name"),
    work_type: Optional[str] = Query(default=None, description="Filter statistics by work type category"),
    priority: Optional[str] = Query(default=None, description="Filter statistics by priority level (LOW, MEDIUM, HIGH, CRITICAL)")
):
    """
    Returns aggregated project counts, priority distribution, detector triggers, and score metrics.
    Can be optionally filtered.
    """
    if priority is not None and priority.upper() not in ALLOWED_PRIORITIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid priority level. Must be one of: {', '.join(ALLOWED_PRIORITIES)}"
        )
        
    stats = get_statistics(
        state=state,
        constituency=constituency,
        mp_name=mp_name,
        work_type=work_type,
        priority=priority
    )
    return stats
