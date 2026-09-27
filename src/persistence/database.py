import os
import sqlite3
from typing import Optional
from src.api.config import BASE_DIR

RUNTIME_DIR = os.path.join(BASE_DIR, "data", "runtime")
DB_PATH = os.path.join(RUNTIME_DIR, "nirikshak.db")

def get_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    """
    Returns a connection to the SQLite workflow database.
    Ensures directory and tables exist.
    """
    target_path = db_path or DB_PATH
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    
    conn = sqlite3.connect(target_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path: Optional[str] = None) -> None:
    """
    Initializes tables for case workflow, human reviews, evidence requests, and audit trail,
    and performs safe, non-destructive schema migrations for existing runtime databases.
    """
    conn = get_connection(db_path)
    with conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS case_workflow (
            record_id INTEGER PRIMARY KEY,
            status TEXT NOT NULL,
            assigned_to TEXT,
            assigned_role TEXT,
            updated_at TEXT NOT NULL,
            created_at TEXT,
            decision TEXT,
            decision_reason TEXT
        );

        CREATE TABLE IF NOT EXISTS case_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            record_id INTEGER NOT NULL,
            reviewer_id TEXT NOT NULL,
            reviewer_role TEXT NOT NULL,
            outcome TEXT NOT NULL,
            note TEXT,
            timestamp TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS evidence_requests (
            request_id TEXT PRIMARY KEY,
            record_id INTEGER NOT NULL,
            evidence_type TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL,
            requested_by TEXT NOT NULL,
            requested_at TEXT NOT NULL,
            received_at TEXT,
            notes TEXT,
            verification_started_at TEXT,
            verified_at TEXT,
            verified_by TEXT,
            rejected_at TEXT,
            reviewer_user_id TEXT,
            reviewer_role TEXT,
            verification_result TEXT,
            verification_note TEXT,
            rejection_reason TEXT,
            evidence_reference TEXT,
            metadata TEXT
        );

        CREATE TABLE IF NOT EXISTS audit_events (
            action_id TEXT PRIMARY KEY,
            record_id INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            role TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            previous_state TEXT,
            new_state TEXT,
            action TEXT NOT NULL,
            reason TEXT,
            evidence_reference TEXT
        );

        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            onboarding_completed INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_login_at TEXT,
            designation TEXT,
            phone TEXT
        );

        CREATE TABLE IF NOT EXISTS user_scopes (
            scope_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            scope_type TEXT NOT NULL,
            state TEXT,
            district TEXT,
            constituency TEXT,
            mp_name TEXT,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token_hash TEXT UNIQUE NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            last_seen_at TEXT NOT NULL,
            revoked_at TEXT,
            user_agent TEXT,
            ip_address TEXT
        );

        CREATE TABLE IF NOT EXISTS auth_events (
            event_id TEXT PRIMARY KEY,
            user_id TEXT,
            event_type TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            success INTEGER NOT NULL,
            metadata TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_user_scopes_user_id ON user_scopes(user_id);
        CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON auth_events(user_id);
        """)

        # Safe non-destructive lightweight migration for case_workflow
        cur = conn.execute("PRAGMA table_info(case_workflow)")
        existing_wf_cols = {row[1] for row in cur.fetchall()}
        if "created_at" not in existing_wf_cols:
            conn.execute("ALTER TABLE case_workflow ADD COLUMN created_at TEXT")
            conn.execute("UPDATE case_workflow SET created_at = COALESCE(updated_at, datetime('now')) WHERE created_at IS NULL")
        if "decision" not in existing_wf_cols:
            conn.execute("ALTER TABLE case_workflow ADD COLUMN decision TEXT")
        if "decision_reason" not in existing_wf_cols:
            conn.execute("ALTER TABLE case_workflow ADD COLUMN decision_reason TEXT")

        # Safe non-destructive lightweight migration for evidence_requests
        cur = conn.execute("PRAGMA table_info(evidence_requests)")
        existing_ev_cols = {row[1] for row in cur.fetchall()}
        for col, col_type in [
            ("verification_started_at", "TEXT"),
            ("verified_at", "TEXT"),
            ("verified_by", "TEXT"),
            ("rejected_at", "TEXT"),
            ("reviewer_user_id", "TEXT"),
            ("reviewer_role", "TEXT"),
            ("verification_result", "TEXT"),
            ("verification_note", "TEXT"),
            ("rejection_reason", "TEXT"),
            ("evidence_reference", "TEXT"),
            ("metadata", "TEXT")
        ]:
            if col not in existing_ev_cols:
                conn.execute(f"ALTER TABLE evidence_requests ADD COLUMN {col} {col_type}")

    conn.close()

