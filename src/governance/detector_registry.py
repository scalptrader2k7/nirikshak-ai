from typing import Dict, Any, List

REGISTRY_VERSION = "1.0"
VERSIONING_NOTE = "Formal semantic versioning for analytical detectors begins with Release 1.0 (Phase B4). Historical version iterations were unversioned prototype builds."

DETECTOR_REGISTRY: List[Dict[str, Any]] = [
    {
        "detector_id": "cost_anomaly",
        "detector_name": "Cost Deviation Detector",
        "detector_version": "1.0",
        "description": "Evaluates project allocation amount relative to peer projects within the same state and work category, falling back to nationwide category peers when local peer sample size is less than 3.",
        "input_fields": ["allocation_amount", "state", "work_type", "category"],
        "threshold_config_summary": {
            "min_peer_group_size": 3,
            "deviation_threshold_ratio": 2.0,
            "deviation_threshold_percent": 100.0,
            "national_fallback_enabled": True
        },
        "output_type": "boolean_signal_with_ratio",
        "limitations": [
            "Does not account for terrain difficulty, inflation index, or high-specification engineering components.",
            "Refers strictly to recommendation/allocation amounts, not final audited expenditure.",
            "Cannot establish true cost overruns or intentional irregularities."
        ],
        "interpretation": "Identifies statistical dispersion where allocation exceeds 2.0x peer median. Signals warrant administrative verification of technical estimates.",
        "last_updated": "2026-09-27"
    },
    {
        "detector_id": "exact_duplicate_anomaly",
        "detector_name": "Exact Duplicate Detector",
        "detector_version": "1.0",
        "description": "Groups project records with identical normalized work descriptions, state, constituency, and financial allocation amounts.",
        "input_fields": ["work", "state", "constituency", "allocation_amount", "recommended_date"],
        "threshold_config_summary": {
            "text_normalization": "lowercase, punctuation stripped, whitespace collapsed",
            "matching_keys": ["work_clean", "allocation_amount", "state", "constituency"]
        },
        "output_type": "boolean_signal_with_group_id",
        "limitations": [
            "Cannot determine whether recurring rows represent clerical multi-phase batch entries or duplicate data entry submissions.",
            "Requires physical measurement books and sanction orders for verification."
        ],
        "interpretation": "Flags identical project descriptions occurring multiple times for administrative deduplication and verification.",
        "last_updated": "2026-09-27"
    },
    {
        "detector_id": "near_duplicate_anomaly",
        "detector_name": "Near Duplicate & Contextual Similarity Detector",
        "detector_version": "1.0",
        "description": "Computes TF-IDF vector cosine similarity across project work descriptions combined with administrative context overlap (same constituency, block, village, or IDA).",
        "input_fields": ["work", "state", "constituency", "ida", "block", "village", "city", "ward"],
        "threshold_config_summary": {
            "tf_idf_ngram_range": [1, 2],
            "text_similarity_threshold": 0.85,
            "context_similarity_weights": {
                "state": 0.2,
                "constituency": 0.3,
                "location_micro": 0.3,
                "same_mp": 0.2
            },
            "template_frequency_threshold": 5
        },
        "output_type": "continuous_score_and_pair_classification",
        "limitations": [
            "Standardized public work descriptions (e.g., 'Installation of solar street lights') naturally exhibit high text similarity across multiple genuine sites.",
            "Does not confirm duplicate work execution."
        ],
        "interpretation": "Classifies pairs into TEMPLATE_SIMILARITY, CONTEXTUAL_SIMILARITY, or POTENTIAL_NEAR_DUPLICATE to guide field inspections.",
        "last_updated": "2026-09-27"
    },
    {
        "detector_id": "pattern_anomaly",
        "detector_name": "Temporal Burst & Recommendation Pattern Detector",
        "detector_version": "1.0",
        "description": "Detects rapid recommendation surges within 30-day rolling windows per constituency and per MP, identifying recommendation bunching.",
        "input_fields": ["recommended_date", "mp_name", "constituency"],
        "threshold_config_summary": {
            "rolling_window_days": 30,
            "surge_percentile_cutoff": 95.0
        },
        "output_type": "boolean_signal_with_burst_count",
        "limitations": [
            "End-of-financial-year recommendation bunching is standard administrative practice under MPLADS guidelines.",
            "Surge patterns do not imply irregular or improper recommendation."
        ],
        "interpretation": "Highlights high-frequency recommendation clusters requiring administrative capacity review.",
        "last_updated": "2026-09-27"
    },
    {
        "detector_id": "investigation_priority_score",
        "detector_name": "Investigation Priority Score (IPS) Aggregation Engine",
        "detector_version": "1.0",
        "description": "Synthesizes multi-detector signals (cost, exact duplicate, near duplicate, pattern) into a normalized 0-100 score and categorical priority tiers (LOW, MEDIUM, HIGH, CRITICAL).",
        "input_fields": [
            "cost_anomaly",
            "exact_duplicate_anomaly",
            "near_duplicate_anomaly",
            "pattern_anomaly",
            "amount_ratio_to_median",
            "duplicate_occurrence_count"
        ],
        "threshold_config_summary": {
            "tier_low": [0, 39],
            "tier_medium": [40, 69],
            "tier_high": [70, 89],
            "tier_critical": [90, 100]
        },
        "output_type": "priority_score_and_level",
        "limitations": [
            "Heuristic aggregation designed for triage and audit prioritization only.",
            "A high IPS score reflects signal convergence, not evidence of misconduct or fraud."
        ],
        "interpretation": "Ranks cases to optimize allocation of investigative attention and technical inspection resources.",
        "last_updated": "2026-09-27"
    }
]

def get_detector_registry() -> Dict[str, Any]:
    """
    Returns the complete detector governance registry.
    """
    return {
        "registry_version": REGISTRY_VERSION,
        "versioning_note": VERSIONING_NOTE,
        "total_detectors": len(DETECTOR_REGISTRY),
        "detectors": DETECTOR_REGISTRY,
        "disclaimer": "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."
    }

def get_detector_metadata(detector_id: str) -> Dict[str, Any]:
    """
    Returns governance metadata for a specific detector.
    """
    target = detector_id.strip().lower()
    for d in DETECTOR_REGISTRY:
        if d["detector_id"].lower() == target:
            return d
    return {}
