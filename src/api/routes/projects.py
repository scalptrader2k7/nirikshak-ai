from fastapi import APIRouter, Query, HTTPException, Depends, Request
from typing import Optional, Dict, Any, List
from src.api.schemas import (
    ProjectListResponse,
    ProjectOverviewResponse,
    DemoLifecycleResponse,
    PublicProjectDetailResponse,
    PeerBenchmarkResponse,
    ProjectDuplicatesResponse,
    DuplicateListResponse
)
from src.api.services.project_service import (
    get_paginated_projects,
    get_project_overview,
    get_public_project_detail
)
from src.api.services.benchmark_service import get_enriched_peer_benchmark
from src.api.services.duplicate_service import get_duplicates_for_project, get_paginated_duplicates
from src.enrichment.demo_service import get_demo_lifecycle_payload
from src.auth.authorization import get_current_user, get_optional_current_user
from src.scoping.scope_service import can_access_project, get_effective_scope
from src.scoping.district_scope import get_trusted_record_ids_for_district

router = APIRouter()

@router.get("/projects", response_model=ProjectListResponse)
def list_projects(
    request: Request,
    page: int = Query(default=1, ge=1, description="Page number starting from 1"),
    page_size: int = Query(default=20, ge=1, le=100, description="Records per page (max 100)"),
    search: Optional[str] = Query(default=None, description="Search term on work, MP, constituency, state, or ID"),
    state: Optional[str] = Query(default=None, description="Filter by state name"),
    constituency: Optional[str] = Query(default=None, description="Filter by constituency name"),
    mp_name: Optional[str] = Query(default=None, description="Filter by MP name"),
    work_type: Optional[str] = Query(default=None, description="Filter by work category"),
    status: Optional[str] = Query(default=None, description="Filter by sanction status"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)
):
    """
    Browses cleaned project records in the official MPLADS snapshot.
    When accessed by authenticated officials, backend scope restrictions
    (Constituency for MP, State for State Nodal, Trusted District for District Authority)
    are strictly enforced and override client parameters to prevent scope escalation.
    Public requests return un-scoped public snapshot listings.
    """
    effective_state = state
    effective_constituency = constituency
    allowed_ids: Optional[List[int]] = None

    if current_user:
        scope = get_effective_scope(current_user)
        scope_type = scope.get("scope_type", "").upper()

        if scope_type == "CONSTITUENCY" and scope.get("constituency"):
            effective_constituency = scope["constituency"]
        elif scope_type == "STATE" and scope.get("state"):
            effective_state = scope["state"]
        elif scope_type == "DISTRICT" and scope.get("district"):
            allowed_ids = get_trusted_record_ids_for_district(
                scope["district"],
                scope.get("state")
            )

    records, total_records, total_pages = get_paginated_projects(
        page=page,
        page_size=page_size,
        search=search,
        state=effective_state,
        constituency=effective_constituency,
        mp_name=mp_name,
        work_type=work_type,
        status=status,
        allowed_record_ids=allowed_ids
    )
    return {
        "data": records,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_records": total_records,
            "total_pages": total_pages
        },
        "filters": {
            "search": search,
            "state": effective_state,
            "constituency": effective_constituency,
            "mp_name": mp_name,
            "work_type": work_type,
            "status": status
        }
    }

@router.get("/projects/search", response_model=ProjectListResponse)
def search_projects(
    q: Optional[str] = Query(default=None, description="Search query across project works, MP names, locations"),
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Page size"),
    state: Optional[str] = Query(default=None, description="State filter"),
    constituency: Optional[str] = Query(default=None, description="Constituency filter"),
    current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)
):
    """
    Public-safe search endpoint querying official project records.
    Applies authoritative user scope if an authenticated session exists.
    """
    return list_projects(
        request=None,
        page=page,
        page_size=page_size,
        search=q,
        state=state,
        constituency=constituency,
        current_user=current_user
    )

@router.get("/projects/{record_id}", response_model=PublicProjectDetailResponse)
def get_public_project(record_id: int):
    """
    Public project record lookup.
    Exposes only official public MPLADS record fields.
    Does NOT expose internal investigation notes, reviewer identities, workflow audit trails,
    evidence requests, decision notes, or private account data.
    """
    proj = get_public_project_detail(record_id)
    if proj is None:
        raise HTTPException(status_code=404, detail="Project record not found")
    return proj

@router.get("/projects/{record_id}/overview", response_model=ProjectOverviewResponse)
def project_overview(
    record_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieves the consolidated project overview package for an official project record.
    Access is restricted to authenticated officials within their authorized data scope.
    """
    if not can_access_project(current_user, record_id):
        raise HTTPException(
            status_code=403,
            detail="Access forbidden: Record is outside assigned administrative scope or lacks a trusted district mapping."
        )

    overview = get_project_overview(record_id)
    if overview is None:
        raise HTTPException(status_code=404, detail="Project record not found")
    return overview

@router.get("/projects/{record_id}/peer-benchmark", response_model=PeerBenchmarkResponse)
def get_project_peer_benchmark(
    record_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieves the stable peer benchmark response for an official project record.
    Evaluates statistical dispersion against local (state + category) or national category peers.
    Restricted to authenticated officials within their authorized data scope.
    """
    if not can_access_project(current_user, record_id):
        raise HTTPException(
            status_code=403,
            detail="Access forbidden: Record is outside assigned administrative scope or lacks a trusted district mapping."
        )

    benchmark = get_enriched_peer_benchmark(record_id)
    if benchmark is None:
        raise HTTPException(status_code=404, detail="Project record not found")
    return benchmark

@router.get("/projects/{record_id}/duplicates", response_model=ProjectDuplicatesResponse)
def get_project_duplicates(
    record_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Read-only duplicate intelligence explorer for an individual project record.
    Reuses pre-computed exact duplicate groupings and contextual near-duplicate pair outputs.
    Restricted to authenticated officials within their authorized data scope.
    """
    if not can_access_project(current_user, record_id):
        raise HTTPException(
            status_code=403,
            detail="Access forbidden: Record is outside assigned administrative scope or lacks a trusted district mapping."
        )

    dup_payload = get_duplicates_for_project(record_id)
    return dup_payload

@router.get("/duplicates", response_model=DuplicateListResponse)
def list_duplicates(
    page: int = Query(default=1, ge=1, description="Page number"),
    page_size: int = Query(default=20, ge=1, le=100, description="Records per page"),
    duplicate_type: Optional[str] = Query(default=None, description="Filter: EXACT_DUPLICATE or NEAR_DUPLICATE"),
    classification: Optional[str] = Query(default=None, description="Filter: EXACT_DUPLICATE_RECORD, POTENTIAL_NEAR_DUPLICATE, etc."),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Browses duplicate relationships across records within user's authorized scope.
    Restricted to authenticated officials.
    """
    allowed_ids: Optional[List[int]] = None
    scope = get_effective_scope(current_user)
    scope_type = scope.get("scope_type", "").upper()

    if scope_type == "DISTRICT" and scope.get("district"):
        allowed_ids = get_trusted_record_ids_for_district(scope["district"], scope.get("state"))
    elif scope_type == "CONSTITUENCY" and scope.get("constituency"):
        from src.api.data_loader import get_clean_df
        clean_df = get_clean_df()
        if not clean_df.empty:
            matches = clean_df[clean_df["constituency"].astype(str).str.lower() == scope["constituency"].lower().strip()]
            allowed_ids = matches["original_row_index"].tolist()
    elif scope_type == "STATE" and scope.get("state"):
        from src.api.data_loader import get_clean_df
        clean_df = get_clean_df()
        if not clean_df.empty:
            matches = clean_df[clean_df["state"].astype(str).str.lower() == scope["state"].lower().strip()]
            allowed_ids = matches["original_row_index"].tolist()

    matches, total_records, total_pages = get_paginated_duplicates(
        page=page,
        page_size=page_size,
        duplicate_type=duplicate_type,
        classification=classification,
        allowed_record_ids=allowed_ids
    )

    from src.api.services.duplicate_service import DUPLICATE_DISCLAIMER
    return {
        "data": matches,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_records": total_records,
            "total_pages": total_pages
        },
        "disclaimer": DUPLICATE_DISCLAIMER
    }

@router.get("/projects/{record_id}/demo-lifecycle", response_model=DemoLifecycleResponse)
def get_demo_lifecycle(
    record_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Demonstration lifecycle enrichment endpoint.
    Exposes financial intelligence, payment anomaly signals, and compliance screenings.
    Restricted to authenticated official users within authorized administrative scope.
    """
    if not can_access_project(current_user, record_id):
        raise HTTPException(
            status_code=403,
            detail="Access forbidden: Record is outside assigned administrative scope or lacks a trusted district mapping."
        )

    payload = get_demo_lifecycle_payload(record_id)
    if payload is None:
        raise HTTPException(status_code=404, detail="Project record not found")
    return payload
