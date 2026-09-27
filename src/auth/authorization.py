from typing import Dict, Any, List, Optional, Callable
from fastapi import Request, HTTPException, status, Depends
from src.persistence.database import get_connection, init_db
from src.auth.session import COOKIE_NAME, get_session_by_token
from src.auth.roles import Role, ScopeType, get_recommended_portal, OFFICIAL_WORKFLOW_ROLES, normalize_role
from src.api.config import ALLOWED_ORIGINS
from src.scoping.scope_service import (
    can_access_project,
    can_mutate_workflow,
    filter_projects_for_user,
    filter_cases_for_user,
    get_effective_scope
)
from src.scoping.district_scope import is_record_in_district

def get_optional_current_user(request: Request) -> Optional[Dict[str, Any]]:
    """
    FastAPI dependency that extracts and validates the session from either:
    1. HttpOnly cookie (preferred)
    2. Authorization: Bearer <token> header (API fallback)
    
    Returns the full user profile with authoritative role, scope, and recommended portal,
    or None if unauthenticated.
    """
    raw_token = request.cookies.get(COOKIE_NAME)
    if not raw_token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            raw_token = auth_header[7:].strip()
            
    if not raw_token:
        return None
        
    init_db()
    conn = get_connection()
    try:
        session = get_session_by_token(conn, raw_token)
        if not session:
            return None
            
        cur = conn.execute(
            """
            SELECT user_id, email, full_name, role, is_active,
                   onboarding_completed, created_at, updated_at,
                   last_login_at, designation, phone
            FROM users WHERE user_id = ?
            """,
            (session["user_id"],)
        )
        user_row = cur.fetchone()
        if not user_row or not user_row["is_active"]:
            return None
            
        # Fetch authoritative scope
        scope_cur = conn.execute(
            """
            SELECT scope_id, scope_type, state, district, constituency, mp_name
            FROM user_scopes WHERE user_id = ?
            """,
            (session["user_id"],)
        )
        scope_row = scope_cur.fetchone()
        scope = dict(scope_row) if scope_row else {
            "scope_id": "DEFAULT",
            "scope_type": ScopeType.NATIONAL.value,
            "state": None,
            "district": None,
            "constituency": None,
            "mp_name": None
        }
        
        user_role = user_row["role"]
        return {
            "user_id": user_row["user_id"],
            "email": user_row["email"],
            "full_name": user_row["full_name"],
            "role": user_role,
            "is_active": bool(user_row["is_active"]),
            "onboarding_completed": bool(user_row["onboarding_completed"]),
            "created_at": user_row["created_at"],
            "updated_at": user_row["updated_at"],
            "last_login_at": user_row["last_login_at"],
            "designation": user_row["designation"],
            "phone": user_row["phone"],
            "scope": scope,
            "session_id": session["session_id"],
            "recommended_portal": get_recommended_portal(user_role)
        }
    finally:
        conn.close()

def get_current_user(current_user: Optional[Dict[str, Any]] = Depends(get_optional_current_user)) -> Dict[str, Any]:
    """
    FastAPI dependency requiring an active, valid authenticated user.
    Raises HTTP 401 if unauthenticated.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Cookie"}
        )
    return current_user

def require_roles(*allowed_roles: str) -> Callable:
    """
    Dependency factory to enforce backend-authoritative role check.
    Raises HTTP 403 if authenticated user lacks required role.
    """
    allowed_set = {normalize_role(r) for r in allowed_roles}
    
    def role_checker(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = normalize_role(user.get("role", ""))
        if user_role == Role.ADMIN.value or user_role in allowed_set:
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access forbidden: User role '{user_role}' is not authorized for this resource."
        )
    return role_checker

def require_workflow_mutation_user(
    request: Request,
    user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    FastAPI dependency requiring an active, authenticated user with an authorized
    operational mutation role (DISTRICT_AUTHORITY, or internal compatibility roles ADMIN, INVESTIGATOR).
    
    Enforces:
    - HTTP 401 if unauthenticated (via get_current_user)
    - HTTP 403 if authenticated user has unauthorized role (e.g. CITIZEN, MP, MOSPI, STATE_NODAL_AUTHORITY)
    - HTTP 403 if request Origin header is untrusted
    """
    origin = request.headers.get("origin")
    if origin and ALLOWED_ORIGINS and origin not in ALLOWED_ORIGINS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Untrusted request origin."
        )

    user_role = normalize_role(user.get("role", ""))
    allowed_roles = {normalize_role(r) for r in OFFICIAL_WORKFLOW_ROLES}
    if user_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access forbidden: User role '{user_role}' is not authorized to mutate investigation workflows."
        )
    return user

def authorize_record_access(record: Dict[str, Any], user_scope: Optional[Dict[str, Any]]) -> bool:
    """
    Determines whether a project record is within the user's data scope.
    Strictly forbids fuzzy matching on district, block, or village.
    """
    if not user_scope:
        return True
        
    scope_type = user_scope.get("scope_type", ScopeType.NATIONAL.value).upper()
    if scope_type == ScopeType.NATIONAL.value:
        return True
        
    if scope_type == ScopeType.STATE.value:
        target_state = user_scope.get("state")
        if not target_state:
            return True
        rec_state = record.get("state")
        return bool(rec_state and str(rec_state).strip().lower() == str(target_state).strip().lower())
        
    if scope_type == ScopeType.CONSTITUENCY.value:
        target_constituency = user_scope.get("constituency")
        if not target_constituency:
            return True
        rec_constituency = record.get("constituency")
        return bool(rec_constituency and str(rec_constituency).strip().lower() == str(target_constituency).strip().lower())
        
    if scope_type == ScopeType.DISTRICT.value:
        target_district = user_scope.get("district")
        if not target_district:
            return False

        rec_district = record.get("district")
        if rec_district:
            return str(rec_district).strip().lower() == str(target_district).strip().lower()

        rec_id = int(record.get("record_id") or record.get("original_row_index") or 0)
        target_state = user_scope.get("state")
        return is_record_in_district(rec_id, str(target_district), str(target_state) if target_state else None)
        
    return True

def filter_records_by_scope(records: List[Dict[str, Any]], user_scope: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Filters a list of records according to user's assigned data scope.
    """
    if not user_scope or user_scope.get("scope_type", "").upper() == ScopeType.NATIONAL.value:
        return records
    return [r for r in records if authorize_record_access(r, user_scope)]
