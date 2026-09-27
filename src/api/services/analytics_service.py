from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from src.api.data_loader import get_clean_df, get_cases
from src.scoping.district_scope import get_trusted_record_ids_for_district

def _get_period_key(date_val: Any, interval: str) -> Optional[str]:
    if pd.isnull(date_val) or not date_val:
        return None
    try:
        dt = pd.to_datetime(str(date_val).strip()[:10], errors="coerce")
        if pd.isna(dt):
            return None
        interval_lower = interval.lower().strip()
        if interval_lower == "yearly":
            return dt.strftime("%Y")
        elif interval_lower == "quarterly":
            quarter = (dt.month - 1) // 3 + 1
            return f"{dt.year}-Q{quarter}"
        else:  # default monthly
            return dt.strftime("%Y-%m")
    except Exception:
        return None

def _apply_scope_to_df(df: pd.DataFrame, scope: Optional[Dict[str, Any]]) -> pd.DataFrame:
    """
    Applies authoritative user scope restrictions to the analytics dataframe.
    """
    if not scope or df.empty:
        return df
    scope_type = scope.get("scope_type", "NATIONAL").upper()
    if scope_type == "NATIONAL":
        return df
    if scope_type == "STATE" and scope.get("state"):
        return df[df["state"].astype(str).str.lower() == str(scope["state"]).strip().lower()]
    if scope_type == "CONSTITUENCY" and scope.get("constituency"):
        return df[df["constituency"].astype(str).str.lower() == str(scope["constituency"]).strip().lower()]
    if scope_type == "DISTRICT" and scope.get("district"):
        trusted_ids = get_trusted_record_ids_for_district(scope["district"], scope.get("state"))
        col = "original_row_index" if "original_row_index" in df.columns else "record_id"
        if col in df.columns:
            return df[df[col].isin(trusted_ids)]
        return df.iloc[0:0]
    return df

def get_allocation_trends(interval: str = "monthly", scope: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Computes time-series trend of project allocation amounts grouped by period.
    Respects backend scope restrictions.
    """
    clean_df = get_clean_df()
    if clean_df.empty:
        return {"interval": interval, "total_periods": 0, "data": []}

    df = _apply_scope_to_df(clean_df.copy(), scope)
    if df.empty:
        return {"interval": interval, "total_periods": 0, "data": []}

    df["period"] = df["recommended_date"].apply(lambda d: _get_period_key(d, interval))
    df = df[df["period"].notnull()]

    grouped = df.groupby("period")
    results = []
    for period, group in sorted(grouped):
        amts = group["allocation_amount"].dropna()
        results.append({
            "period": period,
            "record_count": len(group),
            "total_allocation_amount": float(amts.sum()) if len(amts) > 0 else 0.0,
            "mean_allocation_amount": round(float(amts.mean()), 2) if len(amts) > 0 else 0.0,
            "median_allocation_amount": round(float(amts.median()), 2) if len(amts) > 0 else 0.0,
            "min_allocation_amount": float(amts.min()) if len(amts) > 0 else 0.0,
            "max_allocation_amount": float(amts.max()) if len(amts) > 0 else 0.0
        })

    return {
        "interval": interval,
        "total_periods": len(results),
        "data": results
    }

def get_recommendation_trends(interval: str = "monthly", scope: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Computes time-series recommendation frequency and stakeholder counts grouped by period.
    Respects backend scope restrictions.
    """
    clean_df = get_clean_df()
    if clean_df.empty:
        return {"interval": interval, "total_periods": 0, "data": []}

    df = _apply_scope_to_df(clean_df.copy(), scope)
    if df.empty:
        return {"interval": interval, "total_periods": 0, "data": []}

    df["period"] = df["recommended_date"].apply(lambda d: _get_period_key(d, interval))
    df = df[df["period"].notnull()]

    grouped = df.groupby("period")
    results = []
    for period, group in sorted(grouped):
        results.append({
            "period": period,
            "recommendation_count": len(group),
            "unique_mps": int(group["mp_name"].nunique(dropna=True)),
            "unique_constituencies": int(group["constituency"].nunique(dropna=True)),
            "unique_states": int(group["state"].nunique(dropna=True))
        })

    return {
        "interval": interval,
        "total_periods": len(results),
        "data": results
    }

def get_risk_trends(interval: str = "monthly", scope: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Computes time-series investigation priority scores and priority tier distribution.
    Respects backend scope restrictions.
    """
    cases = get_cases()
    if not cases:
        return {"interval": interval, "total_periods": 0, "data": []}

    df = pd.DataFrame(cases)
    df = _apply_scope_to_df(df, scope)
    if df.empty:
        return {"interval": interval, "total_periods": 0, "data": []}

    df["period"] = df["recommended_date"].apply(lambda d: _get_period_key(d, interval))
    df = df[df["period"].notnull()]

    grouped = df.groupby("period")
    results = []
    for period, group in sorted(grouped):
        scores = group["investigation_priority_score"]
        levels = group["investigation_priority_level"].value_counts().to_dict()
        results.append({
            "period": period,
            "case_count": len(group),
            "mean_priority_score": round(float(scores.mean()), 2) if len(scores) > 0 else 0.0,
            "max_priority_score": float(scores.max()) if len(scores) > 0 else 0.0,
            "priority_distribution": {
                "CRITICAL": int(levels.get("CRITICAL", 0)),
                "HIGH": int(levels.get("HIGH", 0)),
                "MEDIUM": int(levels.get("MEDIUM", 0)),
                "LOW": int(levels.get("LOW", 0))
            }
        })

    return {
        "interval": interval,
        "total_periods": len(results),
        "data": results
    }

def get_anomaly_trends(interval: str = "monthly", scope: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Computes time-series count of anomaly detector triggers over time.
    Respects backend scope restrictions.
    """
    cases = get_cases()
    if not cases:
        return {"interval": interval, "total_periods": 0, "data": []}

    df = pd.DataFrame(cases)
    df = _apply_scope_to_df(df, scope)
    if df.empty:
        return {"interval": interval, "total_periods": 0, "data": []}

    df["period"] = df["recommended_date"].apply(lambda d: _get_period_key(d, interval))
    df = df[df["period"].notnull()]

    grouped = df.groupby("period")
    results = []
    for period, group in sorted(grouped):
        cost_c = int(group["cost_anomaly"].sum()) if "cost_anomaly" in group else 0
        exact_c = int(group["exact_duplicate_anomaly"].sum()) if "exact_duplicate_anomaly" in group else 0
        near_c = int(group["near_duplicate_anomaly"].sum()) if "near_duplicate_anomaly" in group else 0
        pattern_c = int(group["pattern_anomaly"].sum()) if "pattern_anomaly" in group else 0
        total_t = cost_c + exact_c + near_c + pattern_c

        results.append({
            "period": period,
            "total_detector_triggers": total_t,
            "detector_counts": {
                "cost": cost_c,
                "exact_duplicate": exact_c,
                "near_duplicate": near_c,
                "pattern": pattern_c
            }
        })

    return {
        "interval": interval,
        "total_periods": len(results),
        "data": results
    }
