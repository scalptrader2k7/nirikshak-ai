from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from src.governance.detector_registry import REGISTRY_VERSION

PIPELINE_VERSION = "1.0"

OFFICIAL_DATA_PROVENANCE = {
    "classification": "OFFICIAL_DATA",
    "dataset_name": "MPLADS Official Project Recommendations Snapshot",
    "source_name": "Ministry of Statistics and Programme Implementation (MoSPI) Public Portal",
    "source_url": None,  # Not hardcoded or assumed
    "record_count": 742,
    "snapshot_type": "Static Research & Analysis Snapshot",
    "snapshot_date": None,  # Unknown; not fabricated
    "data_period": None,    # Unknown; not fabricated
    "last_refresh_date": None,  # Static snapshot
    "available_fields": [
        "mp_name", "work", "category", "state", "constituency",
        "ida", "city", "ward", "block", "village",
        "recommended_date", "allocation_amount", "ida_approval", "status", "house"
    ],
    "unavailable_fields": [
        "canonical_district", "sanctioned_amount", "approved_estimate",
        "funds_released", "expenditure_amount", "individual_payments",
        "physical_progress_percent", "milestones", "expected_completion_date",
        "actual_completion_date", "delay_days", "latitude", "longitude",
        "site_photographs", "measurement_books", "completion_certificates"
    ],
    "pipeline_stage": "CLEANED_AND_ENGINEERED",
    "pipeline_version": PIPELINE_VERSION,
    "detector_registry_version": REGISTRY_VERSION
}

DERIVED_ANALYTICS_PROVENANCE = {
    "classification": "DERIVED_ANALYTICS",
    "analytics_components": [
        {
            "name": "Peer Benchmarks",
            "basis": "Local state + category statistical dispersion with national category fallback",
            "record_coverage": 742
        },
        {
            "name": "Exact Duplicate Clusters",
            "basis": "Deterministic matching on normalized work description, financial amount, state, constituency",
            "record_coverage": 742
        },
        {
            "name": "Contextual Near-Duplicate Pairs",
            "basis": "TF-IDF cosine similarity and administrative context overlap",
            "record_coverage": 742
        },
        {
            "name": "Investigation Priority Score (IPS)",
            "basis": "Multi-detector heuristic synthesis into priority tiers (LOW, MEDIUM, HIGH, CRITICAL)",
            "record_coverage": 742
        }
    ],
    "pipeline_version": PIPELINE_VERSION,
    "governance_note": "Derived analytical scores guide triage and review. They do not constitute evidence of legal wrongdoing."
}

DEMO_LIFECYCLE_PROVENANCE = {
    "classification": "DEMONSTRATION_LIFECYCLE_DATA",
    "dataset_name": "Demonstration Lifecycle Enrichment Cohort",
    "is_synthetic": True,
    "record_count": 12,
    "source_classification": "SYNTHETIC_DEMONSTRATION",
    "purpose": "Demonstrates prototype capabilities for complete lifecycle tracking, payment anomalies, physical milestone progress, and compliance gates.",
    "warning": "Demonstration data is strictly isolated from official public MPLADS records and must never be interpreted as government-verified execution records.",
    "enriched_records": [10, 26, 75, 117, 120, 170, 205, 208, 230, 350, 450, 512]
}

def get_system_provenance() -> Dict[str, Any]:
    """
    Returns complete dataset and pipeline provenance distinguishing official data,
    derived analytics, and isolated demonstration lifecycle data.
    """
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "service": "NIRIKSHAK AI Backend",
        "official_data": OFFICIAL_DATA_PROVENANCE,
        "derived_analytics": DERIVED_ANALYTICS_PROVENANCE,
        "demonstration_lifecycle": DEMO_LIFECYCLE_PROVENANCE,
        "disclaimer": "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."
    }
