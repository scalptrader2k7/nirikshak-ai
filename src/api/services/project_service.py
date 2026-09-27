from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
from src.api.data_loader import get_clean_df, get_cases
from src.verification.data_completeness import compute_data_completeness
from src.workflow.workflow_service import get_case_workflow, get_case_reviews

DATA_PROVENANCE = {
    "source_name": "MPLADS public-data snapshot",
    "snapshot_type": "MoSPI official recommendations export",
    "record_count": 742,
    "available_fields": [
        "mp_name", "work", "category", "state", "constituency",
        "ida", "city", "ward", "block", "village",
        "recommended_date", "allocation_amount", "ida_approval", "status", "house"
    ],
    "unavailable_lifecycle_fields": [
        "sanctioned_amount", "approved_estimate", "funds_released",
        "expenditure_amount", "individual_payments", "physical_progress",
        "milestones", "expected_completion", "actual_completion", "delay_days",
        "latitude", "longitude", "document_urls", "inspection_data",
        "asset_register", "completion_certificate"
    ],
    "analysis_coverage": "742 records evaluated for cost deviation, repetition, near-duplicate similarity, and temporal clusters."
}

DISCLAIMER = "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."

def get_paginated_projects(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    state: Optional[str] = None,
    constituency: Optional[str] = None,
    mp_name: Optional[str] = None,
    work_type: Optional[str] = None,
    status: Optional[str] = None,
    allowed_record_ids: Optional[List[int]] = None
) -> Tuple[List[Dict[str, Any]], int, int]:
    """
    Browses all 742 cleaned project records with filtering, searching, and pagination.
    Supports authoritative scope restriction via allowed_record_ids.
    """
    clean_df = get_clean_df()
    if clean_df.empty:
        return [], 0, 0

    df = clean_df.copy()

    # Apply authoritative scope restriction if specified
    if allowed_record_ids is not None:
        df = df[df["original_row_index"].isin(allowed_record_ids)]

    # Pre-map investigation case status and priority
    cases = get_cases()
    case_map = {int(c["record_id"]): c for c in cases}

    # Filters
    if state:
        df = df[df["state"].astype(str).str.lower() == state.lower().strip()]
    if constituency:
        df = df[df["constituency"].astype(str).str.lower() == constituency.lower().strip()]
    if mp_name:
        df = df[df["mp_name"].astype(str).str.lower() == mp_name.lower().strip()]
    if status:
        df = df[df["status"].astype(str).str.lower() == status.lower().strip()]
    if search:
        s_term = search.lower().strip()
        mask = (
            df["work"].astype(str).str.lower().str.contains(s_term, na=False) |
            df["mp_name"].astype(str).str.lower().str.contains(s_term, na=False) |
            df["constituency"].astype(str).str.lower().str.contains(s_term, na=False) |
            df["state"].astype(str).str.lower().str.contains(s_term, na=False) |
            df["original_row_index"].astype(str).str.contains(s_term, na=False)
        )
        df = df[mask]

    total_records = len(df)
    total_pages = max(1, (total_records + page_size - 1) // page_size) if total_records > 0 else 0

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    sliced = df.iloc[start_idx:end_idx]

    records = []
    for _, row in sliced.iterrows():
        rec_id = int(row["original_row_index"])
        case_info = case_map.get(rec_id)
        records.append({
            "record_id": rec_id,
            "work": row.get("work"),
            "category": row.get("category"),
            "mp_name": row.get("mp_name"),
            "house": row.get("house"),
            "state": row.get("state"),
            "constituency": row.get("constituency"),
            "ida": row.get("ida"),
            "city": row.get("city") if pd.notnull(row.get("city")) else None,
            "ward": row.get("ward") if pd.notnull(row.get("ward")) else None,
            "block": row.get("block") if pd.notnull(row.get("block")) else None,
            "village": row.get("village") if pd.notnull(row.get("village")) else None,
            "recommended_date": row.get("recommended_date") if pd.notnull(row.get("recommended_date")) else None,
            "allocation_amount": float(row.get("allocation_amount")) if pd.notnull(row.get("allocation_amount")) else None,
            "ida_approval": row.get("ida_approval"),
            "status": row.get("status"),
            "has_investigation_case": case_info is not None,
            "investigation_priority_level": case_info.get("investigation_priority_level") if case_info else "NONE",
            "investigation_priority_score": case_info.get("investigation_priority_score") if case_info else 0.0,
            "primary_detector": case_info.get("primary_detector") if case_info else None
        })

    return records, total_records, total_pages

def get_public_project_detail(record_id: int) -> Optional[Dict[str, Any]]:
    """
    Returns a public-safe project record payload containing official public MPLADS record fields.
    Strictly excludes internal notes, reviewer identities, workflow audit trails,
    evidence requests, and private account details.
    """
    clean_df = get_clean_df()
    if clean_df.empty:
        return None

    matches = clean_df[clean_df["original_row_index"] == record_id]
    if len(matches) == 0:
        return None

    row = matches.iloc[0]
    return {
        "record_id": record_id,
        "work": row.get("work"),
        "category": row.get("category"),
        "mp_name": row.get("mp_name"),
        "house": row.get("house"),
        "state": row.get("state"),
        "constituency": row.get("constituency"),
        "ida": row.get("ida"),
        "city": row.get("city") if pd.notnull(row.get("city")) else None,
        "ward": row.get("ward") if pd.notnull(row.get("ward")) else None,
        "block": row.get("block") if pd.notnull(row.get("block")) else None,
        "village": row.get("village") if pd.notnull(row.get("village")) else None,
        "recommended_date": row.get("recommended_date") if pd.notnull(row.get("recommended_date")) else None,
        "allocation_amount": float(row.get("allocation_amount")) if pd.notnull(row.get("allocation_amount")) else None,
        "ida_approval": row.get("ida_approval"),
        "status": row.get("status"),
        "disclaimer": DISCLAIMER
    }

def get_project_overview(record_id: int) -> Optional[Dict[str, Any]]:
    """
    Returns the comprehensive, consolidated Project Overview payload for any record (1-742),
    integrating project identity, lifecycle, financials, progress, canonical risk, data completeness,
    workflow state, and provenance.
    """
    clean_df = get_clean_df()
    if clean_df.empty:
        return None

    matches = clean_df[clean_df["original_row_index"] == record_id]
    if len(matches) == 0:
        return None

    row = matches.iloc[0]
    row_dict = row.to_dict()

    # Investigation case lookup (if exists)
    cases = get_cases()
    case = next((c for c in cases if int(c["record_id"]) == record_id), None)

    # 1. Project Information
    project_info = {
        "record_id": record_id,
        "work": row.get("work"),
        "category": row.get("category"),
        "mp_name": row.get("mp_name"),
        "house": row.get("house"),
        "state": row.get("state"),
        "constituency": row.get("constituency"),
        "ida": row.get("ida"),
        "block": row.get("block") if pd.notnull(row.get("block")) else None,
        "village": row.get("village") if pd.notnull(row.get("village")) else None,
        "city": row.get("city") if pd.notnull(row.get("city")) else None,
        "ward": row.get("ward") if pd.notnull(row.get("ward")) else None,
        "recommended_date": row.get("recommended_date") if pd.notnull(row.get("recommended_date")) else None,
        "allocation_amount": float(row.get("allocation_amount")) if pd.notnull(row.get("allocation_amount")) else None,
        "ida_approval": row.get("ida_approval"),
        "status": row.get("status")
    }

    # 2. Recommendation Entity
    recommendation_info = {
        "recommended_date": project_info["recommended_date"],
        "allocation_amount": project_info["allocation_amount"],
        "mp_name": project_info["mp_name"],
        "house": project_info["house"],
        "state": project_info["state"],
        "constituency": project_info["constituency"],
        "availability": "AVAILABLE"
    }

    # 3. Lifecycle-ready Entities (Explicitly flagging availability)
    lifecycle_info = {
        "recommendation": {
            "status": "COMPLETED",
            "recommended_date": project_info["recommended_date"],
            "availability": "AVAILABLE"
        },
        "sanction": {
            "status": project_info["status"],
            "ida_approval": project_info["ida_approval"],
            "sanctioned_amount": None,
            "sanction_date": None,
            "availability": "DERIVED_STATUS_ONLY"
        },
        "estimate": {
            "approved_estimate_amount": None,
            "technical_sanction_reference": None,
            "availability": "NOT_AVAILABLE_IN_CURRENT_DATASET"
        },
        "work_order": {
            "work_order_number": None,
            "work_order_date": None,
            "agency_name": None,
            "availability": "NOT_AVAILABLE_IN_CURRENT_DATASET"
        },
        "fund_release": {
            "funds_released_amount": None,
            "release_installments": None,
            "availability": "NOT_AVAILABLE_IN_CURRENT_DATASET"
        },
        "expenditure": {
            "expenditure_amount": None,
            "expenditure_date": None,
            "availability": "NOT_AVAILABLE_IN_CURRENT_DATASET"
        },
        "payment": {
            "total_disbursed": None,
            "voucher_count": None,
            "availability": "NOT_AVAILABLE_IN_CURRENT_DATASET"
        },
        "milestone": {
            "milestones_count": None,
            "current_milestone": None,
            "availability": "NOT_AVAILABLE_IN_CURRENT_DATASET"
        },
        "progress": {
            "physical_progress_percent": None,
            "financial_progress_percent": None,
            "availability": "NOT_AVAILABLE_IN_CURRENT_DATASET"
        },
        "inspection": {
            "inspection_count": None,
            "last_inspection_date": None,
            "availability": "NOT_AVAILABLE_IN_CURRENT_DATASET"
        },
        "completion": {
            "expected_completion_date": None,
            "actual_completion_date": None,
            "delay_days": None,
            "completion_certificate_available": False,
            "availability": "NOT_AVAILABLE_IN_CURRENT_DATASET"
        },
        "asset": {
            "asset_id": None,
            "asset_registered": False,
            "availability": "NOT_AVAILABLE_IN_CURRENT_DATASET"
        },
        "document": {
            "documents_count": 0,
            "document_links": [],
            "availability": "NOT_AVAILABLE_IN_CURRENT_DATASET"
        }
    }

    # 4. Financial Summary
    financial_info = {
        "allocation_amount": project_info["allocation_amount"],
        "sanctioned_amount": None,
        "expenditure_amount": None,
        "funds_released": None,
        "status": project_info["status"],
        "cost_anomaly_triggered": bool(case.get("cost_anomaly", False)) if case else False,
        "cost_deviation_percent": None
    }
    if case and "peer_benchmark" in case:
        financial_info["cost_deviation_percent"] = case["peer_benchmark"].get("amount_deviation_percent")

    # 5. Progress Summary
    progress_info = {
        "physical_progress_percent": None,
        "financial_progress_percent": None,
        "reality_gap": None,
        "reality_gap_status": "not_available",
        "explanation": "Physical construction progress and fund utilization percentages are unavailable in the current public spending dataset."
    }

    # 6. Canonical Risk Presentation
    if case:
        risk_info = {
            "triggered": True,
            "risk_score": case["investigation_priority_score"],
            "review_priority": case["investigation_priority_level"],
            "severity": case["highest_severity"],
            "primary_detector": case["primary_detector"],
            "primary_signal": case.get("primary_signal", ""),
            "signal_count": case["evidence_count"],
            "title": case["title"],
            "summary": case["summary"]
        }
        evidence_summary = case.get("evidence", [])
        related_records = {
            "exact_duplicates": case.get("related_exact_duplicates", []),
            "potentially_suspicious": case.get("related_potentially_suspicious", []),
            "contextual": case.get("related_contextual_near_duplicates", [])
        }
    else:
        risk_info = {
            "triggered": False,
            "risk_score": 0.0,
            "review_priority": "NONE",
            "severity": "none",
            "primary_detector": "none",
            "primary_signal": "",
            "signal_count": 0,
            "title": "Standard Project Record",
            "summary": "No risk anomalies triggered for this record."
        }
        evidence_summary = []
        related_records = {
            "exact_duplicates": [],
            "potentially_suspicious": [],
            "contextual": []
        }

    # 7. Data Completeness Calculation
    completeness = compute_data_completeness(project_info)

    # 8. Operational Workflow & Reviews
    workflow_info = get_case_workflow(record_id)
    reviews_info = get_case_reviews(record_id)

    review_summary = {
        "total_reviews": len(reviews_info),
        "latest_outcome": reviews_info[0]["outcome"] if reviews_info else None,
        "reviews": reviews_info
    }

    # 9. Demonstration Lifecycle Enrichment (if available for demo cohort)
    from src.enrichment.demo_service import get_demo_lifecycle_payload
    demo_enrichment = None
    demo_payload = get_demo_lifecycle_payload(record_id)
    if demo_payload and demo_payload.get("available"):
        demo_enrichment = demo_payload

    return {
        "project": project_info,
        "recommendation": recommendation_info,
        "lifecycle": lifecycle_info,
        "financial": financial_info,
        "progress": progress_info,
        "risk": risk_info,
        "data_completeness": completeness,
        "evidence_summary": evidence_summary,
        "workflow": workflow_info,
        "review_summary": review_summary,
        "related_records": related_records,
        "data_provenance": DATA_PROVENANCE,
        "disclaimer": DISCLAIMER,
        "demo_enrichment": demo_enrichment
    }
