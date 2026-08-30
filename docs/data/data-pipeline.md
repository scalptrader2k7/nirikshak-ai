# NIRIKSHAK AI - MPLADS Data Ingestion & Cleaning Pipeline

This document defines the architecture, transformation stages, and quality rules for the MPLADS data-ingestion pipeline in Nirikshak AI.

## Pipeline Flow

```
   [ RAW DATA ]
         │
         ▼
   [ DATA PROFILING ]  ──> Generates: data_profile.json & data_profile.md
         │
         ▼
   [ DATA CLEANING ]
         ├─ Text Normalization
         ├─ Column Mapping (snake_case)
         ├─ Numeric Conversion (Allocation amount parsing)
         ├─ Date Standardisation (YYYY-MM-DD parsing)
         └─ Categorical Whitespace Removal
         │
         ▼
  [ DUPLICATE ANALYSIS ]  ──> Row Hash Calculation (retaining all records)
         │
         ▼
 [ PROCESSED DATASET ] ──> Generates: mplads_clean.csv & data_quality_report.md
```

---

## 1. Raw Data Input (`data/raw/`)
The input dataset is raw MPLADS scheme implementation records in CSV format, using a semicolon (`;`) separator. 
* **Immutability Principle**: The raw files in this directory are treated as read-only. The pipeline processes them entirely in-memory and writes outputs separately to prevent modification of raw source evidence.

## 2. Ingestion & Profiling (`scripts/data/profile_data.py`)
A pandas-based profiling process executes prior to or alongside cleaning to log data constraints:
* Computes metadata (total rows, total columns, data types).
* Counts exact duplicates and null values.
* Checks numeric ranges and flag negative or zero allocation values.
* Tracks whitespace, casing, and parsing errors.
* Output is written to `data/reports/data_profile.json` and `data/reports/data_profile.md`.

## 3. Cleaning & Standardisation (`src/data_pipeline/clean_data.py`)
The pipeline runs deterministic transformations to structure the data for downstream AI processing:

### Text Fields
* Trims leading and trailing spaces.
* Normalizes multiple internal whitespaces to a single space.
* Retains text content exactly as-is without rephrasing or summarization (e.g. `work` description).

### Column Names
Headers are mapped to `snake_case` using lowercase alphanumeric strings and underscores:
* `MP NAME` -> `mp_name`
* `RECOMMENDED DATE` -> `recommended_date`
* `ALLOCATION AMOUNT` -> `allocation_amount`

A schema audit mapping is preserved in the data quality reports.

### Numeric Fields
* Converts `allocation_amount` to float.
* Removes formatting characters like commas (`,`) or currency symbols.
* Detects malformed non-numeric values and sets them to null instead of inventing/imputing values.

### Date Fields
* Parses `recommended_date` to `YYYY-MM-DD` ISO format.
* Identifies parse errors and keeps them as empty values. The original values are preserved in raw logs.

### Categorical Fields
* Cleans casing discrepancies in columns like `BLOCK` and `STATUS`.
* Obvious formatting anomalies are normalised, but categories are never merged based on heuristics.

### Missing Values
* Null values are preserved without imputation to prevent bias.
* Adds a boolean missingness indicator (`allocation_amount_is_missing`) to explicitly tag missing allocations.

---

## 4. Duplicate Handling Strategy
> [!IMPORTANT]
> **DO NOT DELETE DUPLICATES.**
> Exact duplicate rows in MPLADS datasets often represent anomalies (e.g., double-entry errors, systemic copy-pasting, split invoicing, or payment laundering). Deleting duplicates would destroy critical audit signals.

Instead of dropping rows, the pipeline groups duplicates:
1. Calculates a deterministic MD5 hash of all cell values in the raw row to generate an `exact_duplicate_group_id`.
2. Map occurrences using `duplicate_occurrence_count` (the number of times that identical row appears in the dataset).
3. Adds the `original_row_index` referencing the 0-indexed row number from the raw CSV to make the pipeline auditable.

---

## 5. Output Datasets & Quality Audit (`data/processed/`)
* Cleaned data is written to `data/processed/mplads_clean.csv`.
* A summary quality audit report is generated at `data/reports/data_quality_report.md`.

## 6. Core Principles
> [!IMPORTANT]
> **"An anomaly is an indicator for investigation, not proof of fraud."**
> 
> The purpose of the Nirikshak AI data pipeline is to highlight structural issues, missing values, duplicates, and irregularities in order to flag projects for human review. It does not issue final decisions.
