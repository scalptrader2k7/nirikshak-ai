from typing import Dict, Any, List, Optional, Union
from src.scoping.district_scope import is_record_in_district
from src.api.data_loader import get_clean_df

def get_effective_scope(user: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Extracts and standardizes the effective scope parameters for an authenticated user.
    """
    if not user:
        return {
            "scope_type": "PUBLIC",
            "state": None,
            "district": None,
            "constituency": None
        }

    role = user.get("role", "").upper().strip()
    if role in ("MOSPI", "ADMIN", "INVESTIGATOR"):
        return {
            "scope_type": "NATIONAL",
            "state": None,
            "district": None,
            "constituency": None
        }

    raw_scope = user.get("scope") or {}
    scope_type = raw_scope.get("scope_type", "").upper().strip()

    # If the account has NATIONAL scope assigned without local constraints, it has NATIONAL scope
    if scope_type == "NATIONAL" and not raw_scope.get("state") and not raw_scope.get("district") and not raw_scope.get("constituency"):
        return {
            "scope_type": "NATIONAL",
            "state": None,
            "district": None,
            "constituency": None
        }

    # Map role defaults if scope_type is generic or unassigned
    if role in ("STATE_NODAL", "STATE_NODAL_AUTHORITY"):
        scope_type = "STATE"
    elif role == "DISTRICT_AUTHORITY":
        scope_type = "DISTRICT"
    elif role == "MP":
        scope_type = "CONSTITUENCY"
    elif not scope_type:
        scope_type = "NATIONAL"

    return {
        "scope_type": scope_type,
        "state": raw_scope.get("state"),
        "district": raw_scope.get("district"),
        "constituency": raw_scope.get("constituency")
    }

def _resolve_project_dict(project_or_id: Union[int, Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Resolves a project record dictionary from a dict or record_id."""
    if isinstance(project_or_id, dict):
        return project_or_id
    elif isinstance(project_or_id, (int, str)):
        try:
            rid = int(project_or_id)
        except ValueError:
            return None
        clean_df = get_clean_df()
        if clean_df.empty:
            return None
        match = clean_df[clean_df["original_row_index"] == rid]
        if not match.empty:
            return match.iloc[0].to_dict()
    return None

def can_access_project(user: Optional[Dict[str, Any]], project: Union[int, Dict[str, Any]]) -> bool:
    """
    Authoritative backend check determining whether a project is within the user's data scope.
    
    Rules:
    - Unauthenticated: False (internal endpoints require authentication)
    - MOSPI / ADMIN / INVESTIGATOR: True (National scope)
    - STATE_NODAL / STATE_NODAL_AUTHORITY: Record's state must match user's authorized state
    - MP: Record's constituency must match user's authorized constituency
    - DISTRICT_AUTHORITY: Must match via trusted canonical district mapping; unmapped -> False
    - CITIZEN: False for internal views
    """
    if not user:
        return False

    role = user.get("role", "").upper().strip()
    if role in ("MOSPI", "ADMIN", "INVESTIGATOR"):
        return True

    proj_dict = _resolve_project_dict(project)
    if not proj_dict:
        return False

    rec_id = int(proj_dict.get("record_id") or proj_dict.get("original_row_index") or 0)
    scope = get_effective_scope(user)
    scope_type = scope.get("scope_type", "").upper()

    if scope_type == "NATIONAL":
        return True

    if scope_type == "STATE":
        target_state = scope.get("state")
        if not target_state:
            return False
        rec_state = proj_dict.get("state")
        return bool(rec_state and str(rec_state).strip().lower() == str(target_state).strip().lower())

    if scope_type == "CONSTITUENCY":
        target_constituency = scope.get("constituency")
        if not target_constituency:
            return False
        rec_constituency = proj_dict.get("constituency")
        return bool(rec_constituency and str(rec_constituency).strip().lower() == str(target_constituency).strip().lower())

    if scope_type == "DISTRICT":
        target_district = scope.get("district")
        if not target_district:
            return False
        target_state = scope.get("state")
        return is_record_in_district(rec_id, str(target_district), str(target_state) if target_state else None)

    return False

def can_mutate_workflow(user: Optional[Dict[str, Any]], project_or_record_id: Union[int, Dict[str, Any]]) -> bool:
    """
    Determines whether a user is authorized to perform workflow state mutations, human reviews,
    or evidence requests for the specified project.
    
    Enforces:
    - User must have an operational mutation role: DISTRICT_AUTHORITY (or internal ADMIN, INVESTIGATOR)
    - MOSPI and STATE_NODAL_AUTHORITY are read-only oversight/coordination roles and CANNOT perform district operational mutations
    - MP and CITIZEN are strictly forbidden from mutating forensic/investigation workflows
    - DISTRICT_AUTHORITY must have administrative scope over the project via trusted district mapping
    """
    if not user:
        return False

    role = user.get("role", "").upper().strip()
    allowed_mutation_roles = {
        "DISTRICT_AUTHORITY",
        "INVESTIGATOR",
        "ADMIN"
    }

    if role not in allowed_mutation_roles:
        return False

    return can_access_project(user, project_or_record_id)

def filter_projects_for_user(
    user: Optional[Dict[str, Any]],
    projects: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Filters a collection of project dictionaries according to the user's authoritative scope.
    """
    if not user:
        return []
    role = user.get("role", "").upper().strip()
    if role in ("MOSPI", "ADMIN", "INVESTIGATOR"):
        return projects

    return [p for p in projects if can_access_project(user, p)]

def filter_cases_for_user(
    user: Optional[Dict[str, Any]],
    cases: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Filters a collection of investigation cases according to the user's authoritative scope.
    """
    if not user:
        return []
    role = user.get("role", "").upper().strip()
    if role in ("MOSPI", "ADMIN", "INVESTIGATOR"):
        return cases

    return [c for c in cases if can_access_project(user, c)]
