import os
import tempfile
import shutil
import pandas as pd
import numpy as np
import pytest
from src.feature_engineering.text_features import clean_text_for_features, compute_text_features
from src.feature_engineering.amount_features import compute_amount_features
from src.feature_engineering.temporal_features import compute_temporal_features, compute_rolling_burst
from src.feature_engineering.location_features import compute_location_features
from src.feature_engineering.duplicate_features import compute_duplicate_features
from src.feature_engineering.build_features import run_feature_engineering_pipeline, build_entity_features

def test_clean_text_for_features():
    assert clean_text_for_features("NA - Road Construction") == "na road construction"
    assert clean_text_for_features("   Water   Tank  !! ") == "water tank"
    assert clean_text_for_features(np.nan) == ""

def test_text_features_keyword_flags():
    # Mock df with different descriptions
    df = pd.DataFrame({
        "work": [
            "NA - Installing community drinking water plants and road construction", # water + road
            "NA - Construction of community halls", # building
            "NA - Street lights and solar energy", # electrical
            "Some other random thing" # other
        ]
    })
    text_features = compute_text_features(df)
    
    # Check row counts
    assert len(text_features) == 4
    
    # Check independent keyword flags
    # Row 0 contains water ("drinking", "water") AND road ("road") keywords
    assert text_features.loc[0, "work_has_water_keyword"] == True
    assert text_features.loc[0, "work_has_road_keyword"] == True
    assert text_features.loc[0, "work_has_building_keyword"] == False
    
    # Row 1 contains building keyword
    assert text_features.loc[1, "work_has_building_keyword"] == True
    assert text_features.loc[1, "work_has_water_keyword"] == False
    
    # Row 2 contains electrical keywords
    assert text_features.loc[2, "work_has_electrical_keyword"] == True
    
    # check convenience work_type classification (water has higher priority than road in our priority list)
    assert text_features.loc[0, "work_type"] == "water"
    assert text_features.loc[3, "work_type"] == "other"

def test_amount_features_peer_groups():
    # Mock data to test small group handling (min size 5)
    # Group 'A' has size 6, group 'B' has size 2
    df = pd.DataFrame({
        "state": ["A", "A", "A", "A", "A", "A", "B", "B"],
        "allocation_amount": [100.0, 200.0, 300.0, 400.0, 500.0, 600.0, 1000.0, 2000.0]
    })
    
    work_types = pd.Series(["water"] * 8)
    amount_features = compute_amount_features(df, work_types)
    
    # Check global features
    assert amount_features.loc[0, "allocation_amount_log"] == np.log1p(100.0)
    assert amount_features.loc[0, "allocation_amount_percentile_global"] == 0.125
    assert amount_features.loc[7, "allocation_amount_percentile_global"] == 1.0
    
    # Check peer group 'A' (size 6 >= 5) -> statistics should be populated
    assert amount_features.loc[0, "peer_state_count"] == 6
    assert amount_features.loc[0, "peer_state_median_amount"] == 350.0 # median of [100..600]
    assert amount_features.loc[0, "peer_state_mean_amount"] == 350.0 # mean
    assert amount_features.loc[0, "amount_vs_peer_state_median"] == 100.0 / 350.0
    assert not pd.isnull(amount_features.loc[0, "amount_zscore_peer_state"])
    
    # Check peer group 'B' (size 2 < 5) -> statistics must be NaN
    assert amount_features.loc[6, "peer_state_count"] == 2
    assert pd.isnull(amount_features.loc[6, "peer_state_median_amount"])
    assert pd.isnull(amount_features.loc[6, "peer_state_mean_amount"])
    assert pd.isnull(amount_features.loc[6, "peer_state_std_amount"])
    assert pd.isnull(amount_features.loc[6, "amount_vs_peer_state_median"])
    assert pd.isnull(amount_features.loc[6, "amount_zscore_peer_state"])

def test_amount_features_nulls_and_zero_std():
    # Handle std == 0 safely
    df = pd.DataFrame({
        "state": ["A"] * 6,
        "allocation_amount": [100.0] * 6 # std is 0
    })
    work_types = pd.Series(["water"] * 6)
    amount_features = compute_amount_features(df, work_types)
    
    # std should be 0.0, and zscore should be 0.0 (no division by zero error)
    assert amount_features.loc[0, "peer_state_std_amount"] == 0.0
    assert amount_features.loc[0, "amount_zscore_peer_state"] == 0.0

def test_temporal_features_and_leakage():
    df = pd.DataFrame({
        "recommended_date": [
            "2024-03-01",
            "2024-03-02",
            "2024-03-10",
            "2024-03-15",
            "2024-04-01"
        ],
        "mp_name": ["MP1", "MP1", "MP1", "MP1", "MP1"],
        "constituency": ["C1", "C1", "C1", "C1", "C1"],
        "work": ["W1", "W2", "W3", "W4", "W5"]
    })
    
    temp_features = compute_temporal_features(df)
    
    # Check date extraction
    assert temp_features.loc[0, "recommendation_year"] == 2024
    assert temp_features.loc[0, "recommendation_month"] == 3
    assert temp_features.loc[0, "recommendation_quarter"] == 1
    assert temp_features.loc[0, "recommendation_day_of_week"] == 4 # Friday
    assert temp_features.loc[0, "recommendation_day_of_month"] == 1
    
    # Monthly aggregate: all 4 recommendations for MP1 in March 2024
    assert temp_features.loc[0, "mp_recommendations_in_month"] == 4
    # The one in April is 1
    assert temp_features.loc[4, "mp_recommendations_in_month"] == 1
    
    # Leakage-safe rolling count check (window_days = 30)
    # Sorted order of dates: 03-01 (1), 03-02 (2), 03-10 (3), 03-15 (4), 04-01 (5)
    # Day 04-01 (row 4) is exactly 31 days after 03-01, so row 0 is outside its 30d window
    # Valid dates in window for 04-01: 03-02, 03-10, 03-15, 04-01 (4 records)
    assert temp_features.loc[0, "mp_recommendations_rolling_30d"] == 1 # only row 0
    assert temp_features.loc[1, "mp_recommendations_rolling_30d"] == 2 # row 0, 1
    assert temp_features.loc[4, "mp_recommendations_rolling_30d"] == 4 # row 1, 2, 3, 4

def test_location_features():
    df = pd.DataFrame({
        "state": ["Rajasthan", "Bihar", "Assam"],
        "constituency": ["C1", "C2", np.nan],
        "city": ["", "Patna", "nan"],
        "ward": [np.nan, "Ward 2", "None"],
        "block": ["B1", "", "B3"],
        "village": ["V1", "V2", "V3"]
    })
    
    loc_features = compute_location_features(df)
    
    # Completeness scoring (out of 6 columns: state, constituency, city, ward, block, village)
    # Row 0: state, constituency, block, village (4 present / 6) -> 2/3 (0.667)
    assert loc_features.loc[0, "location_completeness_score"] == pytest.approx(4/6)
    assert loc_features.loc[0, "has_city"] == False
    assert loc_features.loc[0, "has_ward"] == False
    assert loc_features.loc[0, "has_block"] == True
    
    # Verify Location key
    assert loc_features.loc[0, "location_key"] == "Rajasthan|C1|||B1|V1"
    assert loc_features.loc[1, "location_key"] == "Bihar|C2|Patna|Ward 2||V2"

def test_duplicate_features():
    df = pd.DataFrame({
        "state": ["Rajasthan", "Bihar"],
        "constituency": ["C1", "C2"],
        "exact_duplicate_group_id": ["g1", "g2"],
        "duplicate_occurrence_count": [3, 1]
    })
    
    work_types = pd.Series(["water", "road"])
    dup_features = compute_duplicate_features(df, work_types)
    
    assert dup_features.loc[0, "is_exact_duplicate"] == True
    assert dup_features.loc[1, "is_exact_duplicate"] == False
    assert dup_features.loc[0, "blocking_key_work_type_state"] == "water_rajasthan"
    assert dup_features.loc[0, "blocking_key_work_type_constituency"] == "water_c1"

def test_idempotency_and_e2e():
    temp_dir = tempfile.mkdtemp()
    try:
        # Create a small mock dataset in data/processed format
        df = pd.DataFrame({
            "mp_name": ["Manoj Rajoria"] * 6,
            "work": ["NA - Installing community drinking water plants"] * 6,
            "category": ["Normal/Others"] * 6,
            "state": ["Rajasthan"] * 6,
            "constituency": ["KARAULI-DHOLPUR(SC)"] * 6,
            "ida": ["DISTRICT COLLECTOR DHOLPUR_IDA"] * 6,
            "city": [np.nan] * 6,
            "ward": [np.nan] * 6,
            "block": ["Sepau"] * 6,
            "village": ["Kaithri"] * 6,
            "recommended_date": ["2024-03-04"] * 6,
            "allocation_amount": [100000.0] * 6,
            "ida_approval": ["Action Pending"] * 6,
            "status": ["Unsanctioned"] * 6,
            "house": ["Lok Sabha"] * 6,
            "allocation_amount_is_missing": [False] * 6,
            "original_row_index": list(range(6)),
            "exact_duplicate_group_id": ["hash1"] * 6,
            "duplicate_occurrence_count": [6] * 6
        })
        
        input_csv = os.path.join(temp_dir, "clean_input.csv")
        output_csv = os.path.join(temp_dir, "features_output.csv")
        manifest_json = os.path.join(temp_dir, "manifest.json")
        
        df.to_csv(input_csv, index=False)
        
        # Run first time
        run_feature_engineering_pipeline(input_csv, output_csv, manifest_json)
        
        df_out_1 = pd.read_csv(output_csv)
        assert len(df_out_1) == 6
        
        # Run second time
        run_feature_engineering_pipeline(input_csv, output_csv, manifest_json)
        df_out_2 = pd.read_csv(output_csv)
        
        # Check idempotency: outputs must be identical
        pd.testing.assert_frame_equal(df_out_1, df_out_2)
        
    finally:
        shutil.rmtree(temp_dir)
