from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from src.api.schemas import CaseListResponse, SingleCaseResponse
from src.api.services.investigation_service import get_filtered_cases, get_case_by_id

router = APIRouter()

ALLOWED_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
ALLOWED_DETECTORS = ["cost", "exact_duplicate", "near_duplicate", "pattern"]
ALLOWED_SEVERITIES = ["low", "medium", "high", "critical"]
ALLOWED_SORT_FIELDS = ["rank", "investigation_priority_score", "allocation_amount", "record_id"]
ALLOWED_SORT_ORDERS = ["asc", "desc"]

@router.get("/cases", response_model=CaseListResponse)
def list_cases(
    page: int = Query(default=1, ge=1, description="Page number starting from 1"),
    page_size: int = Query(default=20, ge=1, le=100, description="Number of records per page (max 100)"),
    priority: Optional[str] = Query(default=None, description="Exact priority level (LOW, MEDIUM, HIGH, CRITICAL)"),
    detector: Optional[str] = Query(default=None, description="Primary detector (cost, exact_duplicate, near_duplicate, pattern)"),
    severity: Optional[str] = Query(default=None, description="Highest evidence severity (low, medium, high, critical)"),
    state: Optional[str] = Query(default=None, description="Filter by state"),
    constituency: Optional[str] = Query(default=None, description="Filter by constituency"),
    mp_name: Optional[str] = Query(default=None, description="Filter by MP name"),
    work_type: Optional[str] = Query(default=None, description="Filter by work type category"),
    min_score: Optional[float] = Query(default=None, ge=0.0, le=100.0, description="Minimum priority score"),
    max_score: Optional[float] = Query(default=None, ge=0.0, le=100.0, description="Maximum priority score"),
    search: Optional[str] = Query(default=None, description="Partial search query on text fields"),
    sort_by: str = Query(default="rank", description="Sort whitelisted fields (rank, investigation_priority_score, allocation_amount, record_id)"),
    sort_order: str = Query(default="asc", description="Sort order (asc, desc)")
):
    """
    Exposes paginated, searchable, sorted, and filtered investigation cases.
    """
    # 1. Validation checks
    if priority is not None and priority.upper() not in ALLOWED_PRIORITIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid priority level. Must be one of: {', '.join(ALLOWED_PRIORITIES)}"
        )
        
    if detector is not None and detector.lower() not in ALLOWED_DETECTORS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid detector type. Must be one of: {', '.join(ALLOWED_DETECTORS)}"
        )
        
    if severity is not None and severity.lower() not in ALLOWED_SEVERITIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid severity level. Must be one of: {', '.join(ALLOWED_SEVERITIES)}"
        )
        
    if sort_by not in ALLOWED_SORT_FIELDS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sort field. Must be one of: {', '.join(ALLOWED_SORT_FIELDS)}"
        )
        
    if sort_order.lower() not in ALLOWED_SORT_ORDERS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sort order. Must be one of: {', '.join(ALLOWED_SORT_ORDERS)}"
        )
        
    if min_score is not None and max_score is not None and min_score > max_score:
        raise HTTPException(
            status_code=400,
            detail="min_score cannot be greater than max_score"
        )
        
    # 2. Query execution
    sliced_cases, total_records, total_pages = get_filtered_cases(
        page=page,
        page_size=page_size,
        priority=priority,
        detector=detector,
        severity=severity,
        state=state,
        constituency=constituency,
        mp_name=mp_name,
        work_type=work_type,
        min_score=min_score,
        max_score=max_score,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return {
        "data": sliced_cases,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_records": total_records,
            "total_pages": total_pages
        },
        "filters": {
            "priority": priority,
            "detector": detector,
            "severity": severity,
            "state": state,
            "constituency": constituency,
            "mp_name": mp_name,
            "work_type": work_type,
            "min_score": min_score,
            "max_score": max_score,
            "search": search
        }
    }

@router.get("/cases/{record_id}", response_model=SingleCaseResponse)
def get_case(record_id: int):
    """
    Retrieves a single investigation case by its unique record ID.
    """
    case = get_case_by_id(record_id)
    if case is None:
        raise HTTPException(status_code=404, detail="Investigation case not found")
    return {"data": case}

from src.api.schemas import CaseDetailResponse
from src.api.services.case_detail_service import get_case_detail

@router.get("/cases/{record_id}/detail", response_model=CaseDetailResponse)
def get_case_detail_endpoint(record_id: int):
    """
    Retrieves the complete individual investigation case detail package,
    including project details, risk summaries, available/missing evidence,
    peer benchmarking metrics, integrity status, and related duplicates.
    """
    case_detail = get_case_detail(record_id)
    if case_detail is None:
        raise HTTPException(status_code=404, detail="Investigation case not found")
    return case_detail
