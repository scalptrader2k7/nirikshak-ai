import pandas as pd
import numpy as np
from src.anomaly_detection.config import (
    PATTERN_PERCENTILE_THRESHOLD,
    PATTERN_MIN_COUNT_THRESHOLD
)
from src.anomaly_detection.evidence import create_evidence

def detect_pattern_anomalies(df):
    """
    Identifies pattern anomalies based on statistical distributions.
    
    Adjustments applied:
    - Dynamic percentile threshold calculation from the current dataset.
    - Enforces a minimum absolute count threshold.
    """
    evidence_list = []
    anomaly_triggered = []
    
    # Calculate thresholds dynamically based on the 95th percentile (or config) of current dataset
    mp_series = df["mp_recommendations_rolling_30d"].dropna()
    const_series = df["constituency_recommendations_rolling_30d"].dropna()
    
    # Fallback to config minimum if series is empty
    mp_95_pct = mp_series.quantile(PATTERN_PERCENTILE_THRESHOLD) if len(mp_series) > 0 else PATTERN_MIN_COUNT_THRESHOLD
    const_95_pct = const_series.quantile(PATTERN_PERCENTILE_THRESHOLD) if len(const_series) > 0 else PATTERN_MIN_COUNT_THRESHOLD * 1.5
    
    # Enforce minimum absolute count constraint
    mp_threshold = max(float(mp_95_pct), float(PATTERN_MIN_COUNT_THRESHOLD))
    const_threshold = max(float(const_95_pct), float(PATTERN_MIN_COUNT_THRESHOLD * 1.5))
    
    print(f"Dynamic rolling 30d thresholds computed: MP >= {mp_threshold:.1f}, Constituency >= {const_threshold:.1f}")
    
    for i in range(len(df)):
        row_evidence = []
        
        mp_rolling = df.loc[i, "mp_recommendations_rolling_30d"]
        const_rolling = df.loc[i, "constituency_recommendations_rolling_30d"]
        
        # 1. MP rolling burst
        if pd.notnull(mp_rolling) and mp_rolling >= mp_threshold:
            row_evidence.append(create_evidence(
                detector="pattern",
                signal="mp_recommendations_rolling_30d",
                severity="medium",
                message=f"Recommendation activity is unusually concentrated. MP has recommended {int(mp_rolling)} works in a rolling 30-day period (threshold: {mp_threshold:.1f}).",
                value=mp_rolling,
                reference_value=mp_threshold,
                unit="works"
            ))
            
        # 2. Constituency rolling burst
        if pd.notnull(const_rolling) and const_rolling >= const_threshold:
            row_evidence.append(create_evidence(
                detector="pattern",
                signal="constituency_recommendations_rolling_30d",
                severity="medium",
                message=f"Recommendation activity is unusually concentrated. Constituency has {int(const_rolling)} works recommended in a rolling 30-day period (threshold: {const_threshold:.1f}).",
                value=const_rolling,
                reference_value=const_threshold,
                unit="works"
            ))
            
        evidence_list.append(row_evidence)
        anomaly_triggered.append(len(row_evidence) > 0)
        
    return evidence_list, anomaly_triggered, (mp_threshold, const_threshold)
