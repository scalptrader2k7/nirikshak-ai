import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from src.persistence.database import get_connection, init_db

VALID_WORKFLOW_STATES = [
    "DETECTED",
    "PRIORITIZED",
    "ASSIGNED",
    "UNDER_REVIEW",
    "EVIDENCE_REQUESTED",
    "EVIDENCE_RECEIVED",
    "VERIFIED",
    "DECIDED",
    "CLOSED"
]

ALLOWED_TRANSITIONS = {
    "DETECTED": ["PRIORITIZED"],
    "PRIORITIZED": ["ASSIGNED"],
    "ASSIGNED": ["UNDER_REVIEW"],
    "UNDER_REVIEW": ["EVIDENCE_REQUESTED", "VERIFIED"],
    "EVIDENCE_REQUESTED": ["EVIDENCE_RECEIVED"],
    "EVIDENCE_RECEIVED": ["UNDER_REVIEW", "VERIFIED"],
    "VERIFIED": ["DECIDED"],
    "DECIDED": ["CLOSED"],
    "CLOSED": []  # Terminal operational state
}

VALID_REVIEW_OUTCOMES = [
    "VALID_RISK_SIGNAL",
    "FALSE_POSITIVE",
    "INSUFFICIENT_EVIDENCE",
    "CONFIRMED_DEVIATION",
    "FIELD_INSPECTION_REQUIRED",
    "ESCALATED",
    "NO_ISSUE",
    "CLOSED_AFTER_CLARIFICATION"
]

VALID_EVIDENCE_STATUSES = [
    "REQUESTED",
    "RECEIVED",
    "UNDER_VERIFICATION",
    "VERIFIED",
    "REJECTED"
]

ALLOWED_EVIDENCE_TRANSITIONS = {
    "REQUESTED": ["RECEIVED"],
    "RECEIVED": ["UNDER_VERIFICATION"],
    "UNDER_VERIFICATION": ["VERIFIED", "REJECTED"],
    "VERIFIED": [],
    "REJECTED": []
}

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def record_audit_event(
    conn,
    record_id: int,
    user_id: str,
    role: str,
    action: str,
    previous_state: Optional[str] = None,
    new_state: Optional[str] = None,
    reason: Optional[str] = None,
    evidence_reference: Optional[str] = None
) -> Dict[str, Any]:
    """
    Appends an immutable entry to the workflow audit log.
    """
    action_id = f"ACT-{uuid.uuid4().hex[:10].upper()}"
    ts = _now_iso()
    conn.execute(
        """
        INSERT INTO audit_events (
            action_id, record_id, user_id, role, timestamp,
            previous_state, new_state, action, reason, evidence_reference
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (action_id, record_id, user_id, role, ts, previous_state, new_state, action, reason, evidence_reference)
    )
    return {
        "action_id": action_id,
        "record_id": record_id,
        "user_id": user_id,
        "role": role,
        "timestamp": ts,
        "previous_state": previous_state,
        "new_state": new_state,
        "action": action,
        "reason": reason,
        "evidence_reference": evidence_reference
    }

def get_case_workflow(record_id: int) -> Dict[str, Any]:
    """
    Retrieves the current operational workflow state for a record.
    If no entry exists in the mutable store, defaults to DETECTED (initial operational state).
    Existing persisted records with later states are preserved and never reset.
    """
    init_db()
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            SELECT record_id, status, assigned_to, assigned_role, updated_at,
                   created_at, decision, decision_reason
            FROM case_workflow WHERE record_id = ?
            """,
            (record_id,)
        )
        row = cur.fetchone()
        if row:
            curr_status = row["status"]
            return {
                "record_id": row["record_id"],
                "status": curr_status,
                "assigned_to": row["assigned_to"],
                "assigned_role": row["assigned_role"],
                "updated_at": row["updated_at"],
                "created_at": row["created_at"] or row["updated_at"],
                "decision": row["decision"],
                "decision_reason": row["decision_reason"],
                "allowed_next_states": ALLOWED_TRANSITIONS.get(curr_status, [])
            }
        else:
            ts = _now_iso()
            return {
                "record_id": record_id,
                "status": "DETECTED",
                "assigned_to": None,
                "assigned_role": None,
                "updated_at": ts,
                "created_at": ts,
                "decision": None,
                "decision_reason": None,
                "allowed_next_states": ALLOWED_TRANSITIONS.get("DETECTED", [])
            }
    finally:
        conn.close()

def update_case_status(
    record_id: int,
    new_status: str,
    user_id: str,
    role: str,
    reason: Optional[str] = None,
    assigned_to: Optional[str] = None,
    assigned_role: Optional[str] = None,
    decision: Optional[str] = None,
    decision_reason: Optional[str] = None
) -> Dict[str, Any]:
    """
    Transitions the operational workflow state of a case with transition graph validation
    and automatic workflow audit log recording.
    """
    new_status = new_status.upper().strip()
    if new_status not in VALID_WORKFLOW_STATES:
        raise ValueError(f"Invalid workflow state '{new_status}'. Allowed: {', '.join(VALID_WORKFLOW_STATES)}")

    init_db()
    conn = get_connection()
    try:
        with conn:
            cur = conn.execute(
                """
                SELECT status, assigned_to, assigned_role, created_at, decision, decision_reason
                FROM case_workflow WHERE record_id = ?
                """,
                (record_id,)
            )
            row = cur.fetchone()
            current_status = row["status"] if row else "DETECTED"
            current_assigned_to = row["assigned_to"] if row else None
            current_assigned_role = row["assigned_role"] if row else None
            current_created_at = row["created_at"] if row else None
            current_decision = row["decision"] if row else None
            current_decision_reason = row["decision_reason"] if row else None

            if new_status != current_status:
                allowed_next = ALLOWED_TRANSITIONS.get(current_status, [])
                if new_status not in allowed_next:
                    raise ValueError(
                        f"Invalid workflow transition from '{current_status}' to '{new_status}'. "
                        f"Allowed transitions: {', '.join(allowed_next) if allowed_next else 'None (Terminal state)'}"
                    )

            target_assigned_to = assigned_to if assigned_to is not None else current_assigned_to
            target_assigned_role = assigned_role if assigned_role is not None else current_assigned_role
            ts = _now_iso()
            target_created_at = current_created_at or ts

            target_decision = decision if decision is not None else current_decision
            target_decision_reason = decision_reason if decision_reason is not None else current_decision_reason

            conn.execute(
                """
                INSERT INTO case_workflow (
                    record_id, status, assigned_to, assigned_role, updated_at,
                    created_at, decision, decision_reason
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(record_id) DO UPDATE SET
                    status=excluded.status,
                    assigned_to=excluded.assigned_to,
                    assigned_role=excluded.assigned_role,
                    updated_at=excluded.updated_at,
                    decision=COALESCE(excluded.decision, case_workflow.decision),
                    decision_reason=COALESCE(excluded.decision_reason, case_workflow.decision_reason)
                """,
                (record_id, new_status, target_assigned_to, target_assigned_role, ts, target_created_at, target_decision, target_decision_reason)
            )

            audit_reason = reason
            if new_status == "DECIDED" and decision:
                audit_reason = f"Decision: {decision}. {decision_reason or reason or ''}".strip()
            elif reason:
                audit_reason = reason

            record_audit_event(
                conn,
                record_id=record_id,
                user_id=user_id,
                role=role,
                action="TRANSITION_STATUS",
                previous_state=current_status,
                new_state=new_status,
                reason=audit_reason,
                evidence_reference=decision
            )

        return {
            "record_id": record_id,
            "status": new_status,
            "assigned_to": target_assigned_to,
            "assigned_role": target_assigned_role,
            "updated_at": ts,
            "created_at": target_created_at,
            "decision": target_decision,
            "decision_reason": target_decision_reason,
            "allowed_next_states": ALLOWED_TRANSITIONS.get(new_status, [])
        }
    finally:
        conn.close()

def add_case_review(
    record_id: int,
    reviewer_id: str,
    reviewer_role: str,
    outcome: str,
    note: Optional[str] = None
) -> Dict[str, Any]:
    """
    Records a human review decision and notes separately from AI scoring outputs.
    """
    outcome = outcome.upper().strip()
    if outcome not in VALID_REVIEW_OUTCOMES:
        raise ValueError(f"Invalid review outcome '{outcome}'. Allowed: {', '.join(VALID_REVIEW_OUTCOMES)}")

    init_db()
    conn = get_connection()
    try:
        ts = _now_iso()
        with conn:
            cur = conn.execute(
                """
                INSERT INTO case_reviews (record_id, reviewer_id, reviewer_role, outcome, note, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (record_id, reviewer_id, reviewer_role, outcome, note, ts)
            )
            review_id = cur.lastrowid

            record_audit_event(
                conn,
                record_id=record_id,
                user_id=reviewer_id,
                role=reviewer_role,
                action="RECORD_HUMAN_REVIEW",
                previous_state=None,
                new_state=None,
                reason=f"Outcome: {outcome}. {note or ''}".strip(),
                evidence_reference=f"REVIEW-{review_id}"
            )

        return {
            "id": review_id,
            "record_id": record_id,
            "reviewer_id": reviewer_id,
            "reviewer_role": reviewer_role,
            "outcome": outcome,
            "note": note,
            "timestamp": ts
        }
    finally:
        conn.close()

def get_case_reviews(record_id: int) -> List[Dict[str, Any]]:
    """
    Returns all reviews registered for a specific investigation case.
    """
    init_db()
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            SELECT id, record_id, reviewer_id, reviewer_role, outcome, note, timestamp
            FROM case_reviews WHERE record_id = ? ORDER BY id DESC
            """,
            (record_id,)
        )
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()

def _format_evidence_request_dict(row: Dict[str, Any]) -> Dict[str, Any]:
    meta = row.get("metadata")
    parsed_meta = None
    if meta:
        if isinstance(meta, dict):
            parsed_meta = meta
        elif isinstance(meta, str):
            try:
                parsed_meta = json.loads(meta)
            except Exception:
                parsed_meta = {"raw": meta}
    req_id = row["request_id"]
    rec_id = row["record_id"]
    return {
        "evidence_request_id": req_id,
        "request_id": req_id,
        "case_id": rec_id,
        "record_id": rec_id,
        "evidence_type": row["evidence_type"],
        "description": row.get("description"),
        "status": row["status"],
        "requested_by": row["requested_by"],
        "requested_at": row["requested_at"],
        "received_at": row.get("received_at"),
        "verification_started_at": row.get("verification_started_at"),
        "verified_at": row.get("verified_at"),
        "verified_by": row.get("verified_by"),
        "rejected_at": row.get("rejected_at"),
        "reviewer_user_id": row.get("reviewer_user_id") or row.get("verified_by"),
        "reviewer_role": row.get("reviewer_role"),
        "verification_note": row.get("verification_note"),
        "verification_result": row.get("verification_result"),
        "rejection_reason": row.get("rejection_reason"),
        "evidence_reference": row.get("evidence_reference"),
        "metadata": parsed_meta,
        "notes": row.get("notes")
    }

def create_evidence_request(
    record_id: int,
    evidence_type: str,
    description: Optional[str] = None,
    requested_by: str = "investigator",
    reviewer_role: Optional[str] = None,
    notes: Optional[str] = None,
    evidence_reference: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Registers a formal evidence request for field verification.
    """
    init_db()
    conn = get_connection()
    try:
        request_id = f"REQ-{uuid.uuid4().hex[:8].upper()}"
        ts = _now_iso()
        status = "REQUESTED"
        meta_str = json.dumps(metadata) if metadata is not None else None
        with conn:
            conn.execute(
                """
                INSERT INTO evidence_requests (
                    request_id, record_id, evidence_type, description,
                    status, requested_by, requested_at, notes,
                    verification_started_at, verified_at, verified_by, rejected_at,
                    reviewer_user_id, reviewer_role, verification_result, verification_note,
                    rejection_reason, evidence_reference, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, ?, NULL, NULL, NULL, ?, ?)
                """,
                (request_id, record_id, evidence_type, description, status, requested_by, ts, notes, reviewer_role, evidence_reference, meta_str)
            )

            record_audit_event(
                conn,
                record_id=record_id,
                user_id=requested_by,
                role=reviewer_role or "investigator",
                action="CREATE_EVIDENCE_REQUEST",
                previous_state=None,
                new_state=status,
                reason=f"Requested evidence: {evidence_type}",
                evidence_reference=request_id
            )

        row_dict = {
            "request_id": request_id,
            "record_id": record_id,
            "evidence_type": evidence_type,
            "description": description,
            "status": status,
            "requested_by": requested_by,
            "requested_at": ts,
            "received_at": None,
            "notes": notes,
            "verification_started_at": None,
            "verified_at": None,
            "verified_by": None,
            "rejected_at": None,
            "reviewer_user_id": None,
            "reviewer_role": reviewer_role,
            "verification_result": None,
            "verification_note": None,
            "rejection_reason": None,
            "evidence_reference": evidence_reference,
            "metadata": meta_str
        }
        return _format_evidence_request_dict(row_dict)
    finally:
        conn.close()

def update_evidence_request(
    record_id: int,
    request_id: str,
    status: str,
    notes: Optional[str] = None,
    user_id: str = "investigator",
    role: str = "investigator",
    verified_by: Optional[str] = None,
    reviewer_user_id: Optional[str] = None,
    reviewer_role: Optional[str] = None,
    verification_result: Optional[str] = None,
    verification_note: Optional[str] = None,
    rejection_reason: Optional[str] = None,
    evidence_reference: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Updates the verification tracking status of a specific evidence request.
    Strictly enforces the separate evidence-item state graph:
    REQUESTED -> RECEIVED -> UNDER_VERIFICATION -> {VERIFIED, REJECTED}
    """
    status = status.upper().strip()
    if status not in VALID_EVIDENCE_STATUSES:
        raise ValueError(f"Invalid evidence request status '{status}'. Allowed: {', '.join(VALID_EVIDENCE_STATUSES)}")

    init_db()
    conn = get_connection()
    try:
        with conn:
            cur = conn.execute(
                """
                SELECT request_id, record_id, evidence_type, description, status,
                       requested_by, requested_at, received_at, notes,
                       verification_started_at, verified_at, verified_by, rejected_at,
                       reviewer_user_id, reviewer_role, verification_result, verification_note,
                       rejection_reason, evidence_reference, metadata
                FROM evidence_requests WHERE record_id = ? AND request_id = ?
                """,
                (record_id, request_id)
            )
            row = cur.fetchone()
            if not row:
                raise KeyError(f"Evidence request '{request_id}' not found for record {record_id}")

            prev_status = row["status"]

            if status != prev_status:
                allowed_next = ALLOWED_EVIDENCE_TRANSITIONS.get(prev_status, [])
                if status not in allowed_next:
                    raise ValueError(
                        f"Invalid evidence status transition from '{prev_status}' to '{status}'. "
                        f"Allowed transitions: {', '.join(allowed_next) if allowed_next else 'None (Terminal state)'}"
                    )

            target_received_at = row["received_at"]
            if status == "RECEIVED" and not target_received_at:
                target_received_at = _now_iso()

            target_verification_started_at = row["verification_started_at"]
            if status == "UNDER_VERIFICATION" and not target_verification_started_at:
                target_verification_started_at = _now_iso()

            target_verified_at = row["verified_at"]
            if status == "VERIFIED" and not target_verified_at:
                target_verified_at = _now_iso()

            target_rejected_at = row["rejected_at"]
            if status == "REJECTED" and not target_rejected_at:
                target_rejected_at = _now_iso()

            eff_reviewer_user_id = reviewer_user_id or verified_by or (user_id if status in ["UNDER_VERIFICATION", "VERIFIED", "REJECTED"] else row["reviewer_user_id"])
            eff_verified_by = verified_by or reviewer_user_id or (user_id if status in ["UNDER_VERIFICATION", "VERIFIED", "REJECTED"] else row["verified_by"])
            eff_reviewer_role = reviewer_role or (role if status in ["UNDER_VERIFICATION", "VERIFIED", "REJECTED"] else row["reviewer_role"])

            updated_notes = notes if notes is not None else row["notes"]
            eff_verification_note = verification_note if verification_note is not None else row["verification_note"]
            eff_verification_result = verification_result if verification_result is not None else row["verification_result"]
            eff_rejection_reason = rejection_reason if rejection_reason is not None else row["rejection_reason"]
            eff_evidence_reference = evidence_reference if evidence_reference is not None else row["evidence_reference"]

            meta_str = json.dumps(metadata) if metadata is not None else row["metadata"]

            conn.execute(
                """
                UPDATE evidence_requests
                SET status = ?, received_at = ?, notes = ?,
                    verification_started_at = ?, verified_at = ?, verified_by = ?,
                    rejected_at = ?, reviewer_user_id = ?, reviewer_role = ?,
                    verification_result = ?, verification_note = ?,
                    rejection_reason = ?, evidence_reference = ?, metadata = ?
                WHERE record_id = ? AND request_id = ?
                """,
                (
                    status, target_received_at, updated_notes,
                    target_verification_started_at, target_verified_at, eff_verified_by,
                    target_rejected_at, eff_reviewer_user_id, eff_reviewer_role,
                    eff_verification_result, eff_verification_note,
                    eff_rejection_reason, eff_evidence_reference, meta_str,
                    record_id, request_id
                )
            )

            audit_reason = f"Evidence request {request_id} updated to {status}"
            if eff_rejection_reason:
                audit_reason += f". Rejection Reason: {eff_rejection_reason}"
            elif eff_verification_result:
                audit_reason += f". Result: {eff_verification_result}"
            if eff_verification_note:
                audit_reason += f". Note: {eff_verification_note}"

            record_audit_event(
                conn,
                record_id=record_id,
                user_id=user_id,
                role=role,
                action="UPDATE_EVIDENCE_REQUEST_STATUS",
                previous_state=prev_status,
                new_state=status,
                reason=audit_reason,
                evidence_reference=request_id
            )

        updated_row = {
            "request_id": request_id,
            "record_id": record_id,
            "evidence_type": row["evidence_type"],
            "description": row["description"],
            "status": status,
            "requested_by": row["requested_by"],
            "requested_at": row["requested_at"],
            "received_at": target_received_at,
            "notes": updated_notes,
            "verification_started_at": target_verification_started_at,
            "verified_at": target_verified_at,
            "verified_by": eff_verified_by,
            "rejected_at": target_rejected_at,
            "reviewer_user_id": eff_reviewer_user_id,
            "reviewer_role": eff_reviewer_role,
            "verification_result": eff_verification_result,
            "verification_note": eff_verification_note,
            "rejection_reason": eff_rejection_reason,
            "evidence_reference": eff_evidence_reference,
            "metadata": meta_str
        }
        return _format_evidence_request_dict(updated_row)
    finally:
        conn.close()

def get_case_evidence_requests(record_id: int) -> List[Dict[str, Any]]:
    """
    Lists all evidence requests created for a case.
    """
    init_db()
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            SELECT request_id, record_id, evidence_type, description, status,
                   requested_by, requested_at, received_at, notes,
                   verification_started_at, verified_at, verified_by, rejected_at,
                   reviewer_user_id, reviewer_role, verification_result, verification_note,
                   rejection_reason, evidence_reference, metadata
            FROM evidence_requests WHERE record_id = ? ORDER BY requested_at DESC
            """,
            (record_id,)
        )
        return [_format_evidence_request_dict(dict(row)) for row in cur.fetchall()]
    finally:
        conn.close()

def get_case_audit_events(record_id: int) -> List[Dict[str, Any]]:
    """
    Lists the full history of workflow audit log entries recorded for a case.
    """
    init_db()
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            SELECT action_id, record_id, user_id, role, timestamp, previous_state, new_state, action, reason, evidence_reference
            FROM audit_events WHERE record_id = ? ORDER BY timestamp DESC
            """,
            (record_id,)
        )
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()
