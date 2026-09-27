import os
import json
import logging
from typing import Dict, Any, List, Optional
import pandas as pd

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join("data", "enrichment", "demo_lifecycle")
JSON_PATH = os.path.join(DATA_DIR, "demo_project_lifecycle.json")
CSV_PATH = os.path.join(DATA_DIR, "demo_project_lifecycle.csv")

_DEMO_CACHE: Optional[Dict[int, Dict[str, Any]]] = None

def load_demo_projects(force_reload: bool = False) -> Dict[int, Dict[str, Any]]:
    """
    Loads and caches the 12 demonstration lifecycle projects.
    Prefers the consolidated JSON file and falls back to CSV if needed.
    """
    global _DEMO_CACHE
    if _DEMO_CACHE is not None and not force_reload:
        return _DEMO_CACHE

    cache: Dict[int, Dict[str, Any]] = {}

    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                records = data.get("records", [])
                for r in records:
                    rec_id = int(r["record_id"])
                    cache[rec_id] = r
                _DEMO_CACHE = cache
                return _DEMO_CACHE
        except Exception as e:
            logger.warning(f"Error loading demo JSON {JSON_PATH}: {e}. Falling back to CSV.")

    if os.path.exists(CSV_PATH):
        try:
            df = pd.read_csv(CSV_PATH)
            for _, row in df.iterrows():
                rec_id = int(row["record_id"])
                cache[rec_id] = row.to_dict()
                cache[rec_id]["payments"] = []
                cache[rec_id]["milestones"] = []
                cache[rec_id]["assets"] = []
                cache[rec_id]["inspections"] = []
            _DEMO_CACHE = cache
            return _DEMO_CACHE
        except Exception as e:
            logger.error(f"Error loading demo CSV {CSV_PATH}: {e}")

    _DEMO_CACHE = {}
    return _DEMO_CACHE

def is_demo_record(record_id: int) -> bool:
    """Checks whether the given record_id is one of the demonstration projects."""
    projects = load_demo_projects()
    return int(record_id) in projects

def get_demo_record_ids() -> List[int]:
    """Returns sorted list of record IDs in the demonstration cohort."""
    projects = load_demo_projects()
    return sorted(list(projects.keys()))

def get_demo_project_raw(record_id: int) -> Optional[Dict[str, Any]]:
    """Returns raw dictionary for a demo project, or None if not a demo record."""
    projects = load_demo_projects()
    return projects.get(int(record_id))

def get_all_demo_projects_raw() -> List[Dict[str, Any]]:
    """Returns list of all 12 demo project raw records."""
    projects = load_demo_projects()
    return list(projects.values())
