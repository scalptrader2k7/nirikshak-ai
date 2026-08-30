from typing import List, Dict, Any, Optional, Tuple
import math
from src.api.data_loader import get_cases

def get_case_by_id(record_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieves a single investigation case by its record_id.
    """
    cases = get_cases()
    for case in cases:
        if case["record_id"] == record_id:
            return case
    return None

def get_filtered_cases(
    page: int = 1,
    page_size: int = 20,
    priority: Optional[str] = None,
    detector: Optional[str] = None,
    severity: Optional[str] = None,
    state: Optional[str] = None,
    constituency: Optional[str] = None,
    mp_name: Optional[str] = None,
    work_type: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = "rank",
    sort_order: str = "asc"
) -> Tuple[List[Dict[str, Any]], int, int]:
    """
    Applies filters, search query, sorting, and pagination to the cached investigation cases.
    Returns (sliced_cases_list, total_records, total_pages).
    """
    cases = get_cases()
    filtered_cases = []
    
    # 1. Apply Filtering
    for case in cases:
        # Priority check (exact, e.g. LOW, MEDIUM, HIGH, CRITICAL)
        if priority is not None and str(case.get("investigation_priority_level")).upper() != priority.upper():
            continue
            
        # Detector check (exact case-insensitive)
        if detector is not None and str(case.get("primary_detector")).lower() != detector.lower():
            continue
            
        # Severity check (exact case-insensitive)
        if severity is not None and str(case.get("highest_severity")).lower() != severity.lower():
            continue
            
        # State check (exact case-insensitive)
        if state is not None and str(case.get("state")).lower() != state.lower():
            continue
            
        # Constituency check (exact case-insensitive)
        if constituency is not None and str(case.get("constituency")).lower() != constituency.lower():
            continue
            
        # MP Name check (exact case-insensitive)
        if mp_name is not None and str(case.get("mp_name")).lower() != mp_name.lower():
            continue
            
        # Work Type check (exact case-insensitive)
        if work_type is not None and str(case.get("work_type")).lower() != work_type.lower():
            continue
            
        # Score Range check
        score = case.get("investigation_priority_score", 0.0)
        if min_score is not None and score < min_score:
            continue
        if max_score is not None and score > max_score:
            continue
            
        # Search check (case-insensitive partial match across multiple text fields)
        if search is not None:
            s_term = search.lower().strip()
            search_fields = [
                str(case.get("record_id")),
                str(case.get("work", "")),
                str(case.get("mp_name", "")),
                str(case.get("state", "")),
                str(case.get("constituency", "")),
                str(case.get("city", "")),
                str(case.get("ward", "")),
                str(case.get("block", "")),
                str(case.get("village", ""))
            ]
            if not any(s_term in f.lower() for f in search_fields):
                continue
                
        # If all matches succeed
        filtered_cases.append(case)
        
    # 2. Apply Sorting
    whitelisted_sort_fields = ["rank", "investigation_priority_score", "allocation_amount", "record_id"]
    if sort_by not in whitelisted_sort_fields:
        sort_by = "rank"
        
    is_descending = (sort_order.lower() == "desc")
    
    def sorting_key(c):
        val = c.get(sort_by)
        if val is None:
            return float('inf') if not is_descending else float('-inf')
        return val
        
    sorted_cases = sorted(filtered_cases, key=sorting_key, reverse=is_descending)
    
    # 3. Apply Pagination
    total_records = len(sorted_cases)
    total_pages = math.ceil(total_records / page_size) if total_records > 0 else 1
    
    # Safe offset index calculations
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    sliced_cases = sorted_cases[start_idx:end_idx]
    
    return sliced_cases, total_records, total_pages
