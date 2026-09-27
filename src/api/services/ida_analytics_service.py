import pandas as pd
from typing import Dict, Any, List, Optional
from src.api.data_loader import get_clean_df, get_anomaly_df

IDA_DISCLAIMER = "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption. Implementing District Authorities (IDAs) are designated public administrative bodies overseeing sanctioned project execution."

def get_implementing_authorities_analytics(allowed_record_ids: Optional[List[int]] = None) -> List[Dict[str, Any]]:
    """
    Computes aggregated analytics across Implementing District Authorities (IDAs).
    Strictly treats IDAs as designated government administrative authorities, not vendors.
    Applies authoritative role/scope restriction via allowed_record_ids.
    """
    clean_df = get_clean_df()
    if clean_df.empty:
        return []

    anomaly_df = get_anomaly_df()
    
    # Merge clean data with anomaly signals
    if not anomaly_df.empty and "investigation_priority_score" in anomaly_df.columns:
        cols_to_merge = [
            "original_row_index",
            "investigation_priority_score",
            "investigation_priority_level",
            "exact_duplicate_anomaly",
            "near_duplicate_anomaly"
        ]
        merged = pd.merge(
            clean_df,
            anomaly_df[[c for c in cols_to_merge if c in anomaly_df.columns]],
            on="original_row_index",
            how="left"
        )
    else:
        merged = clean_df.copy()
        merged["investigation_priority_score"] = 0.0
        merged["investigation_priority_level"] = "LOW"
        merged["exact_duplicate_anomaly"] = False
        merged["near_duplicate_anomaly"] = False

    if allowed_record_ids is not None:
        merged = merged[merged["original_row_index"].isin(allowed_record_ids)]

    if merged.empty:
        return []

    ida_groups = merged.groupby("ida")
    analytics_list: List[Dict[str, Any]] = []

    for ida_name, group in ida_groups:
        if pd.isnull(ida_name) or str(ida_name).strip() == "":
            continue

        p_count = len(group)
        alloc_series = group["allocation_amount"].dropna()
        total_alloc = round(float(alloc_series.sum()), 2) if not alloc_series.empty else 0.0
        avg_alloc = round(float(alloc_series.mean()), 2) if not alloc_series.empty else 0.0
        median_alloc = round(float(alloc_series.median()), 2) if not alloc_series.empty else 0.0

        scores = group["investigation_priority_score"].dropna()
        avg_risk = round(float(scores.mean()), 2) if not scores.empty else 0.0

        high_risk_count = int(group["investigation_priority_level"].isin(["HIGH", "CRITICAL"]).sum())
        exact_dup_count = int(group["exact_duplicate_anomaly"].fillna(False).astype(bool).sum())
        near_dup_count = int(group["near_duplicate_anomaly"].fillna(False).astype(bool).sum())

        work_dist = group["category"].value_counts().to_dict()
        state_dist = group["state"].value_counts().to_dict()

        analytics_list.append({
            "ida_name": str(ida_name).strip(),
            "project_count": p_count,
            "total_allocation": total_alloc,
            "average_allocation": avg_alloc,
            "median_allocation": median_alloc,
            "average_risk_score": avg_risk,
            "high_risk_record_count": high_risk_count,
            "exact_duplicate_record_count": exact_dup_count,
            "near_duplicate_signal_count": near_dup_count,
            "work_type_distribution": {str(k): int(v) for k, v in work_dist.items()},
            "state_distribution": {str(k): int(v) for k, v in state_dist.items()},
            "interpretation": f"Aggregated statistics for Implementing District Authority '{ida_name}' across {p_count} administrative project records.",
            "disclaimer": IDA_DISCLAIMER
        })

    # Sort by total allocation descending
    analytics_list.sort(key=lambda x: x["total_allocation"], reverse=True)
    return analytics_list

def get_ida_detail_analytics(ida_name: str, allowed_record_ids: Optional[List[int]] = None) -> Optional[Dict[str, Any]]:
    """
    Returns detailed analytics for a single Implementing District Authority.
    """
    all_ida = get_implementing_authorities_analytics(allowed_record_ids=allowed_record_ids)
    target = ida_name.strip().lower()
    for item in all_ida:
        if item["ida_name"].strip().lower() == target:
            return item
    return None
