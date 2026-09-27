from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Dict, Any, Optional, List
from src.api.schemas import (
    AllocationTrendsResponse,
    RecommendationTrendsResponse,
    RiskTrendsResponse,
    AnomalyTrendsResponse,
    ImplementingAuthorityListResponse,
    ImplementingAuthorityItem,
    ConcentrationAnalyticsResponse
)
from src.api.services.analytics_service import (
    get_allocation_trends,
    get_recommendation_trends,
    get_risk_trends,
    get_anomaly_trends
)
from src.api.services.ida_analytics_service import (
    get_implementing_authorities_analytics,
    get_ida_detail_analytics,
    IDA_DISCLAIMER
)
from src.api.services.concentration_service import get_concentration_analytics
from src.api.data_loader import get_clean_df
from src.auth.authorization import get_current_user
from src.scoping.scope_service import get_effective_scope
from src.scoping.district_scope import get_trusted_record_ids_for_district

router = APIRouter()

ALLOWED_INTERVALS = ["monthly", "quarterly", "yearly"]

def _validate_interval(interval: str):
    if interval.lower() not in ALLOWED_INTERVALS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid interval '{interval}'. Must be one of: {', '.join(ALLOWED_INTERVALS)}"
        )

def _get_allowed_ids_for_user(user: Dict[str, Any]) -> Optional[List[int]]:
    scope = get_effective_scope(user)
    scope_type = scope.get("scope_type", "").upper()
    if scope_type == "DISTRICT" and scope.get("district"):
        return get_trusted_record_ids_for_district(scope["district"], scope.get("state"))
    elif scope_type == "CONSTITUENCY" and scope.get("constituency"):
        clean_df = get_clean_df()
        if not clean_df.empty:
            matches = clean_df[clean_df["constituency"].astype(str).str.lower() == scope["constituency"].lower().strip()]
            return matches["original_row_index"].tolist()
    elif scope_type == "STATE" and scope.get("state"):
        clean_df = get_clean_df()
        if not clean_df.empty:
            matches = clean_df[clean_df["state"].astype(str).str.lower() == scope["state"].lower().strip()]
            return matches["original_row_index"].tolist()
    return None

@router.get("/analytics/trends/allocations", response_model=AllocationTrendsResponse)
def allocation_trends(
    interval: str = Query(default="monthly", description="Time aggregation interval: monthly, quarterly, yearly"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Time-series allocation amount statistics (total, mean, median, min, max) over recommended dates.
    Restricted to authenticated official users; automatically scoped to user's administrative jurisdiction.
    """
    _validate_interval(interval)
    scope = get_effective_scope(current_user)
    return get_allocation_trends(interval=interval, scope=scope)

@router.get("/analytics/trends/recommendations", response_model=RecommendationTrendsResponse)
def recommendation_trends(
    interval: str = Query(default="monthly", description="Time aggregation interval: monthly, quarterly, yearly"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Time-series recommendation frequency and stakeholder counts over recommended dates.
    Restricted to authenticated official users; automatically scoped to user's administrative jurisdiction.
    """
    _validate_interval(interval)
    scope = get_effective_scope(current_user)
    return get_recommendation_trends(interval=interval, scope=scope)

@router.get("/analytics/trends/risk", response_model=RiskTrendsResponse)
def risk_trends(
    interval: str = Query(default="monthly", description="Time aggregation interval: monthly, quarterly, yearly"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Time-series investigation priority scores and priority tier distribution over recommended dates.
    Restricted to authenticated official users; automatically scoped to user's administrative jurisdiction.
    """
    _validate_interval(interval)
    scope = get_effective_scope(current_user)
    return get_risk_trends(interval=interval, scope=scope)

@router.get("/analytics/trends/anomalies", response_model=AnomalyTrendsResponse)
def anomaly_trends(
    interval: str = Query(default="monthly", description="Time aggregation interval: monthly, quarterly, yearly"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Time-series count of anomaly detector triggers over recommended dates.
    Restricted to authenticated official users; automatically scoped to user's administrative jurisdiction.
    """
    _validate_interval(interval)
    scope = get_effective_scope(current_user)
    return get_anomaly_trends(interval=interval, scope=scope)

@router.get("/analytics/implementing-authorities", response_model=ImplementingAuthorityListResponse)
def list_implementing_authorities(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Aggregated analytics across Implementing District Authorities (IDAs).
    Treats IDAs strictly as designated government administrative authorities, not contractors or vendors.
    Automatically scoped to records within user's administrative jurisdiction.
    """
    allowed_ids = _get_allowed_ids_for_user(current_user)
    authorities = get_implementing_authorities_analytics(allowed_record_ids=allowed_ids)
    return {
        "total_authorities": len(authorities),
        "authorities": authorities,
        "disclaimer": IDA_DISCLAIMER
    }

@router.get("/analytics/implementing-authorities/{encoded_ida}", response_model=ImplementingAuthorityItem)
def get_implementing_authority_detail(
    encoded_ida: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Detailed analytics for an individual Implementing District Authority.
    Restricted to authenticated officials within their authorized administrative scope.
    """
    allowed_ids = _get_allowed_ids_for_user(current_user)
    ida_data = get_ida_detail_analytics(encoded_ida, allowed_record_ids=allowed_ids)
    if ida_data is None:
        raise HTTPException(
            status_code=404,
            detail=f"Implementing District Authority '{encoded_ida}' not found or outside user's authorized scope."
        )
    return ida_data

@router.get("/analytics/concentration", response_model=ConcentrationAnalyticsResponse)
def concentration_analytics(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Concentration indicators and pattern metrics across categories, IDAs, constituencies, and temporal clusters.
    Restricted to authenticated officials; automatically scoped to user's administrative jurisdiction.
    """
    allowed_ids = _get_allowed_ids_for_user(current_user)
    return get_concentration_analytics(allowed_record_ids=allowed_ids)
