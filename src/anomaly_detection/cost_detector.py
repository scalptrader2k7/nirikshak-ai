import pandas as pd
import numpy as np
from src.anomaly_detection.config import (
    PEER_MIN_GROUP_SIZE,
    GLOBAL_PERCENTILE_THRESHOLD,
    PEER_MEDIAN_RATIO_THRESHOLD,
    PEER_ZSCORE_THRESHOLD
)
from src.anomaly_detection.evidence import create_evidence

def compute_loo_peer_stats(df, row_idx, dim, val):
    """
    Computes leave-one-out (LOO) statistics for a specific row's peer group.
    Returns (median, mean, std) excluding the current row's allocation_amount.
    Suppressed (returns NaNs) if group size < PEER_MIN_GROUP_SIZE.
    """
    if pd.isnull(val) or str(val).strip() == "" or str(val).lower() == "nan":
        return np.nan, np.nan, np.nan
        
    group_mask = df[dim] == val
    group_indices = df.index[group_mask]
    group_size = len(group_indices)
    
    if group_size < PEER_MIN_GROUP_SIZE:
        return np.nan, np.nan, np.nan
        
    # Exclude current row
    other_indices = group_indices.difference([row_idx])
    other_amounts = df.loc[other_indices, "allocation_amount"].dropna()
    
    if len(other_amounts) < (PEER_MIN_GROUP_SIZE - 1):
        return np.nan, np.nan, np.nan
        
    median = other_amounts.median()
    mean = other_amounts.mean()
    std = other_amounts.std()
    
    return median, mean, std

def detect_cost_anomalies(df):
    """
    Ingests the features DataFrame, calculates LOO amount statistics, and returns:
    1. A list of list of evidence dictionaries (one list per row).
    2. A boolean mask indicating if any cost anomaly was triggered for each row.
    """
    evidence_list = []
    anomaly_triggered = []
    
    peer_dimensions = ["state", "house", "mp_name", "constituency", "ida", "work_type"]
    
    for i in range(len(df)):
        row_evidence = []
        amount = df.loc[i, "allocation_amount"]
        
        if pd.isnull(amount):
            evidence_list.append(row_evidence)
            anomaly_triggered.append(False)
            continue
            
        # 1. Global percentile check
        global_pct = df.loc[i, "allocation_amount_percentile_global"]
        if pd.notnull(global_pct) and global_pct > GLOBAL_PERCENTILE_THRESHOLD:
            row_evidence.append(create_evidence(
                detector="cost",
                signal="allocation_amount_percentile_global",
                severity="medium",
                message=f"Allocation amount is in the top {(1-GLOBAL_PERCENTILE_THRESHOLD)*100:.0f}% globally (percentile: {global_pct*100:.1f}%).",
                value=amount,
                reference_value=GLOBAL_PERCENTILE_THRESHOLD,
                unit="percentile"
            ))
            
        # 2. LOO Peer dimensions checks
        for dim in peer_dimensions:
            if dim not in df.columns:
                continue
                
            val = df.loc[i, dim]
            loo_median, loo_mean, loo_std = compute_loo_peer_stats(df, i, dim, val)
            
            if pd.isnull(loo_median):
                continue  # Peer group too small
                
            # A. Ratio vs Median check
            ratio = amount / loo_median if loo_median > 0 else np.nan
            if pd.notnull(ratio) and ratio > PEER_MEDIAN_RATIO_THRESHOLD:
                row_evidence.append(create_evidence(
                    detector="cost",
                    signal=f"amount_vs_peer_{dim}_median_loo",
                    severity="medium",
                    message=f"Allocation is {ratio:.1f}x the median of comparable {dim} works (excluding current).",
                    value=amount,
                    reference_value=loo_median,
                    unit="ratio"
                ))
                
            # B. Z-score check
            if pd.notnull(loo_std) and loo_std > 0:
                zscore = (amount - loo_mean) / loo_std
                if zscore > PEER_ZSCORE_THRESHOLD:
                    row_evidence.append(create_evidence(
                        detector="cost",
                        signal=f"amount_zscore_peer_{dim}_loo",
                        severity="high",
                        message=f"Allocation is an outlier relative to {dim} works (Z-score: {zscore:.2f}, excluding current).",
                        value=amount,
                        reference_value=loo_mean,
                        unit="z-score"
                    ))
                    
        evidence_list.append(row_evidence)
        anomaly_triggered.append(len(row_evidence) > 0)
        
    return evidence_list, anomaly_triggered
