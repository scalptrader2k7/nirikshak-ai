import math
from typing import Dict, Any, Optional
from src.enrichment.demo_loader import is_demo_record, get_demo_project_raw
from src.enrichment.demo_financials import compute_demo_financials
from src.enrichment.demo_progress import compute_demo_progress
from src.enrichment.demo_payments import analyze_demo_payments
from src.enrichment.demo_assets import format_demo_assets
from src.enrichment.demo_compliance import run_demo_compliance_screening
from src.api.data_loader import get_clean_df

DISCLAIMER = (
    "DEMONSTRATION ONLY: Synthetic lifecycle data generated for prototype demonstration. "
    "Not part of official MoSPI public record."
)

def _haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two coordinate pairs in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 1)

def get_demo_lifecycle_payload(record_id: int) -> Optional[Dict[str, Any]]:
    """
    Builds the complete demonstration lifecycle payload for a record.
    Returns:
    - Full demonstration package if record_id in the 12 demo projects.
    - Non-available fallback payload if record_id is a valid MPLADS project (1-742) but not in demo cohort.
    - None if record_id does not exist in the dataset at all (triggers 404).
    """
    clean_df = get_clean_df()
    if clean_df.empty or "original_row_index" not in clean_df.columns:
        return None

    # Check if record exists in the official 742-row dataset
    exists_in_clean = int(record_id) in clean_df["original_row_index"].astype(int).values
    if not exists_in_clean:
        return None

    if not is_demo_record(record_id):
        return {
            "record_id": int(record_id),
            "is_demo_enrichment": False,
            "available": False,
            "data_source": "OFFICIAL_MPLADS_SNAPSHOT",
            "source_classification": "OFFICIAL_MOSPI_DATA",
            "message": "Demonstration lifecycle data is only available for the 12 demonstration projects."
        }

    raw = get_demo_project_raw(record_id)
    if not raw:
        return None

    financials = compute_demo_financials(raw)
    progress = compute_demo_progress(raw, financials)
    payments = analyze_demo_payments(
        raw_payments=raw.get("payments", []),
        raw_milestones=raw.get("milestones", []),
        agency_name=raw.get("agency_name", "")
    )
    assets = format_demo_assets(raw.get("assets", []))
    compliance = run_demo_compliance_screening(raw, financials, progress, payments, assets)

    # Geospatial & Proximity Clustering
    lat = raw.get("latitude")
    lon = raw.get("longitude")
    proximity_cluster: Optional[Dict[str, Any]] = None

    if int(record_id) in (117, 120):
        # 117 and 120 form a synthetic proximate cluster (< 100 meters)
        other_id = 120 if int(record_id) == 117 else 117
        other_raw = get_demo_project_raw(other_id)
        if other_raw:
            dist = _haversine_distance_meters(lat, lon, other_raw.get("latitude"), other_raw.get("longitude"))
            proximity_cluster = {
                "cluster_tag": "BENGALURU_RURAL_ROAD_CLUSTER_01",
                "is_proximate_cluster": True,
                "distance_to_neighbor_meters": dist,
                "neighbor_record_id": other_id,
                "cluster_risk_note": (
                    f"Geospatial Proximity Warning: Located {dist}m from Project #{other_id} "
                    f"with identical work type and same executing agency ('{raw.get('agency_name')}')."
                )
            }

    geospatial_info = {
        "latitude": lat,
        "longitude": lon,
        "location_source": raw.get("location_source", "SYNTHETIC_DEMO_COORDINATES"),
        "proximity_cluster": proximity_cluster
    }

    return {
        "record_id": int(record_id),
        "is_demo_enrichment": True,
        "available": True,
        "data_source": "DEMONSTRATION_LIFECYCLE_DATA",
        "source_classification": "SYNTHETIC_DEMONSTRATION",
        "disclaimer": DISCLAIMER,
        "is_healthy_control": raw.get("is_healthy_control", False),
        "project_metadata": {
            "state": raw.get("state"),
            "constituency": raw.get("constituency"),
            "work_type": raw.get("work_type"),
            "work_order_number": raw.get("work_order_number"),
            "work_order_date": raw.get("work_order_date"),
            "agency_name": raw.get("agency_name"),
            "sanction_date": raw.get("sanction_date"),
            "completion_certificate_available": raw.get("completion_certificate_available", False)
        },
        "financial_intelligence": financials,
        "execution_progress": progress,
        "milestones": raw.get("milestones", []),
        "payment_intelligence": payments,
        "inspections": raw.get("inspections", []),
        "asset_register": assets,
        "geospatial": geospatial_info,
        "compliance_screening": compliance
    }
