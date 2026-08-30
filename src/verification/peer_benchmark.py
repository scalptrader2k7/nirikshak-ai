import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from src.verification.verification_models import PEER_GROUP_MIN_SIZE, PeerBenchmark

def calculate_peer_stats(
    record_id: int,
    db: pd.DataFrame
) -> Dict[str, Any]:
    """
    Calculates peer stats for a given record.
    Excludes the record itself. Falls back from (work_type, state) to nationwide work_type if needed.
    """
    # 1. Fetch current record details
    matches = db[db["original_row_index"] == record_id]
    if len(matches) == 0:
        return {"status": "insufficient_data"}
        
    target_row = matches.iloc[0]
    project_amount = target_row.get("allocation_amount")
    target_state = target_row.get("state")
    target_work_type = target_row.get("work_type")
    
    # Check for invalid or null amount
    if pd.isnull(project_amount) or np.isnan(project_amount) or project_amount is None:
        return {
            "status": "insufficient_data",
            "project_amount": None,
            "peer_count": 0,
            "peer_median": None,
            "peer_mean": None,
            "amount_deviation_percent": None,
            "amount_ratio_to_median": None,
            "peer_group_level": None,
            "peer_scope": None
        }

    # Helper function to compute comparison metrics
    def compute_metrics(peer_amounts: pd.Series, level: str) -> Dict[str, Any]:
        p_median = float(peer_amounts.median())
        p_mean = float(peer_amounts.mean())
        
        if p_median <= 0.0 or pd.isnull(p_median):
            dev = None
            ratio = None
        else:
            dev = ((project_amount - p_median) / p_median) * 100
            ratio = project_amount / p_median
            
        return {
            "status": "success",
            "project_amount": float(project_amount),
            "peer_count": len(peer_amounts),
            "peer_median": p_median,
            "peer_mean": p_mean,
            "amount_deviation_percent": dev,
            "amount_ratio_to_median": ratio,
            "peer_group_level": level,
            "peer_scope": level
        }

    # 2. Try Primary Peer Group: (work_type, state)
    if pd.notnull(target_state) and pd.notnull(target_work_type) and target_state != "" and target_work_type != "":
        local_peers_mask = (
            (db["state"] == target_state) &
            (db["work_type"] == target_work_type) &
            (db["original_row_index"] != record_id) &
            (db["allocation_amount"].notnull()) &
            (~db["allocation_amount"].isna())
        )
        local_peers = db[local_peers_mask]
        if len(local_peers) >= PEER_GROUP_MIN_SIZE:
            return compute_metrics(local_peers["allocation_amount"], "local")

    # 3. Try Fallback Peer Group: (work_type) nationwide
    if pd.notnull(target_work_type) and target_work_type != "":
        national_peers_mask = (
            (db["work_type"] == target_work_type) &
            (db["original_row_index"] != record_id) &
            (db["allocation_amount"].notnull()) &
            (~db["allocation_amount"].isna())
        )
        national_peers = db[national_peers_mask]
        if len(national_peers) >= PEER_GROUP_MIN_SIZE:
            return compute_metrics(national_peers["allocation_amount"], "national")

    # 4. Insufficient Peer Group Data
    return {
        "status": "insufficient_data",
        "project_amount": float(project_amount),
        "peer_count": 0,
        "peer_median": None,
        "peer_mean": None,
        "amount_deviation_percent": None,
        "amount_ratio_to_median": None,
        "peer_group_level": None,
        "peer_scope": None
    }

def get_peer_benchmark(record_id: int, db: pd.DataFrame) -> PeerBenchmark:
    """
    Builds the Pydantic PeerBenchmark model for a record.
    """
    stats = calculate_peer_stats(record_id, db)
    return PeerBenchmark(**stats)
