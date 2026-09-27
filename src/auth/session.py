import os
import secrets
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Tuple
from fastapi import Response

COOKIE_NAME = os.getenv("NIRIKSHAK_COOKIE_NAME", "nirikshak_session")
COOKIE_SECURE = os.getenv("NIRIKSHAK_COOKIE_SECURE", "false").lower() in ("true", "1", "yes")
SESSION_LIFETIME_HOURS = int(os.getenv("NIRIKSHAK_SESSION_HOURS", "12"))

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def generate_session_token() -> str:
    """
    Generates a cryptographically-secure, unpredictable, opaque session token.
    256 bits of entropy.
    """
    return secrets.token_urlsafe(32)

def hash_session_token(token: str) -> str:
    """
    Computes SHA-256 hash of the session token for storage.
    Raw session tokens are never stored in the database.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def create_session(
    conn,
    user_id: str,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None
) -> Tuple[str, Dict[str, Any]]:
    """
    Creates a new server-side session for an authenticated user.
    Stores the token hash in the database and returns the raw opaque token
    to be set in the client's HttpOnly cookie.
    """
    raw_token = generate_session_token()
    token_hash = hash_session_token(raw_token)
    session_id = f"SESS-{secrets.token_hex(6).upper()}"
    
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    expires_at = (now + timedelta(hours=SESSION_LIFETIME_HOURS)).isoformat()
    
    with conn:
        conn.execute(
            """
            INSERT INTO sessions (
                session_id, user_id, token_hash, created_at, expires_at,
                last_seen_at, revoked_at, user_agent, ip_address
            ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)
            """,
            (session_id, user_id, token_hash, now_iso, expires_at, now_iso, user_agent, ip_address)
        )
    
    return raw_token, {
        "session_id": session_id,
        "user_id": user_id,
        "created_at": now_iso,
        "expires_at": expires_at,
        "last_seen_at": now_iso
    }

def get_session_by_token(conn, raw_token: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves an active, unrevoked, unexpired session using the raw token.
    Updates last_seen_at timestamp.
    """
    if not raw_token:
        return None
        
    token_hash = hash_session_token(raw_token)
    cur = conn.execute(
        """
        SELECT session_id, user_id, token_hash, created_at, expires_at, last_seen_at, revoked_at
        FROM sessions
        WHERE token_hash = ? AND revoked_at IS NULL
        """,
        (token_hash,)
    )
    row = cur.fetchone()
    if not row:
        return None
        
    # Check expiration
    expires_at = datetime.fromisoformat(row["expires_at"])
    now = datetime.now(timezone.utc)
    if now > expires_at:
        return None
        
    # Update last_seen_at
    now_iso = now.isoformat()
    try:
        with conn:
            conn.execute(
                "UPDATE sessions SET last_seen_at = ? WHERE session_id = ?",
                (now_iso, row["session_id"])
            )
    except Exception:
        pass
    
    return {
        "session_id": row["session_id"],
        "user_id": row["user_id"],
        "created_at": row["created_at"],
        "expires_at": row["expires_at"],
        "last_seen_at": now_iso
    }

def revoke_session(conn, raw_token: str) -> bool:
    """
    Revokes the session associated with the provided raw token.
    """
    if not raw_token:
        return False
        
    token_hash = hash_session_token(raw_token)
    now_iso = _now_iso()
    with conn:
        cur = conn.execute(
            "UPDATE sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL",
            (now_iso, token_hash)
        )
    return cur.rowcount > 0

def set_session_cookie(response: Response, raw_token: str) -> None:
    """
    Sets the secure HttpOnly session cookie on the response.
    """
    max_age = SESSION_LIFETIME_HOURS * 3600
    response.set_cookie(
        key=COOKIE_NAME,
        value=raw_token,
        max_age=max_age,
        httponly=True,
        samesite="lax",
        path="/",
        secure=COOKIE_SECURE
    )

def clear_session_cookie(response: Response) -> None:
    """
    Clears the session cookie from the client.
    """
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE
    )
