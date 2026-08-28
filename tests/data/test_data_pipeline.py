import os
import tempfile
import shutil
import hashlib
import pytest
import pandas as pd
import numpy as np
from src.data_pipeline.clean_data import (
    clean_text,
    clean_column_name,
    parse_allocation_amount,
    parse_recommended_date,
    generate_row_hash,
    run_cleaning_pipeline
)

def test_clean_text():
    # Trim whitespace
    assert clean_text("  hello world  ") == "hello world"
    # Collapse multiple spaces
    assert clean_text("hello   world") == "hello world"
    # Strip quotes
    assert clean_text('"hello"\'world\'') == "helloworld"
    # Null values
    assert pd.isnull(clean_text(np.nan))

def test_clean_column_name():
    assert clean_column_name("MP NAME") == "mp_name"
    assert clean_column_name("  IDA APPROVAL  ") == "ida_approval"
    assert clean_column_name("RECOMMENDED-DATE") == "recommended_date"
    assert clean_column_name('"HOUSE"') == "house"

def test_parse_allocation_amount():
    assert parse_allocation_amount("100000") == 100000.0
    assert parse_allocation_amount("1,00,000") == 100000.0
    assert parse_allocation_amount(' "4,87,000" ') == 487000.0
    assert pd.isnull(parse_allocation_amount("NA"))
    assert pd.isnull(parse_allocation_amount(""))
    assert pd.isnull(parse_allocation_amount(np.nan))

def test_parse_recommended_date():
    assert parse_recommended_date("2024-03-04") == pd.Timestamp("2024-03-04")
    assert pd.isnull(parse_recommended_date("invalid-date"))
    assert pd.isnull(parse_recommended_date(""))
    assert pd.isnull(parse_recommended_date(np.nan))

def test_generate_row_hash():
    row1 = pd.Series({"col1": "val1", "col2": "val2"})
    row2 = pd.Series({"col1": "val1", "col2": "val2"})
    row3 = pd.Series({"col1": "val1", "col2": "val3"})
    
    hash1 = generate_row_hash(row1)
    hash2 = generate_row_hash(row2)
    hash3 = generate_row_hash(row3)
    
    assert hash1 == hash2
    assert hash1 != hash3

def test_raw_dataset_protection():
    # Verify that the cleaning pipeline does not modify the raw CSV file
    temp_dir = tempfile.mkdtemp()
    try:
        raw_csv_content = (
            '"MP NAME";"WORK";"CATEGORY";"STATE";"CONSTITUENCY";"IDA";"CITY";"WARD";"BLOCK";"VILLAGE";"RECOMMENDED DATE";"ALLOCATION AMOUNT";"IDA APPROVAL";"STATUS";"HOUSE"\n'
            '"Manoj Rajoria";"NA - Street lights";"Normal/Others";"Rajasthan";"KARAULI-DHOLPUR(SC)";"DISTRICT COLLECTOR DHOLPUR_IDA";"";"";"Sepau";"Kaithri";"2024-03-04";"500000";"Action Pending";"Unsanctioned";"Lok Sabha"\n'
        )
        raw_file = os.path.join(temp_dir, "test_raw.csv")
        processed_file = os.path.join(temp_dir, "test_processed.csv")
        report_file = os.path.join(temp_dir, "test_report.md")
        
        with open(raw_file, "w", encoding="utf-8") as f:
            f.write(raw_csv_content)
            
        hash_before = hashlib.md5(open(raw_file, "rb").read()).hexdigest()
        
        # Run pipeline
        run_cleaning_pipeline(raw_file, processed_file, report_file)
        
        hash_after = hashlib.md5(open(raw_file, "rb").read()).hexdigest()
        
        # Check that hash did not change
        assert hash_before == hash_after
    finally:
        shutil.rmtree(temp_dir)

def test_e2e_cleaning_pipeline_with_fixture():
    # Run the pipeline on a small mock fixture containing normal cases, missing values, and duplicates
    temp_dir = tempfile.mkdtemp()
    try:
        raw_csv_content = (
            '"MP NAME";"WORK";"CATEGORY";"STATE";"CONSTITUENCY";"IDA";"CITY";"WARD";"BLOCK";"VILLAGE";"RECOMMENDED DATE";"ALLOCATION AMOUNT";"IDA APPROVAL";"STATUS";"HOUSE"\n'
            '"Manoj Rajoria";"NA - Installing community drinking water plants";"Normal/Others";"Rajasthan";"KARAULI-DHOLPUR(SC)";"DISTRICT COLLECTOR DHOLPUR_IDA";"";"";"Rajakhera";"Nadauli";"2024-03-04";"100000";"Action Pending";"Unsanctioned";"Lok Sabha"\n'
            '"Mr Gopal Jee Thakur";"NA - Street lights";"Normal/Others";"Bihar";"DARBHANGA";"DISTRICT MAGISTRATE DARBANGA_IDA";"";"";"Manigachhi";"Raghopur";"2024-03-04";"487000";"Action Pending";"Unsanctioned";"Lok Sabha"\n'
            '"Mr Gopal Jee Thakur";"NA - Street lights";"Normal/Others";"Bihar";"DARBHANGA";"DISTRICT MAGISTRATE DARBANGA_IDA";"";"";"Manigachhi";"Raghopur";"2024-03-04";"487000";"Action Pending";"Unsanctioned";"Lok Sabha"\n'
            '"Mr Gopal Jee Thakur";"NA - Street lights";"Normal/Others";"Bihar";"DARBHANGA";"DISTRICT MAGISTRATE DARBANGA_IDA";"";"";"Manigachhi";"Raghopur";"2024-03-04";"487000";"Action Pending";"Unsanctioned";"Lok Sabha"\n'
            '"Manoj Rajoria";"NA - Installing community drinking water plants";"Normal/Others";"Rajasthan";"KARAULI-DHOLPUR(SC)";"DISTRICT COLLECTOR DHOLPUR_IDA";"";"";"Sepau";"Kookara";"2024-03-04";"NA";"Action Pending";"Unsanctioned";"Lok Sabha"\n'
        )
        raw_file = os.path.join(temp_dir, "fixture_raw.csv")
        processed_file = os.path.join(temp_dir, "fixture_processed.csv")
        report_file = os.path.join(temp_dir, "fixture_report.md")
        
        with open(raw_file, "w", encoding="utf-8") as f:
            f.write(raw_csv_content)
            
        run_cleaning_pipeline(raw_file, processed_file, report_file)
        
        # Read processed file
        df = pd.read_csv(processed_file)
        
        # Total rows should be exactly 5 (same as raw data, duplicates preserved)
        assert len(df) == 5
        
        # Check column names are normalized
        assert "mp_name" in df.columns
        assert "allocation_amount" in df.columns
        assert "recommended_date" in df.columns
        assert "exact_duplicate_group_id" in df.columns
        assert "duplicate_occurrence_count" in df.columns
        
        # Check duplicate count
        # Row 1, 2, 3 (index 1, 2, 3 in raw data) are exact duplicates of each other
        dup_rows = df[df["mp_name"] == "Mr Gopal Jee Thakur"]
        assert len(dup_rows) == 3
        # Their duplicate counts should be 3
        assert (dup_rows["duplicate_occurrence_count"] == 3).all()
        # Their group IDs should all be identical
        assert dup_rows["exact_duplicate_group_id"].nunique() == 1
        
        # Non-duplicate row should have count 1
        non_dup_row = df.iloc[0]
        assert non_dup_row["duplicate_occurrence_count"] == 1
        
        # Missing numeric amount (NA) should be NaN in numeric column, and have allocation_amount_is_missing = True
        missing_amount_row = df.iloc[4]
        assert pd.isnull(missing_amount_row["allocation_amount"])
        assert missing_amount_row["allocation_amount_is_missing"] == True
        
    finally:
        shutil.rmtree(temp_dir)
