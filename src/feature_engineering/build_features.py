import os
import json
import pandas as pd
import numpy as np
from datetime import datetime

from src.feature_engineering.text_features import compute_text_features
from src.feature_engineering.amount_features import compute_amount_features
from src.feature_engineering.temporal_features import compute_temporal_features
from src.feature_engineering.location_features import compute_location_features
from src.feature_engineering.duplicate_features import compute_duplicate_features

def build_entity_features(df):
    """
    Computes entity-level work count features.
    """
    entity_df = pd.DataFrame(index=df.index)
    entity_df["mp_work_count"] = df.groupby("mp_name")["work"].transform("count").astype(int)
    entity_df["constituency_work_count"] = df.groupby("constituency")["work"].transform("count").astype(int)
    entity_df["state_work_count"] = df.groupby("state")["work"].transform("count").astype(int)
    entity_df["ida_work_count"] = df.groupby("ida")["work"].transform("count").astype(int)
    return entity_df

def run_feature_engineering_pipeline(input_path, output_path, manifest_path):
    print(f"Reading cleaned data from {input_path}...")
    df = pd.read_csv(input_path)
    initial_rows = len(df)
    
    # 1. Compute text features
    print("Computing text features...")
    text_df = compute_text_features(df)
    
    # 2. Compute amount features
    print("Computing amount features...")
    amount_df = compute_amount_features(df, text_df["work_type"])
    
    # 3. Compute temporal features
    print("Computing temporal features...")
    temp_df = compute_temporal_features(df)
    
    # 4. Compute location features
    print("Computing location features...")
    loc_df = compute_location_features(df)
    
    # 5. Compute entity features
    print("Computing entity features...")
    ent_df = build_entity_features(df)
    
    # 6. Compute duplicate features
    print("Computing duplicate features...")
    dup_df = compute_duplicate_features(df, text_df["work_type"])
    
    # Combine everything
    # We want to keep original cleaned fields and append all newly engineered columns
    # We drop columns from sub-dataframes if they already exist in the original df
    # but we preserved them intentionally in duplicate features (exact_duplicate_group_id, duplicate_occurrence_count).
    # To avoid duplicates, we drop duplicate columns from sub-dfs before concat.
    dup_df_clean = dup_df.drop(columns=["exact_duplicate_group_id", "duplicate_occurrence_count"])
    
    features_df = pd.concat([df, text_df, amount_df, temp_df, loc_df, ent_df, dup_df_clean], axis=1)
    
    # Validation checks
    assert len(features_df) == initial_rows, f"Row count mismatch: {len(features_df)} vs {initial_rows}"
    print(f"Row count preservation verified: {len(features_df)} rows.")
    
    # Replace infinities with NaN if any (safety check)
    features_df = features_df.replace([np.inf, -np.inf], np.nan)
    
    # Save output dataset
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    features_df.to_csv(output_path, index=False)
    print(f"Saved engineered features dataset to {output_path}")
    
    # Build and write feature manifest
    generate_feature_manifest(features_df, df.columns, manifest_path)

def generate_feature_manifest(df, original_cols, manifest_path):
    """
    Generates a structured manifest JSON file documenting all engineered features.
    """
    engineered_cols = [col for col in df.columns if col not in original_cols]
    
    # Manifest descriptions dictionary
    manifest_entries = {}
    
    # Describe text features
    manifest_entries["normalized_work_text"] = {
        "source_columns": ["work"],
        "data_type": "string",
        "description": "Lowercase work description with punctuation removed and whitespace collapsed.",
        "transformation": "Text cleaning regex and space collapsing.",
        "use_for_anomaly_detection": False,
        "limitations": "Does not capture semantic meaning."
    }
    manifest_entries["work_text_length"] = {
        "source_columns": ["work"],
        "data_type": "integer",
        "description": "Character count of the raw work description.",
        "transformation": "Character length count.",
        "use_for_anomaly_detection": True,
        "limitations": "Varies by general wording style."
    }
    manifest_entries["work_word_count"] = {
        "source_columns": ["work"],
        "data_type": "integer",
        "description": "Word count of the cleaned work description.",
        "transformation": "Splitting text by whitespace.",
        "use_for_anomaly_detection": True,
        "limitations": "Varies by general wording style."
    }
    manifest_entries["work_unique_word_count"] = {
        "source_columns": ["work"],
        "data_type": "integer",
        "description": "Unique word count of the cleaned work description.",
        "transformation": "Unique set split count.",
        "use_for_anomaly_detection": True,
        "limitations": "None."
    }
    manifest_entries["work_type"] = {
        "source_columns": ["work"],
        "data_type": "string",
        "description": "Primary convenience category mapping of the work description.",
        "transformation": "Regex keyword matching with defined priorities: water > road > building > drainage > electrical > school > health > repair.",
        "use_for_anomaly_detection": True,
        "limitations": "Heuristic-based convenience category; might map to 'other' if no keywords are matched."
    }
    
    # Keywords
    for cat in ["road", "building", "water", "electrical", "school", "health", "drainage", "repair"]:
        manifest_entries[f"work_has_{cat}_keyword"] = {
            "source_columns": ["work"],
            "data_type": "boolean",
            "description": f"True if work description contains matching keywords for '{cat}'.",
            "transformation": f"Case-insensitive regex matching for keywords related to '{cat}'.",
            "use_for_anomaly_detection": True,
            "limitations": "Dependent on the predefined keyword dictionary."
        }
        
    # Amount features
    manifest_entries["allocation_amount_log"] = {
        "source_columns": ["allocation_amount"],
        "data_type": "float",
        "description": "Natural log transform of the allocation amount (log1p).",
        "transformation": "log(1 + x)",
        "use_for_anomaly_detection": True,
        "limitations": "None."
    }
    manifest_entries["allocation_amount_percentile_global"] = {
        "source_columns": ["allocation_amount"],
        "data_type": "float",
        "description": "Percentile rank of the allocation amount across the entire dataset.",
        "transformation": "Fractional rank from 0.0 to 1.0.",
        "use_for_anomaly_detection": True,
        "limitations": "Highly dependent on the distribution of current sample."
    }
    
    peer_dims = ["state", "house", "mp_name", "constituency", "ida", "work_type"]
    for dim in peer_dims:
        manifest_entries[f"peer_{dim}_count"] = {
            "source_columns": [dim],
            "data_type": "integer",
            "description": f"Total count of records sharing the same {dim}.",
            "transformation": f"Group count by {dim}.",
            "use_for_anomaly_detection": False,
            "limitations": "Descriptive statistic of current dataset."
        }
        manifest_entries[f"peer_{dim}_median_amount"] = {
            "source_columns": [dim, "allocation_amount"],
            "data_type": "float",
            "description": f"Median allocation amount for the peer group sharing the same {dim}.",
            "transformation": f"Group median. Set to NaN if group size < 5.",
            "use_for_anomaly_detection": False,
            "limitations": "Descriptive statistic of current dataset. Suppressed for small groups."
        }
        manifest_entries[f"peer_{dim}_mean_amount"] = {
            "source_columns": [dim, "allocation_amount"],
            "data_type": "float",
            "description": f"Mean allocation amount for the peer group sharing the same {dim}.",
            "transformation": f"Group mean. Set to NaN if group size < 5.",
            "use_for_anomaly_detection": False,
            "limitations": "Descriptive statistic of current dataset. Suppressed for small groups."
        }
        manifest_entries[f"peer_{dim}_std_amount"] = {
            "source_columns": [dim, "allocation_amount"],
            "data_type": "float",
            "description": f"Standard deviation of allocation amount for the peer group sharing the same {dim}.",
            "transformation": f"Group standard deviation. Set to NaN if group size < 5.",
            "use_for_anomaly_detection": False,
            "limitations": "Descriptive statistic of current dataset. Suppressed for small groups."
        }
        manifest_entries[f"amount_vs_peer_{dim}_median"] = {
            "source_columns": ["allocation_amount", f"peer_{dim}_median_amount"],
            "data_type": "float",
            "description": f"Ratio of the record's allocation amount vs the peer median of group {dim}.",
            "transformation": f"allocation_amount / peer_{dim}_median_amount. Set to NaN if group size < 5.",
            "use_for_anomaly_detection": True,
            "limitations": "Descriptive comparison only. Suppressed for small groups."
        }
        manifest_entries[f"amount_zscore_peer_{dim}"] = {
            "source_columns": ["allocation_amount", f"peer_{dim}_mean_amount", f"peer_{dim}_std_amount"],
            "data_type": "float",
            "description": f"Z-score of the allocation amount within peer group {dim}.",
            "transformation": f"(amount - mean) / std. Set to NaN if group size < 5 or std is undefined/NaN.",
            "use_for_anomaly_detection": True,
            "limitations": "Descriptive comparison only. Suppressed for small groups. Zero standard deviation maps to 0.0."
        }
        
    # Temporal features
    manifest_entries["recommendation_year"] = {
        "source_columns": ["recommended_date"],
        "data_type": "integer",
        "description": "Calendar year extracted from recommended_date.",
        "transformation": "Datetime year component.",
        "use_for_anomaly_detection": False,
        "limitations": "None."
    }
    manifest_entries["recommendation_month"] = {
        "source_columns": ["recommended_date"],
        "data_type": "integer",
        "description": "Calendar month (1-12) extracted from recommended_date.",
        "transformation": "Datetime month component.",
        "use_for_anomaly_detection": True,
        "limitations": "None."
    }
    manifest_entries["recommendation_quarter"] = {
        "source_columns": ["recommended_date"],
        "data_type": "integer",
        "description": "Calendar quarter (1-4) extracted from recommended_date.",
        "transformation": "Datetime quarter component.",
        "use_for_anomaly_detection": False,
        "limitations": "None."
    }
    manifest_entries["recommendation_day_of_week"] = {
        "source_columns": ["recommended_date"],
        "data_type": "integer",
        "description": "Day of the week (0=Monday to 6=Sunday) extracted from recommended_date.",
        "transformation": "Datetime dayofweek component.",
        "use_for_anomaly_detection": True,
        "limitations": "None."
    }
    manifest_entries["recommendation_day_of_month"] = {
        "source_columns": ["recommended_date"],
        "data_type": "integer",
        "description": "Day of the month (1-31) extracted from recommended_date.",
        "transformation": "Datetime day component.",
        "use_for_anomaly_detection": False,
        "limitations": "None."
    }
    manifest_entries["mp_recommendations_in_month"] = {
        "source_columns": ["mp_name", "recommended_date"],
        "data_type": "integer",
        "description": "Count of recommendations made by the same MP in that calendar month.",
        "transformation": "Group count by MP and Year-Month.",
        "use_for_anomaly_detection": True,
        "limitations": "Descriptive calendar-month aggregate. Boundary effects apply at month start/end."
    }
    manifest_entries["constituency_recommendations_in_month"] = {
        "source_columns": ["constituency", "recommended_date"],
        "data_type": "integer",
        "description": "Count of recommendations made in the same constituency in that calendar month.",
        "transformation": "Group count by constituency and Year-Month.",
        "use_for_anomaly_detection": True,
        "limitations": "Descriptive calendar-month aggregate. Boundary effects apply."
    }
    manifest_entries["mp_recommendations_rolling_30d"] = {
        "source_columns": ["mp_name", "recommended_date"],
        "data_type": "integer",
        "description": "Rolling count of recommendations made by the same MP in the last 30 days.",
        "transformation": "Chronomax rolling window count [T-30d, T] up to current record. Leakage-free.",
        "use_for_anomaly_detection": True,
        "limitations": "Requires sorted historical alignment. Sensitive to date correctness."
    }
    manifest_entries["constituency_recommendations_rolling_30d"] = {
        "source_columns": ["constituency", "recommended_date"],
        "data_type": "integer",
        "description": "Rolling count of recommendations made in the same constituency in the last 30 days.",
        "transformation": "Chronomax rolling window count [T-30d, T] up to current record. Leakage-free.",
        "use_for_anomaly_detection": True,
        "limitations": "Requires sorted historical alignment."
    }
    
    # Location features
    manifest_entries["has_city"] = {
        "source_columns": ["city"],
        "data_type": "boolean",
        "description": "True if city is populated.",
        "transformation": "Non-null and non-empty checks.",
        "use_for_anomaly_detection": True,
        "limitations": "None."
    }
    manifest_entries["has_ward"] = {
        "source_columns": ["ward"],
        "data_type": "boolean",
        "description": "True if ward is populated.",
        "transformation": "Non-null and non-empty checks.",
        "use_for_anomaly_detection": True,
        "limitations": "None."
    }
    manifest_entries["has_block"] = {
        "source_columns": ["block"],
        "data_type": "boolean",
        "description": "True if block is populated.",
        "transformation": "Non-null and non-empty checks.",
        "use_for_anomaly_detection": True,
        "limitations": "None."
    }
    manifest_entries["has_village"] = {
        "source_columns": ["village"],
        "data_type": "boolean",
        "description": "True if village is populated.",
        "transformation": "Non-null and non-empty checks.",
        "use_for_anomaly_detection": True,
        "limitations": "None."
    }
    manifest_entries["location_completeness_score"] = {
        "source_columns": ["state", "constituency", "city", "ward", "block", "village"],
        "data_type": "float",
        "description": "Fraction of location columns containing valid values.",
        "transformation": "Count of populated location columns / 6.",
        "use_for_anomaly_detection": True,
        "limitations": "Assumes equal weight for all location dimensions."
    }
    manifest_entries["location_key"] = {
        "source_columns": ["state", "constituency", "city", "ward", "block", "village"],
        "data_type": "string",
        "description": "Deterministic pipe-separated location key.",
        "transformation": "Joining non-empty location values.",
        "use_for_anomaly_detection": False,
        "limitations": "Empty fields are left blank within the separators."
    }
    
    # Entity features
    manifest_entries["mp_work_count"] = {
        "source_columns": ["mp_name"],
        "data_type": "integer",
        "description": "Total count of works recommended by this MP in the current dataset.",
        "transformation": "Global dataset count per MP.",
        "use_for_anomaly_detection": False,
        "limitations": "Descriptive feature of the current sample."
    }
    manifest_entries["constituency_work_count"] = {
        "source_columns": ["constituency"],
        "data_type": "integer",
        "description": "Total count of works recommended in this constituency in the current dataset.",
        "transformation": "Global dataset count per constituency.",
        "use_for_anomaly_detection": False,
        "limitations": "Descriptive feature of the current sample."
    }
    manifest_entries["state_work_count"] = {
        "source_columns": ["state"],
        "data_type": "integer",
        "description": "Total count of works recommended in this state in the current dataset.",
        "transformation": "Global dataset count per state.",
        "use_for_anomaly_detection": False,
        "limitations": "Descriptive feature of the current sample."
    }
    manifest_entries["ida_work_count"] = {
        "source_columns": ["ida"],
        "data_type": "integer",
        "description": "Total count of works assigned to this IDA in the current dataset.",
        "transformation": "Global dataset count per IDA.",
        "use_for_anomaly_detection": False,
        "limitations": "Descriptive feature of the current sample."
    }
    
    # Duplicate features
    manifest_entries["is_exact_duplicate"] = {
        "source_columns": ["duplicate_occurrence_count"],
        "data_type": "boolean",
        "description": "True if duplicate_occurrence_count is greater than 1.",
        "transformation": "duplicate_occurrence_count > 1",
        "use_for_anomaly_detection": True,
        "limitations": "Only identifies exact duplicates."
    }
    manifest_entries["blocking_key_work_type_state"] = {
        "source_columns": ["work_type", "state"],
        "data_type": "string",
        "description": "Candidate key combining work_type and state for near-duplicate candidate blocking.",
        "transformation": "Concatenation of work_type and state in lowercase.",
        "use_for_anomaly_detection": False,
        "limitations": "None."
    }
    manifest_entries["blocking_key_work_type_constituency"] = {
        "source_columns": ["work_type", "constituency"],
        "data_type": "string",
        "description": "Candidate key combining work_type and constituency for near-duplicate candidate blocking.",
        "transformation": "Concatenation of work_type and constituency in lowercase.",
        "use_for_anomaly_detection": False,
        "limitations": "None."
    }
    
    # Standardize output format
    manifest = {
        "timestamp": datetime.now().isoformat(),
        "total_engineered_features": len(engineered_cols),
        "features": {col: manifest_entries.get(col, {"error": "Missing manifest documentation"}) for col in engineered_cols}
    }
    
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Wrote feature manifest metadata to {manifest_path}")

if __name__ == "__main__":
    input_file = r"c:\Users\G.VEDAVYAS\Documents\nirikshak\data\processed\mplads_clean.csv"
    output_file = r"c:\Users\G.VEDAVYAS\Documents\nirikshak\data\processed\mplads_features.csv"
    manifest_file = r"c:\Users\G.VEDAVYAS\Documents\nirikshak\data\reports\feature_manifest.json"
    
    run_feature_engineering_pipeline(input_file, output_file, manifest_file)
