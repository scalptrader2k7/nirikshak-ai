import pandas as pd
import numpy as np

def compute_duplicate_features(df, work_type_series):
    """
    Preserves exact duplicate markers and computes candidate blocking keys.
    """
    dup_df = pd.DataFrame(index=df.index)
    
    # 1. Exact duplicate fields
    dup_df["exact_duplicate_group_id"] = df["exact_duplicate_group_id"]
    dup_df["duplicate_occurrence_count"] = df["duplicate_occurrence_count"]
    dup_df["is_exact_duplicate"] = df["duplicate_occurrence_count"] > 1
    
    # 2. Blocking keys for future near-duplicate analysis
    # Concat work_type with state and constituency
    work_types_clean = work_type_series.astype(str).str.strip().str.lower()
    states_clean = df["state"].astype(str).str.strip().str.lower()
    constituencies_clean = df["constituency"].astype(str).str.strip().str.lower()
    
    dup_df["blocking_key_work_type_state"] = work_types_clean + "_" + states_clean
    dup_df["blocking_key_work_type_constituency"] = work_types_clean + "_" + constituencies_clean
    
    return dup_df
