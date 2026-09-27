import uuid
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any, Tuple, List
from src.persistence.database import get_connection, init_db
from src.auth.password import hash_password, verify_password
from src.auth.session import create_session, get_session_by_token, revoke_session
from src.auth.roles import Role, ScopeType, get_recommended_portal, VALID_ROLES, VALID_SCOPE_TYPES

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def record_auth_event(
    conn,
    user_id: Optional[str],
    event_type: str,
    success: int,
    metadata: Optional[Dict[str, Any]] = None
) -> str:
    """
    Records an immutable security audit event.
    Guarantees no passwords, password hashes, or raw tokens are stored in metadata.
    """
    event_id = f"AEV-{uuid.uuid4().hex[:10].upper()}"
    ts = _now_iso()
    
    # Filter sensitive keys if any accidentally slipped into metadata
    safe_metadata = {}
    if metadata:
        for k, v in metadata.items():
            if k.lower() not in ("password", "password_hash", "token", "raw_token", "secret"):
                safe_metadata[k] = v
                
    conn.execute(
        """
        INSERT INTO auth_events (event_id, user_id, event_type, timestamp, success, metadata)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (event_id, user_id, event_type, ts, success, json.dumps(safe_metadata))
    )
    return event_id

def provision_user(
    email: str,
    password: str,
    full_name: str,
    role: str,
    scope_type: str = ScopeType.NATIONAL.value,
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None,
    mp_name: Optional[str] = None,
    designation: Optional[str] = None,
    phone: Optional[str] = None,
    is_active: bool = True,
    onboarding_completed: bool = False,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Administrative provisioning utility to securely create backend accounts with
    authoritative roles and assigned data scopes.
    """
    role_norm = role.upper().strip()
    if role_norm not in VALID_ROLES:
        raise ValueError(f"Invalid role '{role}'. Allowed: {', '.join(sorted(VALID_ROLES))}")
        
    scope_norm = scope_type.upper().strip()
    if scope_norm not in VALID_SCOPE_TYPES:
        raise ValueError(f"Invalid scope type '{scope_type}'. Allowed: {', '.join(sorted(VALID_SCOPE_TYPES))}")
        
    init_db()
    conn = get_connection()
    try:
        email_clean = email.strip().lower()
        pwd_hash = hash_password(password)
        actual_user_id = user_id or f"USR-{uuid.uuid4().hex[:8].upper()}"
        scope_id = f"SCP-{uuid.uuid4().hex[:8].upper()}"
        now_ts = _now_iso()
        
        with conn:
            conn.execute(
                """
                INSERT INTO users (
                    user_id, email, password_hash, full_name, role,
                    is_active, onboarding_completed, created_at, updated_at,
                    designation, phone
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    actual_user_id, email_clean, pwd_hash, full_name.strip(), role_norm,
                    1 if is_active else 0, 1 if onboarding_completed else 0,
                    now_ts, now_ts, designation, phone
                )
            )
            
            conn.execute(
                """
                INSERT INTO user_scopes (
                    scope_id, user_id, scope_type, state, district, constituency, mp_name, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (scope_id, actual_user_id, scope_norm, state, district, constituency, mp_name, now_ts)
            )
            
            record_auth_event(
                conn, actual_user_id, "USER_PROVISIONED", 1,
                {"role": role_norm, "scope_type": scope_norm, "email": email_clean}
            )
            
        return {
            "user_id": actual_user_id,
            "email": email_clean,
            "full_name": full_name,
            "role": role_norm,
            "scope": {
                "scope_id": scope_id,
                "scope_type": scope_norm,
                "state": state,
                "district": district,
                "constituency": constituency,
                "mp_name": mp_name
            },
            "is_active": is_active,
            "onboarding_completed": onboarding_completed,
            "recommended_portal": get_recommended_portal(role_norm)
        }
    finally:
        conn.close()

def authenticate_user(
    email: str,
    password: str,
    client_ip: Optional[str] = None,
    user_agent: Optional[str] = None
) -> Tuple[Optional[Dict[str, Any]], Optional[str], Optional[str]]:
    """
    Authenticates a user by email and password.
    Returns:
        (user_profile, raw_session_token, error_message)
    Generic error response prevents account enumeration.
    """
    init_db()
    conn = get_connection()
    try:
        email_clean = email.strip().lower()
        cur = conn.execute(
            """
            SELECT user_id, email, password_hash, full_name, role, is_active,
                   onboarding_completed, created_at, updated_at, last_login_at,
                   designation, phone
            FROM users WHERE email = ?
            """,
            (email_clean,)
        )
        user_row = cur.fetchone()
        
        # Generic error message
        invalid_msg = "Invalid credentials."
        
        if not user_row:
            record_auth_event(
                conn, None, "LOGIN_FAILURE", 0,
                {"email": email_clean, "reason": "invalid_credentials", "ip": client_ip}
            )
            return None, None, invalid_msg
            
        user_dict = dict(user_row)
        
        if not user_dict["is_active"]:
            record_auth_event(
                conn, user_dict["user_id"], "LOGIN_FAILURE", 0,
                {"email": email_clean, "reason": "inactive_account", "ip": client_ip}
            )
            return None, None, "Account is inactive. Please contact an administrator."
            
        if not verify_password(password, user_dict["password_hash"]):
            record_auth_event(
                conn, user_dict["user_id"], "LOGIN_FAILURE", 0,
                {"email": email_clean, "reason": "invalid_credentials", "ip": client_ip}
            )
            return None, None, invalid_msg
            
        # Authentication successful
        now_ts = _now_iso()
        with conn:
            conn.execute(
                "UPDATE users SET last_login_at = ? WHERE user_id = ?",
                (now_ts, user_dict["user_id"])
            )
            raw_token, session_data = create_session(
                conn, user_dict["user_id"], user_agent=user_agent, ip_address=client_ip
            )
            record_auth_event(
                conn, user_dict["user_id"], "LOGIN_SUCCESS", 1,
                {"email": email_clean, "session_id": session_data["session_id"], "ip": client_ip}
            )
            
        # Load user scope
        scope_cur = conn.execute(
            "SELECT scope_id, scope_type, state, district, constituency, mp_name FROM user_scopes WHERE user_id = ?",
            (user_dict["user_id"],)
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
        
        profile = {
            "user_id": user_dict["user_id"],
            "email": user_dict["email"],
            "full_name": user_dict["full_name"],
            "role": user_dict["role"],
            "is_active": bool(user_dict["is_active"]),
            "onboarding_completed": bool(user_dict["onboarding_completed"]),
            "designation": user_dict["designation"],
            "phone": user_dict["phone"],
            "scope": scope,
            "recommended_portal": get_recommended_portal(user_dict["role"])
        }
        
        return profile, raw_token, None
    finally:
        conn.close()

def logout_user(raw_token: str) -> bool:
    """
    Terminates the session and logs the logout event.
    """
    if not raw_token:
        return False
        
    init_db()
    conn = get_connection()
    try:
        session = get_session_by_token(conn, raw_token)
        user_id = session["user_id"] if session else None
        
        with conn:
            success = revoke_session(conn, raw_token)
            if success:
                record_auth_event(conn, user_id, "LOGOUT", 1)
        return success
    finally:
        conn.close()

def update_onboarding_profile(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Updates safe profile fields during onboarding.
    Strictly forbids altering role, scope, is_active, email, or password_hash.
    """
    allowed_fields = {"full_name", "designation", "phone"}
    safe_updates = {k: v for k, v in updates.items() if k in allowed_fields and v is not None}
    
    init_db()
    conn = get_connection()
    try:
        now_ts = _now_iso()
        with conn:
            if safe_updates:
                set_clauses = [f"{k} = ?" for k in safe_updates]
                set_clauses.append("updated_at = ?")
                values = list(safe_updates.values()) + [now_ts, user_id]
                conn.execute(
                    f"UPDATE users SET {', '.join(set_clauses)} WHERE user_id = ?",
                    values
                )
                
            cur = conn.execute(
                """
                SELECT user_id, email, full_name, role, is_active,
                       onboarding_completed, designation, phone
                FROM users WHERE user_id = ?
                """,
                (user_id,)
            )
            row = cur.fetchone()
            if not row:
                raise KeyError(f"User '{user_id}' not found.")
                
            scope_cur = conn.execute(
                "SELECT scope_id, scope_type, state, district, constituency, mp_name FROM user_scopes WHERE user_id = ?",
                (user_id,)
            )
            scope_row = scope_cur.fetchone()
            scope = dict(scope_row) if scope_row else None
            
        return {
            "user_id": row["user_id"],
            "email": row["email"],
            "full_name": row["full_name"],
            "designation": row["designation"],
            "phone": row["phone"],
            "onboarding_completed": bool(row["onboarding_completed"]),
            "role": row["role"],
            "scope": scope
        }
    finally:
        conn.close()

def complete_user_onboarding(user_id: str) -> Dict[str, Any]:
    """
    Marks first-time onboarding completed for the authenticated user.
    """
    init_db()
    conn = get_connection()
    try:
        now_ts = _now_iso()
        with conn:
            conn.execute(
                "UPDATE users SET onboarding_completed = 1, updated_at = ? WHERE user_id = ?",
                (now_ts, user_id)
            )
            record_auth_event(conn, user_id, "ONBOARDING_COMPLETED", 1)
            
            cur = conn.execute(
                "SELECT user_id, email, full_name, role, onboarding_completed FROM users WHERE user_id = ?",
                (user_id,)
            )
            row = cur.fetchone()
            if not row:
                raise KeyError(f"User '{user_id}' not found.")
                
        return {
            "user_id": row["user_id"],
            "email": row["email"],
            "onboarding_completed": True,
            "message": "Onboarding completed successfully."
        }
    finally:
        conn.close()
