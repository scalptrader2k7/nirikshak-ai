import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from src.api.data_loader import get_clean_df, get_features_df
from src.verification.verification_models import PEER_GROUP_MIN_SIZE

BENCHMARK_VERSION = "1.0"
BENCHMARK_PERIOD = "Official MPLADS Public Snapshot"
BENCHMARK_DISCLAIMER = "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption. Peer deviation reflects statistical dispersion among comparable works, not a confirmed cost overrun."

_MERGED_BENCHMARK_DF: Optional[pd.DataFrame] = None

def _get_merged_benchmark_df() -> pd.DataFrame:
    global _MERGED_BENCHMARK_DF
    if _MERGED_BENCHMARK_DF is not None:
        return _MERGED_BENCHMARK_DF

    clean_df = get_clean_df()
    if clean_df.empty:
        return pd.DataFrame()

    feat_df = get_features_df()
    if not feat_df.empty and "work_type" in feat_df.columns:
        merged = pd.merge(
            clean_df,
            feat_df[["original_row_index", "work_type"]],
            on="original_row_index",
            how="left"
        )
    else:
        merged = clean_df.copy()
        merged["work_type"] = merged["category"]

    _MERGED_BENCHMARK_DF = merged
    return merged

def get_enriched_peer_benchmark(record_id: int) -> Optional[Dict[str, Any]]:
    """
    Computes stable peer benchmark metrics for a project record based on official MPLADS data.
    Evaluates statistical peer dispersion across state + work_type (local) with national fallback.
    Does not characterize peer deviation as a true cost overrun.
    """
    merged = _get_merged_benchmark_df()
    if merged.empty:
        return None

    matches = merged[merged["original_row_index"] == record_id]
    if len(matches) == 0:
        return None

    target_row = matches.iloc[0]
    project_amount = target_row.get("allocation_amount")
    target_state = target_row.get("state")
    target_work_type = target_row.get("work_type") or target_row.get("category")

    if pd.isnull(project_amount) or np.isnan(project_amount) or project_amount is None:
        return {
            "record_id": record_id,
            "project_amount": None,
            "peer_group_level": "insufficient_data",
            "peer_group_definition": "insufficient_data",
            "peer_count": 0,
            "peer_min": None,
            "peer_max": None,
            "peer_mean": None,
            "peer_median": None,
            "peer_percentile": None,
            "ratio_to_peer_median": None,
            "deviation_percent_from_peer_median": None,
            "benchmark_period": BENCHMARK_PERIOD,
            "benchmark_version": BENCHMARK_VERSION,
            "fallback_used": False,
            "interpretation": "Project has no recorded allocation amount for peer benchmarking.",
            "disclaimer": BENCHMARK_DISCLAIMER
        }

    proj_amt = float(project_amount)

    def _build_metrics(peers: pd.Series, level: str, definition: str, fallback: bool) -> Dict[str, Any]:
        p_count = len(peers)
        p_min = float(peers.min())
        p_max = float(peers.max())
        p_mean = round(float(peers.mean()), 2)
        p_median = round(float(peers.median()), 2)

        # Percentile rank
        if p_count > 0:
            p_percentile = round(float((peers < proj_amt).mean() * 100), 2)
        else:
            p_percentile = None

        if p_median > 0:
            dev_pct = round(((proj_amt - p_median) / p_median) * 100, 2)
            ratio = round(proj_amt / p_median, 3)
        else:
            dev_pct = None
            ratio = None

        if dev_pct is not None and dev_pct > 100.0:
            interp = f"Allocation is {ratio}x the median of comparable peer works ({dev_pct}% statistical dispersion)."
        elif dev_pct is not None and dev_pct < -50.0:
            interp = f"Allocation is {ratio}x the median of comparable peer works (below median)."
        else:
            interp = f"Allocation aligns within typical statistical dispersion of peer works."

        return {
            "record_id": record_id,
            "project_amount": proj_amt,
            "peer_group_level": level,
            "peer_group_definition": definition,
            "peer_count": p_count,
            "peer_min": p_min,
            "peer_max": p_max,
            "peer_mean": p_mean,
            "peer_median": p_median,
            "peer_percentile": p_percentile,
            "ratio_to_peer_median": ratio,
            "deviation_percent_from_peer_median": dev_pct,
            "benchmark_period": BENCHMARK_PERIOD,
            "benchmark_version": BENCHMARK_VERSION,
            "fallback_used": fallback,
            "interpretation": interp,
            "disclaimer": BENCHMARK_DISCLAIMER
        }

    # 1. Local Peer Group: state + work_type
    if pd.notnull(target_state) and pd.notnull(target_work_type) and target_state != "" and target_work_type != "":
        local_mask = (
            (merged["state"] == target_state) &
            (merged["work_type"] == target_work_type) &
            (merged["original_row_index"] != record_id) &
            (merged["allocation_amount"].notnull()) &
            (~merged["allocation_amount"].isna())
        )
        local_peers = merged[local_mask]["allocation_amount"]
        if len(local_peers) >= PEER_GROUP_MIN_SIZE:
            definition = f"State ({target_state}) + Category ({target_work_type})"
            return _build_metrics(local_peers, "local", definition, fallback=False)

    # 2. National Fallback Group: work_type across all states
    if pd.notnull(target_work_type) and target_work_type != "":
        national_mask = (
            (merged["work_type"] == target_work_type) &
            (merged["original_row_index"] != record_id) &
            (merged["allocation_amount"].notnull()) &
            (~merged["allocation_amount"].isna())
        )
        national_peers = merged[national_mask]["allocation_amount"]
        if len(national_peers) >= PEER_GROUP_MIN_SIZE:
            definition = f"Nationwide Category ({target_work_type})"
            return _build_metrics(national_peers, "national", definition, fallback=True)

    # 3. Insufficient data
    return {
        "record_id": record_id,
        "project_amount": proj_amt,
        "peer_group_level": "insufficient_data",
        "peer_group_definition": f"Category ({target_work_type or 'Unknown'})",
        "peer_count": 0,
        "peer_min": None,
        "peer_max": None,
        "peer_mean": None,
        "peer_median": None,
        "peer_percentile": None,
        "ratio_to_peer_median": None,
        "deviation_percent_from_peer_median": None,
        "benchmark_period": BENCHMARK_PERIOD,
        "benchmark_version": BENCHMARK_VERSION,
        "fallback_used": False,
        "interpretation": "Insufficient peer projects available to compute a statistically sound benchmark comparison (minimum 3 required).",
        "disclaimer": BENCHMARK_DISCLAIMER
    }
