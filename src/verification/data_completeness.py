from typing import Dict, Any, List, Optional
import pandas as pd

DIMENSION_DEFINITIONS = {
    "identity": [
        "work",
        "work_type",
        "mp_name",
        "house",
        "category"
    ],
    "recommendation": [
        "recommended_date",
        "allocation_amount",
        "ida_approval",
        "status"
    ],
    "financial": [
        "allocation_amount",
        "sanctioned_amount",
        "expenditure_amount",
        "funds_released",
        "payment_records"
    ],
    "progress": [
        "physical_progress_percent",
        "milestones",
        "expected_completion_date",
        "actual_completion_date",
        "delay_days"
    ],
    "location": [
        "state",
        "constituency",
        "block",
        "village",
        "city",
        "ward"
    ],
    "documents": [
        "sanction_order",
        "site_photographs",
        "measurement_book",
        "completion_certificate"
    ],
    "inspection": [
        "inspection_logs",
        "site_visit_reports",
        "monitoring_officer"
    ],
    "asset": [
        "asset_id",
        "asset_category",
        "geo_tag",
        "asset_register_entry"
    ]
}

SOURCE_UNAVAILABLE_FIELDS = {
    "sanctioned_amount",
    "approved_estimate",
    "approved_estimate_amount",
    "funds_released",
    "funds_released_amount",
    "expenditure_amount",
    "payment_records",
    "physical_progress_percent",
    "milestones",
    "expected_completion_date",
    "actual_completion_date",
    "delay_days",
    "latitude",
    "longitude",
    "document URLs",
    "document_urls",
    "inspection data",
    "inspection_data",
    "inspection_logs",
    "site_visit_reports",
    "monitoring_officer",
    "asset records",
    "asset_records",
    "asset_id",
    "asset_category",
    "geo_tag",
    "asset_register_entry",
    "completion certificate",
    "completion_certificate",
    "sanction_order",
    "site_photographs",
    "measurement_book"
}

# Standardized B4 Completeness Classifications
FIELD_PRESENT = "FIELD_PRESENT"
RECORD_LEVEL_MISSING = "RECORD_LEVEL_MISSING"
SOURCE_WIDE_UNAVAILABLE = "SOURCE_WIDE_UNAVAILABLE"
DEMONSTRATION_ONLY = "DEMONSTRATION_ONLY"

DEMONSTRATION_ONLY_FIELDS = {
    "sanctioned_amount",
    "approved_estimate",
    "approved_estimate_amount",
    "funds_released",
    "funds_released_amount",
    "expenditure_amount",
    "individual_payments",
    "payment_records",
    "physical_progress_percent",
    "financial_progress_percent",
    "milestones",
    "expected_completion_date",
    "actual_completion_date",
    "delay_days",
    "site_photographs",
    "measurement_book",
    "completion_certificate"
}

def classify_field_status(field_name: str, val: Any, is_demo_record: bool = False) -> str:
    """
    Classifies a lifecycle field according to B4 standardized completeness taxonomy:
    - FIELD_PRESENT: Field is present with valid data in this record.
    - RECORD_LEVEL_MISSING: Field is part of the source dataset schema but missing for this record.
    - SOURCE_WIDE_UNAVAILABLE: Field is absent from the entire official public spending dataset.
    - DEMONSTRATION_ONLY: Field is populated via isolated synthetic demonstration enrichment.
    """
    if is_demo_record and field_name in DEMONSTRATION_ONLY_FIELDS and _is_field_available(val):
        return DEMONSTRATION_ONLY
    if _is_field_available(val):
        return FIELD_PRESENT
    if field_name in SOURCE_UNAVAILABLE_FIELDS:
        return SOURCE_WIDE_UNAVAILABLE
    return RECORD_LEVEL_MISSING

def classify_field(field_name: str, val: Any) -> str:
    """
    Classifies a lifecycle field as AVAILABLE, MISSING_FROM_RECORD, or NOT_AVAILABLE_IN_SOURCE_DATASET.
    Retained for backward compatibility.
    """
    if _is_field_available(val):
        return "AVAILABLE"
    if field_name in SOURCE_UNAVAILABLE_FIELDS:
        return "NOT_AVAILABLE_IN_SOURCE_DATASET"
    return "MISSING_FROM_RECORD"

def _is_field_available(val: Any) -> bool:
    if val is None or pd.isnull(val):
        return False
    if isinstance(val, str):
        s = val.strip()
        return s != "" and s.lower() not in ["nan", "none", "null"]
    if isinstance(val, (int, float)):
        return not pd.isna(val)
    return True

def compute_data_completeness(record_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates data availability and completeness for an individual project record
    across 8 lifecycle dimensions.
    
    Distinguishes fields absent from this particular record (missing_fields)
    versus fields not supplied by the current MPLADS public-data source (not_available_in_source_dataset).
    """
    dimensions_result: Dict[str, Dict[str, Any]] = {}
    total_available_count = 0
    total_expected_count = 0
    all_missing_fields: List[str] = []
    all_source_unavailable: List[str] = []
    
    for dimension, expected_fields in DIMENSION_DEFINITIONS.items():
        available_fields: List[str] = []
        missing_fields: List[str] = []
        not_available_in_source_dataset: List[str] = []
        
        for field in expected_fields:
            val = record_data.get(field)
            if _is_field_available(val):
                available_fields.append(field)
            elif field in SOURCE_UNAVAILABLE_FIELDS:
                not_available_in_source_dataset.append(field)
            else:
                missing_fields.append(field)
                
        dim_count = len(expected_fields)
        avail_count = len(available_fields)
        pct = round((avail_count / dim_count) * 100.0, 1) if dim_count > 0 else 0.0
        
        dimensions_result[dimension] = {
            "available_fields": available_fields,
            "expected_fields": expected_fields,
            "missing_fields": missing_fields,
            "not_available_in_source_dataset": not_available_in_source_dataset,
            "completeness_percent": pct
        }
        
        total_available_count += avail_count
        total_expected_count += dim_count
        all_missing_fields.extend(missing_fields)
        all_source_unavailable.extend(not_available_in_source_dataset)
        
    overall_pct = (
        round((total_available_count / total_expected_count) * 100.0, 1)
        if total_expected_count > 0
        else 0.0
    )
    
    if overall_pct >= 70.0:
        coverage_level = "HIGH"
    elif overall_pct >= 40.0:
        coverage_level = "MODERATE"
    elif overall_pct >= 20.0:
        coverage_level = "LIMITED"
    else:
        coverage_level = "VERY_LIMITED"
        
    return {
        "dimensions": dimensions_result,
        "total_available_fields": total_available_count,
        "total_expected_fields": total_expected_count,
        "overall_completeness_percent": overall_pct,
        "coverage_level": coverage_level,
        "missing_fields": list(dict.fromkeys(all_missing_fields)),
        "not_available_in_source_dataset": list(dict.fromkeys(all_source_unavailable)),
        "field_classifications": {
            f: classify_field_status(f, record_data.get(f), is_demo_record=record_data.get("is_demo_enrichment", False))
            for f_list in DIMENSION_DEFINITIONS.values()
            for f in f_list
        }
    }

