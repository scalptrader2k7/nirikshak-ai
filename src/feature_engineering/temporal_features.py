import pandas as pd
import numpy as np

def compute_rolling_burst(df_sorted, entity_col, date_col="recommended_date_dt", window_days=30):
    """
    Computes a leakage-free rolling count of recommendations for a given entity.
    Only looks at past/current records chronologically.
    """
    dates = df_sorted[date_col]
    entities = df_sorted[entity_col]
    
    rolling_counts = []
    for i in range(len(df_sorted)):
        current_date = dates.iloc[i]
        current_entity = entities.iloc[i]
        
        if pd.isnull(current_date) or current_date == "":
            rolling_counts.append(0)
            continue
            
        # Get historical slice up to the current row
        slice_dates = dates.iloc[:i+1]
        slice_entities = entities.iloc[:i+1]
        
        # Calculate window boundary
        window_start = current_date - pd.Timedelta(days=window_days)
        
        # Filter for rows matching the entity within the [T - window, T] window
        match_mask = (slice_entities == current_entity) & (slice_dates >= window_start)
        rolling_counts.append(int(match_mask.sum()))
        
    return rolling_counts

def compute_temporal_features(df):
    """
    Computes temporal features and burst signals from recommended_date.
    """
    temp_df = pd.DataFrame(index=df.index)
    
    # Parse recommended_date to datetime temporarily for calculations
    dates_dt = pd.to_datetime(df["recommended_date"], errors="coerce")
    
    # 1. Date parts
    temp_df["recommendation_year"] = dates_dt.dt.year.fillna(-1).astype(int)
    temp_df["recommendation_month"] = dates_dt.dt.month.fillna(-1).astype(int)
    temp_df["recommendation_quarter"] = dates_dt.dt.quarter.fillna(-1).astype(int)
    temp_df["recommendation_day_of_week"] = dates_dt.dt.dayofweek.fillna(-1).astype(int)
    temp_df["recommendation_day_of_month"] = dates_dt.dt.day.fillna(-1).astype(int)
    
    # Create helper columns for aggregations
    df_calc = df.copy()
    df_calc["recommended_date_dt"] = dates_dt
    df_calc["year_month"] = dates_dt.dt.strftime("%Y-%m")
    
    # 2. Monthly aggregates (e.g. total recommendation counts in the calendar month)
    # These are descriptive aggregates over the dataset
    mp_month_counts = df_calc.groupby(["mp_name", "year_month"])["work"].transform("count")
    const_month_counts = df_calc.groupby(["constituency", "year_month"])["work"].transform("count")
    
    temp_df["mp_recommendations_in_month"] = mp_month_counts.fillna(0).astype(int)
    temp_df["constituency_recommendations_in_month"] = const_month_counts.fillna(0).astype(int)
    
    # 3. Leakage-safe rolling burst signals
    # To prevent leakage, we sort chronologically by date first, compute, and then map back to original index
    df_calc["orig_index"] = df_calc.index
    df_sorted = df_calc.sort_values(by="recommended_date_dt").copy()
    
    mp_burst = compute_rolling_burst(df_sorted, "mp_name", "recommended_date_dt", window_days=30)
    const_burst = compute_rolling_burst(df_sorted, "constituency", "recommended_date_dt", window_days=30)
    
    df_sorted["mp_recommendations_rolling_30d"] = mp_burst
    df_sorted["constituency_recommendations_rolling_30d"] = const_burst
    
    # Restore original row ordering
    df_restored = df_sorted.sort_values(by="orig_index")
    
    temp_df["mp_recommendations_rolling_30d"] = df_restored["mp_recommendations_rolling_30d"].astype(int)
    temp_df["constituency_recommendations_rolling_30d"] = df_restored["constituency_recommendations_rolling_30d"].astype(int)
    
    return temp_df
