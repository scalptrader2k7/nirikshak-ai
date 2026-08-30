import pandas as pd
import numpy as np

def compute_amount_features(df, work_type_series):
    """
    Computes monetary and amount-based outlier detection features.
    
    CRITICAL:
    - Minimum peer group size is strictly enforced (size >= 5).
    - These are descriptive peer statistics calculated over the entire current dataset.
      They are not leakage-safe historical statistics. Leave-one-out and historical-only
      rolling z-scores will be handled separately in downstream anomaly detection steps.
    """
    amount_df = pd.DataFrame(index=df.index)
    
    # 1. Log transform allocation amount
    amount_df["allocation_amount_log"] = np.log1p(df["allocation_amount"])
    
    # 2. Global percentile rank
    amount_df["allocation_amount_percentile_global"] = df["allocation_amount"].rank(pct=True)
    
    # 3. Peer benchmarks
    # We combine the work_type series into the temporary dataframe to use it as a peer dimension
    temp_df = df.copy()
    temp_df["work_type"] = work_type_series
    
    peer_dimensions = ["state", "house", "mp_name", "constituency", "ida", "work_type"]
    min_group_size = 5
    
    for dim in peer_dimensions:
        if dim not in temp_df.columns:
            continue
            
        # Group and calculate metrics
        grouped = temp_df.groupby(dim)["allocation_amount"]
        counts = grouped.transform("count")
        
        # Calculate stats
        medians = grouped.transform("median")
        means = grouped.transform("mean")
        stds = grouped.transform("std")
        
        # Mask statistics where group size is < min_group_size
        mask = counts < min_group_size
        
        medians[mask] = np.nan
        means[mask] = np.nan
        stds[mask] = np.nan
        
        # Add stats columns to output
        amount_df[f"peer_{dim}_count"] = counts
        amount_df[f"peer_{dim}_median_amount"] = medians
        amount_df[f"peer_{dim}_mean_amount"] = means
        amount_df[f"peer_{dim}_std_amount"] = stds
        
        # Calculate comparison features
        # 1. Amount vs Peer Median
        amount_df[f"amount_vs_peer_{dim}_median"] = temp_df["allocation_amount"] / medians
        
        # 2. Amount Z-score in Peer Group
        # Handle cases where std is 0 or NaN
        zscores = (temp_df["allocation_amount"] - means) / stds
        # Replace inf or nan with 0 when standard deviation is 0 and value equals mean
        std_zero_mask = (stds == 0) & (temp_df["allocation_amount"] == means)
        zscores[std_zero_mask] = 0.0
        
        # Where standard deviation is 0 but amount differs (mathematically impossible for standard std deviation),
        # or std is NaN, keep zscore as NaN
        amount_df[f"amount_zscore_peer_{dim}"] = zscores
        
    return amount_df
