import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from src.api.data_loader import get_clean_df, get_anomaly_df
from src.api.config import FEATURES_CSV_PATH

# Local caching of the merged DataFrame for speed
_MERGED_STATS_DF: Optional[pd.DataFrame] = None

def _get_merged_stats_df() -> pd.DataFrame:
    """
    Combines clean, anomaly, and features DataFrames once in memory.
    """
    global _MERGED_STATS_DF
    if _MERGED_STATS_DF is not None:
        return _MERGED_STATS_DF
        
    df_clean = get_clean_df()
    df_anom = get_anomaly_df()
    
    if df_clean.empty or df_anom.empty:
        return pd.DataFrame()
        
    # Read features DataFrame to get work_type
    try:
        df_feat = pd.read_csv(FEATURES_CSV_PATH)
    except Exception:
        df_feat = pd.DataFrame(columns=["original_row_index", "work_type"])
        
    # Join on original_row_index
    m1 = pd.merge(df_clean, df_anom[[
        "original_row_index", "investigation_priority_score", "investigation_priority_level",
        "cost_anomaly", "exact_duplicate_anomaly", "near_duplicate_anomaly", "pattern_anomaly"
    ]], on="original_row_index", how="inner")
    
    if not df_feat.empty and "work_type" in df_feat.columns:
        merged = pd.merge(m1, df_feat[["original_row_index", "work_type"]], on="original_row_index", how="left")
    else:
        merged = m1
        merged["work_type"] = "other"
        
    _MERGED_STATS_DF = merged
    return _MERGED_STATS_DF

def get_statistics(
    state: Optional[str] = None,
    constituency: Optional[str] = None,
    mp_name: Optional[str] = None,
    work_type: Optional[str] = None,
    priority: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calculates aggregated case and score stats dynamically based on optional filters.
    """
    df = _get_merged_stats_df()
    if df.empty:
        return {
            "total_records": 0,
            "investigation_cases": 0,
            "priority_distribution": {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0},
            "detector_distribution": {"cost": 0, "exact_duplicate": 0, "near_duplicate": 0, "pattern": 0},
            "score": {"min": 0.0, "max": 0.0, "mean": 0.0, "median": 0.0}
        }
        
    # Apply filters (exact case-insensitive match)
    if state is not None:
        df = df[df["state"].fillna("").str.lower() == state.lower()]
    if constituency is not None:
        df = df[df["constituency"].fillna("").str.lower() == constituency.lower()]
    if mp_name is not None:
        df = df[df["mp_name"].fillna("").str.lower() == mp_name.lower()]
    if work_type is not None:
        df = df[df["work_type"].fillna("").str.lower() == work_type.lower()]
    if priority is not None:
        df = df[df["investigation_priority_level"].fillna("").str.upper() == priority.upper()]
        
    # Calculate stats
    total_records = len(df)
    
    # Filter cases with score > 0
    cases_df = df[df["investigation_priority_score"] > 0]
    investigation_cases = len(cases_df)
    
    # Priority Level counts
    levels = df["investigation_priority_level"].fillna("LOW").tolist()
    priority_dist = {
        "LOW": levels.count("LOW"),
        "MEDIUM": levels.count("MEDIUM"),
        "HIGH": levels.count("HIGH"),
        "CRITICAL": levels.count("CRITICAL")
    }
    
    # Detector counts
    detector_dist = {
        "cost": int(df["cost_anomaly"].fillna(False).sum()),
        "exact_duplicate": int(df["exact_duplicate_anomaly"].fillna(False).sum()),
        "near_duplicate": int(df["near_duplicate_anomaly"].fillna(False).sum()),
        "pattern": int(df["pattern_anomaly"].fillna(False).sum())
    }
    
    # Priority scores stats
    scores = df["investigation_priority_score"].fillna(0.0).tolist()
    if len(scores) > 0:
        min_score = float(np.min(scores))
        max_score = float(np.max(scores))
        mean_score = float(np.mean(scores))
        median_score = float(np.median(scores))
    else:
        min_score = max_score = mean_score = median_score = 0.0
        
    return {
        "total_records": total_records,
        "investigation_cases": investigation_cases,
        "priority_distribution": priority_dist,
        "detector_distribution": detector_dist,
        "score": {
            "min": round(min_score, 2),
            "max": round(max_score, 2),
            "mean": round(mean_score, 2),
            "median": round(median_score, 2)
        }
    }
