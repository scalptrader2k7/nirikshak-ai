import os
import json
import pandas as pd
import numpy as np
from datetime import datetime

def profile_dataset(file_path):
    print(f"Profiling file: {file_path}")
    
    # Read the dataset (semicolon delimited)
    df = pd.read_csv(file_path, sep=";")
    
    # 1. Row/Col counts
    total_rows = len(df)
    total_cols = len(df.columns)
    
    # 2. Columns list
    columns = list(df.columns)
    
    # 3. Missing values
    missing_counts = df.isnull().sum().to_dict()
    missing_pct = {k: float(v / total_rows * 100) for k, v in missing_counts.items()}
    
    # 4. Unique values
    unique_counts = {col: int(df[col].nunique(dropna=True)) for col in df.columns}
    
    # 5. Exact duplicates
    # Exact duplicate row detection
    duplicate_mask = df.duplicated(keep=False)
    exact_duplicate_rows = int(df.duplicated(keep='first').sum())
    duplicate_pct = float(exact_duplicate_rows / total_rows * 100)
    
    # 6. Numeric statistics
    # Semicolon separated, but ALLOCATION AMOUNT is string or numeric. Let's check how it reads.
    # We will try to parse ALLOCATION AMOUNT
    allocation_col = "ALLOCATION AMOUNT"
    numeric_stats = {}
    suspicious_negatives = 0
    suspicious_zeros = 0
    malformed_numeric_count = 0
    
    if allocation_col in df.columns:
        # Convert to string, strip whitespace/quotes/commas, and parse to numeric
        alloc_series_str = df[allocation_col].astype(str).str.strip().str.replace('"', '').str.replace("'", "")
        # Remove commas if any
        alloc_series_str = alloc_series_str.str.replace(',', '')
        
        # Identify malformed non-numeric values (excluding empty strings/NaN)
        non_numeric_mask = ~alloc_series_str.str.match(r'^\s*-?\d+(?:\.\d+)?\s*$') & (alloc_series_str != 'nan') & (alloc_series_str != '')
        malformed_numeric_count = int(non_numeric_mask.sum())
        
        alloc_numeric = pd.to_numeric(alloc_series_str, errors='coerce')
        
        # Calculate stats
        valid_numeric = alloc_numeric.dropna()
        if len(valid_numeric) > 0:
            numeric_stats = {
                "min": float(valid_numeric.min()),
                "max": float(valid_numeric.max()),
                "mean": float(valid_numeric.mean()),
                "median": float(valid_numeric.median()),
                "std": float(valid_numeric.std()) if len(valid_numeric) > 1 else 0.0
            }
            suspicious_negatives = int((valid_numeric < 0).sum())
            suspicious_zeros = int((valid_numeric == 0).sum())
        else:
            numeric_stats = {"error": "No valid numeric data found in ALLOCATION AMOUNT"}
            
    # 7. Date parsing
    date_col = "RECOMMENDED DATE"
    date_parsing = {}
    if date_col in df.columns:
        date_series = df[date_col].astype(str).str.strip().str.replace('"', '').str.replace("'", "")
        # Filter out nan or empty
        filled_dates = date_series[(date_series != 'nan') & (date_series != '')]
        total_filled_dates = len(filled_dates)
        
        if total_filled_dates > 0:
            # Attempt to parse
            parsed_dates = pd.to_datetime(filled_dates, errors='coerce')
            success_count = int(parsed_dates.notnull().sum())
            failed_count = total_filled_dates - success_count
            success_pct = float(success_count / total_filled_dates * 100)
            
            valid_parsed = parsed_dates.dropna()
            date_parsing = {
                "total_filled": total_filled_dates,
                "parsed_successfully": success_count,
                "parse_failed": failed_count,
                "success_percentage": success_pct
            }
            if len(valid_parsed) > 0:
                date_parsing["min_date"] = valid_parsed.min().strftime('%Y-%m-%d')
                date_parsing["max_date"] = valid_parsed.max().strftime('%Y-%m-%d')
        else:
            date_parsing = {"error": "No date values present"}

    # 8. Whitespace & casing inconsistencies
    whitespace_issues = {}
    casing_issues = {}
    for col in df.columns:
        if df[col].dtype == object:
            series_str = df[col].astype(str)
            # Leading/trailing whitespace
            has_leading_trailing = series_str.str.startswith(' ') | series_str.str.endswith(' ')
            # Multiple inner spaces
            has_multi_spaces = series_str.str.contains(r'\s{2,}', regex=True)
            
            whitespace_issues[col] = {
                "leading_trailing_count": int(has_leading_trailing.sum()),
                "multi_space_count": int(has_multi_spaces.sum())
            }
            
            # Casing mismatches: count unique values in lower-case vs original case
            unique_orig = df[col].dropna().astype(str).unique()
            unique_lower = df[col].dropna().astype(str).str.lower().str.strip().unique()
            casing_issues[col] = {
                "original_unique_count": len(unique_orig),
                "normalized_unique_count": len(unique_lower),
                "has_casing_inconsistencies": len(unique_orig) != len(unique_lower)
            }

    # 9. Categorical distributions (top 10 for each object column)
    categorical_distributions = {}
    for col in df.columns:
        # Ignore columns with high cardinality or descriptive columns
        if df[col].dtype == object and unique_counts[col] < 100:
            val_counts = df[col].value_counts(dropna=False).head(10).to_dict()
            # Convert keys and values to python types
            categorical_distributions[col] = {str(k): int(v) for k, v in val_counts.items()}

    # Construct the JSON report
    report = {
        "timestamp": datetime.now().isoformat(),
        "dataset_file": os.path.basename(file_path),
        "total_rows": total_rows,
        "total_columns": total_cols,
        "column_names": columns,
        "missing_counts": missing_counts,
        "missing_percentage": missing_pct,
        "unique_counts": unique_counts,
        "exact_duplicate_rows": exact_duplicate_rows,
        "duplicate_percentage": duplicate_pct,
        "numeric_stats": {
            "allocation_amount": {
                "summary": numeric_stats,
                "suspicious_negatives": suspicious_negatives,
                "suspicious_zeros": suspicious_zeros,
                "malformed_count": malformed_numeric_count
            }
        },
        "date_parsing": {
            "recommended_date": date_parsing
        },
        "whitespace_issues": whitespace_issues,
        "casing_issues": casing_issues,
        "categorical_distributions": categorical_distributions
    }
    
    return report

def write_reports(report, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    json_path = os.path.join(output_dir, "data_profile.json")
    md_path = os.path.join(output_dir, "data_profile.md")
    
    # Write JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"Wrote JSON profile to {json_path}")
    
    # Write Markdown
    md_content = []
    md_content.append(f"# MPLADS Dataset Profile Report")
    md_content.append(f"Generated at: `{report['timestamp']}`\n")
    md_content.append(f"Source file: `{report['dataset_file']}`\n")
    
    md_content.append("## 1. Summary Metrics")
    md_content.append(f"- **Total Rows**: {report['total_rows']}")
    md_content.append(f"- **Total Columns**: {report['total_columns']}")
    md_content.append(f"- **Exact Duplicate Rows**: {report['exact_duplicate_rows']} ({report['duplicate_percentage']:.2f}%)")
    md_content.append("")
    
    md_content.append("## 2. Columns & Missing Values")
    md_content.append("| Column Name | Unique Values | Missing Values | Missing % |")
    md_content.append("| --- | --- | --- | --- |")
    for col in report['column_names']:
        uniq = report['unique_counts'][col]
        miss = report['missing_counts'][col]
        pct = report['missing_percentage'][col]
        md_content.append(f"| {col} | {uniq} | {miss} | {pct:.2f}% |")
    md_content.append("")
    
    md_content.append("## 3. Numeric Summary: ALLOCATION AMOUNT")
    alloc_stats = report['numeric_stats']['allocation_amount']
    summary = alloc_stats['summary']
    if "error" in summary:
        md_content.append(f"Error: {summary['error']}")
    else:
        md_content.append(f"- **Minimum**: {summary['min']:.2f}")
        md_content.append(f"- **Maximum**: {summary['max']:.2f}")
        md_content.append(f"- **Mean**: {summary['mean']:.2f}")
        md_content.append(f"- **Median**: {summary['median']:.2f}")
        md_content.append(f"- **Standard Deviation**: {summary['std']:.2f}")
        md_content.append(f"- **Suspicious Zero Values**: {alloc_stats['suspicious_zeros']}")
        md_content.append(f"- **Suspicious Negative Values**: {alloc_stats['suspicious_negatives']}")
        md_content.append(f"- **Malformed/Non-numeric Strings**: {alloc_stats['malformed_count']}")
    md_content.append("")
    
    md_content.append("## 4. Date Summary: RECOMMENDED DATE")
    date_stats = report['date_parsing']['recommended_date']
    if "error" in date_stats:
        md_content.append(f"Error: {date_stats['error']}")
    else:
        md_content.append(f"- **Total non-empty values**: {date_stats['total_filled']}")
        md_content.append(f"- **Successfully parsed (ISO standard)**: {date_stats['parsed_successfully']} ({date_stats['success_percentage']:.2f}%)")
        md_content.append(f"- **Failed to parse**: {date_stats['parse_failed']}")
        if "min_date" in date_stats:
            md_content.append(f"- **Earliest Date**: `{date_stats['min_date']}`")
            md_content.append(f"- **Latest Date**: `{date_stats['max_date']}`")
    md_content.append("")
    
    md_content.append("## 5. Whitespace and Capitalization Inconsistencies")
    md_content.append("| Column | Leading/Trailing Whitespace Rows | Multi-space Rows | Casing Inconsistencies? |")
    md_content.append("| --- | --- | --- | --- |")
    for col in report['column_names']:
        ws = report['whitespace_issues'].get(col, {"leading_trailing_count": 0, "multi_space_count": 0})
        case = report['casing_issues'].get(col, {"has_casing_inconsistencies": False})
        has_case = "Yes" if case["has_casing_inconsistencies"] else "No"
        md_content.append(f"| {col} | {ws['leading_trailing_count']} | {ws['multi_space_count']} | {has_case} |")
    md_content.append("")
    
    md_content.append("## 6. Categorical Distributions (Top 10)")
    for col, dist in report['categorical_distributions'].items():
        md_content.append(f"### Column: `{col}`")
        md_content.append("| Value | Count | Percentage |")
        md_content.append("| --- | --- | --- |")
        for val, count in dist.items():
            pct = (count / report['total_rows']) * 100
            display_val = f"*(Empty String)*" if val.strip() == "" else val
            md_content.append(f"| {display_val} | {count} | {pct:.2f}% |")
        md_content.append("")
        
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_content))
    print(f"Wrote Markdown profile to {md_path}")

if __name__ == "__main__":
    raw_dir = r"c:\Users\G.VEDAVYAS\Documents\nirikshak\data\raw"
    csv_files = [f for f in os.listdir(raw_dir) if f.endswith(".csv")]
    
    if not csv_files:
        print(f"No CSV files found in {raw_dir}. Please place raw CSV files there.")
        exit(1)
        
    raw_file = os.path.join(raw_dir, csv_files[0])
    report = profile_dataset(raw_file)
    
    output_dir = r"c:\Users\G.VEDAVYAS\Documents\nirikshak\data\reports"
    write_reports(report, output_dir)
