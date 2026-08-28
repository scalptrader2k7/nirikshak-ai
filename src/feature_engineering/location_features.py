import pandas as pd
import numpy as np

def is_present(val):
    if pd.isnull(val):
        return False
    s = str(val).strip()
    return s != "" and s.lower() != "nan" and s.lower() != "none"

def compute_location_features(df):
    """
    Computes location completeness and unique location keys.
    """
    loc_df = pd.DataFrame(index=df.index)
    
    # Location columns to check
    loc_cols = ["state", "constituency", "city", "ward", "block", "village"]
    
    # 1. Individual flags
    loc_df["has_city"] = df["city"].apply(is_present)
    loc_df["has_ward"] = df["ward"].apply(is_present)
    loc_df["has_block"] = df["block"].apply(is_present)
    loc_df["has_village"] = df["village"].apply(is_present)
    
    # 2. Location completeness score
    # Count how many of the 6 columns are present for each row
    present_counts = df[loc_cols].map(is_present).sum(axis=1)
    loc_df["location_completeness_score"] = present_counts / len(loc_cols)
    
    # 3. Location key
    # Concat values of present columns with pipe, missing fields replaced by empty string
    def build_key(row):
        parts = []
        for col in loc_cols:
            val = row[col]
            if is_present(val):
                parts.append(str(val).strip())
            else:
                parts.append("")
        return "|".join(parts)
        
    loc_df["location_key"] = df.apply(build_key, axis=1)
    
    return loc_df
