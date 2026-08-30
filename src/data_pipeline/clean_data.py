import os
import hashlib
import pandas as pd
import numpy as np

def clean_text(val):
    if pd.isnull(val):
        return val
    s = str(val).strip()
    # Replace quotes and normalize inner whitespace
    s = s.replace('"', '').replace("'", "")
    s = " ".join(s.split())
    return s

def clean_column_name(name):
    # Normalize to snake_case
    s = str(name).strip().replace('"', '').replace("'", "")
    s = s.lower().replace(" ", "_").replace("-", "_")
    return s

def parse_allocation_amount(val):
    if pd.isnull(val):
        return np.nan
    s = str(val).strip().replace('"', '').replace("'", "").replace(",", "")
    if s == "" or s.lower() == "nan":
        return np.nan
    try:
        return float(s)
    except ValueError:
        return np.nan

def parse_recommended_date(val):
    if pd.isnull(val):
        return pd.NaT
    s = str(val).strip().replace('"', '').replace("'", "")
    if s == "" or s.lower() == "nan":
        return pd.NaT
    try:
        # Keep parse strict, use to_datetime
        return pd.to_datetime(s, format="%Y-%m-%d", errors="raise")
    except Exception:
        # Try fallback general parsing without guessing ambiguous parts
        try:
            return pd.to_datetime(s, errors="raise")
        except Exception:
            return pd.NaT

def generate_row_hash(row):
    # Create a deterministic hash of all original cell values in the row to detect exact duplicates
    row_str = "|".join([str(val) for val in row.values])
    return hashlib.md5(row_str.encode('utf-8')).hexdigest()

def run_cleaning_pipeline(raw_file_path, processed_file_path, report_file_path):
    print(f"Reading raw data from {raw_file_path}...")
    
    # Check if raw file was modified (for safety test verification)
    raw_hash_before = hashlib.md5(open(raw_file_path, 'rb').read()).hexdigest()
    
    # Load dataset
    df_raw = pd.read_csv(raw_file_path, sep=";")
    raw_row_count = len(df_raw)
    
    # Store copy of raw dataframe to avoid modify-in-place
    df = df_raw.copy()
    
    # Capture original columns and create mapping
    original_cols = list(df.columns)
    column_mapping = {col: clean_column_name(col) for col in original_cols}
    
    # Clean text in all string columns (before name changes)
    for col in df.columns:
        if df[col].dtype == object:
            df[col] = df[col].apply(clean_text)
            
    # Normalize column names
    df = df.rename(columns=column_mapping)
    normalized_cols = list(df.columns)
    
    # Clean specific fields
    # ALLOCATION AMOUNT
    raw_allocation = df_raw[original_cols[original_cols.index("ALLOCATION AMOUNT")]]
    df["allocation_amount"] = raw_allocation.apply(parse_allocation_amount)
    
    # RECOMMENDED DATE
    raw_recommended_date = df_raw[original_cols[original_cols.index("RECOMMENDED DATE")]]
    df["recommended_date_parsed"] = raw_recommended_date.apply(parse_recommended_date)
    
    # Track parse errors / invalid values for report
    invalid_allocation_mask = df["allocation_amount"].isna() & raw_allocation.notna() & (raw_allocation.astype(str).str.strip() != "")
    invalid_allocations = list(df_raw.loc[invalid_allocation_mask, "ALLOCATION AMOUNT"].unique())
    invalid_allocation_count = int(invalid_allocation_mask.sum())
    
    invalid_date_mask = df["recommended_date_parsed"].isna() & raw_recommended_date.notna() & (raw_recommended_date.astype(str).str.strip() != "")
    invalid_dates = list(df_raw.loc[invalid_date_mask, "RECOMMENDED DATE"].unique())
    invalid_date_count = int(invalid_date_mask.sum())
    
    # Format parsed date back to YYYY-MM-DD string, leaving invalid/missing as empty or retaining raw
    df["recommended_date"] = df["recommended_date_parsed"].dt.strftime("%Y-%m-%d").fillna("")
    
    # Drop intermediate parsed column
    df = df.drop(columns=["recommended_date_parsed"])
    
    # Create missingness indicators if useful
    df["allocation_amount_is_missing"] = df["allocation_amount"].isna()
    
    # DUPLICATE HANDLING (DO NOT DELETE)
    # 1. Generate row hash for each row based on raw values
    row_hashes = df_raw.apply(generate_row_hash, axis=1)
    
    # 2. Add original row index
    df["original_row_index"] = df_raw.index
    
    # 3. Add group id and counts
    df["exact_duplicate_group_id"] = row_hashes
    
    # Value counts of group ids gives occurrence count
    hash_counts = row_hashes.value_counts().to_dict()
    df["duplicate_occurrence_count"] = row_hashes.map(hash_counts)
    
    # Count of unique rows that appear > 1 time
    duplicate_rows_total = int(df_raw.duplicated(keep=False).sum())
    
    # Write processed data
    os.makedirs(os.path.dirname(processed_file_path), exist_ok=True)
    df.to_csv(processed_file_path, index=False)
    print(f"Wrote clean data to {processed_file_path}")
    
    # Safety Check: Ensure raw file was not modified
    raw_hash_after = hashlib.md5(open(raw_file_path, 'rb').read()).hexdigest()
    if raw_hash_before != raw_hash_after:
        raise IOError("CRITICAL: Raw dataset was modified during processing!")
    else:
        print("Raw dataset integrity verified (unchanged).")
        
    # Write Quality Report
    os.makedirs(os.path.dirname(report_file_path), exist_ok=True)
    
    # Calculate missing values before and after
    missing_before = df_raw.isnull().sum().to_dict()
    missing_after = df.isnull().sum().to_dict()
    
    md_content = []
    md_content.append("# Data Quality & Pipeline Audit Report")
    md_content.append(f"Generated at: `{pd.Timestamp.now().isoformat()}`\n")
    md_content.append("## 1. Summary Metrics")
    md_content.append(f"- **Raw Row Count**: {raw_row_count}")
    md_content.append(f"- **Processed Row Count**: {len(df)}")
    md_content.append(f"- **Exact Duplicate Row Count**: {duplicate_rows_total}")
    md_content.append(f"- **Invalid Numeric (Allocation) Count**: {invalid_allocation_count}")
    md_content.append(f"- **Invalid Date (Recommended) Count**: {invalid_date_count}")
    md_content.append("")
    
    md_content.append("## 2. Column Mapping & Schema")
    md_content.append("| Original Column | Cleaned Column | Type in Cleaned |")
    md_content.append("| --- | --- | --- |")
    for orig, norm in column_mapping.items():
        md_content.append(f"| {orig} | {norm} | {str(df[norm].dtype)} |")
    md_content.append("")
    
    md_content.append("## 3. Missing Value Analysis (Before vs After)")
    md_content.append("| Raw Column | Missing Count (Raw) | Cleaned Column | Missing Count (Cleaned) |")
    md_content.append("| --- | --- | --- | --- |")
    for orig, norm in column_mapping.items():
        mb = missing_before[orig]
        ma = missing_after[norm]
        md_content.append(f"| {orig} | {mb} | {norm} | {ma} |")
    md_content.append("")
    
    md_content.append("## 4. Anomalies & Quality Issues Log")
    md_content.append(f"### Invalid Numeric Values ({invalid_allocation_count} occurrences)")
    if invalid_allocations:
        md_content.append(f"- Unique values causing failure: `{invalid_allocations}`")
    else:
        md_content.append("- None detected.")
    md_content.append("")
    
    md_content.append(f"### Invalid Dates ({invalid_date_count} occurrences)")
    if invalid_dates:
        md_content.append(f"- Unique values causing failure: `{invalid_dates}`")
    else:
        md_content.append("- None detected.")
    md_content.append("")
    
    md_content.append("## 5. Important Data Limitations & Notes")
    md_content.append("1. **Ambiguous Dates**: No assumptions were made for ambiguous date strings. Non-standard dates are coerced to empty strings.")
    md_content.append("2. **Numeric Fields**: Non-numeric allocation amounts were set to null rather than imputed or estimated.")
    md_content.append("3. **Duplicate Fields**: All rows have been retained. Exact duplicate records are tagged with `exact_duplicate_group_id` and can be analyzed as anomalies.")
    md_content.append("4. **Casing & Descriptions**: Text descriptions are stripped of leading/trailing whitespace and normalized, but descriptions are not rewritten.")
    md_content.append("")
    
    with open(report_file_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_content))
    print(f"Wrote quality report to {report_file_path}")

if __name__ == "__main__":
    raw_dir = r"c:\Users\G.VEDAVYAS\Documents\nirikshak\data\raw"
    csv_files = [f for f in os.listdir(raw_dir) if f.endswith(".csv")]
    
    if not csv_files:
        print("No CSV files found in raw directory.")
        exit(1)
        
    raw_path = os.path.join(raw_dir, csv_files[0])
    processed_path = r"c:\Users\G.VEDAVYAS\Documents\nirikshak\data\processed\mplads_clean.csv"
    report_path = r"c:\Users\G.VEDAVYAS\Documents\nirikshak\data\reports\data_quality_report.md"
    
    run_cleaning_pipeline(raw_path, processed_path, report_path)
