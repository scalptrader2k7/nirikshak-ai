import re
import pandas as pd

def format_evidence_item(ev):
    """
    Converts a raw evidence dictionary into a human-readable explanation string.
    """
    detector = ev.get("detector", "")
    signal = ev.get("signal", "")
    val = ev.get("value")
    ref = ev.get("reference_value")
    msg = ev.get("message", "")
    
    # 1. Cost Formatting
    if detector == "cost":
        # Handle median ratio signal, e.g. amount_vs_peer_state_median_loo
        if signal.startswith("amount_vs_peer_") and "median" in signal:
            # Extract dimension
            dim_part = signal.replace("amount_vs_peer_", "")
            # Split by underscores to get the first part (dimension)
            dim = dim_part.split("_")[0]
            
            try:
                # Calculate ratio if we have value (amount) and reference_value (peer median)
                if pd.notnull(val) and pd.notnull(ref) and float(ref) > 0:
                    ratio = float(val) / float(ref)
                    return f"Allocation is {ratio:.1f}x the median amount among comparable {dim} works."
            except Exception:
                pass
                
        # For other cost signals (Z-score, global percentile), fallback to original message
        return msg
        
    # 2. Exact Duplicate Formatting
    elif detector == "exact_duplicate":
        if pd.notnull(val):
            try:
                count = int(float(val))
                return f"This exact project record appears {count} times in the dataset."
            except Exception:
                pass
        return msg
        
    # 3. Near Duplicate Formatting
    elif detector == "near_duplicate":
        return "This project has a high contextual similarity with related project records."
        
    # 4. Pattern Formatting
    elif detector == "pattern":
        return "This recommendation occurred during an unusually high concentration of recommendations within the observed 30-day period."
        
    # 5. Fallback
    return msg
