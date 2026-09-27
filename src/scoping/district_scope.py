import os
import csv
from typing import Dict, Any, List, Optional
from src.api.config import BASE_DIR

MAPPING_PATH = os.path.join(BASE_DIR, "data", "enrichment", "district_mapping", "trusted_districts.csv")

_TRUSTED_DISTRICT_CACHE: Optional[Dict[int, Dict[str, Any]]] = None

def load_trusted_district_mappings(force_reload: bool = False) -> Dict[int, Dict[str, Any]]:
    """
    Loads curated, verified district mappings from trusted_districts.csv.
    This layer provides deterministic district scoping without fuzzy guessing.
    """
    global _TRUSTED_DISTRICT_CACHE
    if _TRUSTED_DISTRICT_CACHE is not None and not force_reload:
        return _TRUSTED_DISTRICT_CACHE

    mappings: Dict[int, Dict[str, Any]] = {}
    if os.path.exists(MAPPING_PATH):
        with open(MAPPING_PATH, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    rec_id = int(row["record_id"].strip())
                    is_trusted_bool = row.get("is_trusted", "True").strip().lower() in ("true", "1", "yes")
                    mappings[rec_id] = {
                        "record_id": rec_id,
                        "canonical_district": row["canonical_district"].strip(),
                        "state": row["state"].strip(),
                        "mapping_source": row.get("mapping_source", "OFFICIAL_GAZETTEER").strip(),
                        "mapping_reference": row.get("mapping_reference", "").strip(),
                        "mapping_method": row.get("mapping_method", "EXPLICIT").strip(),
                        "mapping_confidence": row.get("mapping_confidence", "HIGH").strip(),
                        "is_trusted": is_trusted_bool
                    }
                except (ValueError, KeyError):
                    continue

    _TRUSTED_DISTRICT_CACHE = mappings
    return mappings

def get_trusted_district_mapping(record_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieves the trusted district mapping for a specific project record.
    Returns None if the record does not have a trusted canonical mapping.
    """
    mappings = load_trusted_district_mappings()
    mapping = mappings.get(record_id)
    if mapping and mapping.get("is_trusted"):
        return mapping
    return None

def is_record_in_district(record_id: int, district: str, state: Optional[str] = None) -> bool:
    """
    Determines whether a project record is within the specified canonical district.
    Strictly forbids fuzzy matching, approximate text rules, or guessing.
    Secure-by-default: Unmapped records return False.
    """
    mapping = get_trusted_district_mapping(record_id)
    if not mapping:
        return False

    target_district = district.strip().lower()
    mapping_district = mapping["canonical_district"].strip().lower()

    if mapping_district != target_district:
        return False

    if state:
        target_state = state.strip().lower()
        mapping_state = mapping["state"].strip().lower()
        if mapping_state != target_state:
            return False

    return True

def get_trusted_record_ids_for_district(district: str, state: Optional[str] = None) -> List[int]:
    """
    Returns all project record IDs mapped with high confidence to the requested district.
    """
    mappings = load_trusted_district_mappings()
    target_dist = district.strip().lower()
    target_state = state.strip().lower() if state else None

    matched = []
    for rec_id, m in mappings.items():
        if not m.get("is_trusted"):
            continue
        if m["canonical_district"].strip().lower() == target_dist:
            if target_state is None or m["state"].strip().lower() == target_state:
                matched.append(rec_id)
    return sorted(matched)

def count_trusted_district_mappings() -> int:
    """Returns the total number of trusted district mappings currently registered."""
    mappings = load_trusted_district_mappings()
    return sum(1 for m in mappings.values() if m.get("is_trusted"))
