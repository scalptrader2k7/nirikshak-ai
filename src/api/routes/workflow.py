from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional, Dict, Any
from src.api.schemas import (
    WorkflowStatusResponse,
    WorkflowStatusUpdateRequest,
    ReviewCreateRequest,
    ReviewResponse,
    EvidenceRequestCreate,
    EvidenceRequestUpdate,
    EvidenceRequestResponse,
    AuditEventResponse
)
from src.workflow.workflow_service import (
    get_case_workflow,
    update_case_status,
    add_case_review,
    get_case_reviews,
    create_evidence_request,
    update_evidence_request,
    get_case_evidence_requests,
    get_case_audit_events
)
from src.api.data_loader import get_clean_df
from src.auth.authorization import require_workflow_mutation_user, get_current_user
from src.scoping.scope_service import can_access_project, can_mutate_workflow

router = APIRouter()

def _verify_record_exists(record_id: int):
    clean_df = get_clean_df()
    if clean_df.empty or not (clean_df["original_row_index"] == record_id).any():
        raise HTTPException(status_code=404, detail=f"Case record {record_id} not found")

@router.get("/cases/{record_id}/workflow", response_model=WorkflowStatusResponse)
def get_workflow_state(
    record_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieves the current operational workflow state, assigned officer, and allowed next transitions.
    Access restricted to authenticated officials with scope over this record.
    """
    _verify_record_exists(record_id)
    if not can_access_project(current_user, record_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Case is outside assigned administrative scope or lacks a trusted district mapping."
        )
    return get_case_workflow(record_id)

@router.patch("/cases/{record_id}/workflow/status", response_model=WorkflowStatusResponse)
def update_workflow_status(
    record_id: int,
    body: WorkflowStatusUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_workflow_mutation_user)
):
    """
    Transitions the operational workflow state of a case (e.g. DETECTED -> PRIORITIZED -> ASSIGNED -> UNDER_REVIEW -> ... -> CLOSED).
    Requires an authenticated backend session with an authorized official workflow role and administrative scope.
    User identity and role are strictly derived from the backend session.
    """
    _verify_record_exists(record_id)
    if not can_mutate_workflow(current_user, record_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: User is not authorized to mutate workflow for this project record."
        )

    try:
        return update_case_status(
            record_id=record_id,
            new_status=body.new_status,
            user_id=current_user["user_id"],
            role=current_user["role"],
            reason=body.reason,
            assigned_to=body.assigned_to,
            assigned_role=body.assigned_role,
            decision=body.decision,
            decision_reason=body.decision_reason
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/cases/{record_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    record_id: int,
    body: ReviewCreateRequest,
    current_user: Dict[str, Any] = Depends(require_workflow_mutation_user)
):
    """
    Records a human review assessment, decision outcome, and notes.
    Requires an authenticated backend session with an authorized official workflow role and administrative scope.
    Reviewer identity and role are strictly derived from the session.
    """
    _verify_record_exists(record_id)
    if not can_mutate_workflow(current_user, record_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: User is not authorized to record reviews for this project record."
        )

    try:
        return add_case_review(
            record_id=record_id,
            reviewer_id=current_user["user_id"],
            reviewer_role=current_user["role"],
            outcome=body.outcome,
            note=body.note
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/cases/{record_id}/reviews", response_model=List[ReviewResponse])
def list_reviews(
    record_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Lists all human review notes and outcomes recorded for this case.
    Restricted to authenticated official users with scope over this record.
    """
    _verify_record_exists(record_id)
    if not can_access_project(current_user, record_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Case is outside assigned administrative scope or lacks a trusted district mapping."
        )
    return get_case_reviews(record_id)

@router.post("/cases/{record_id}/evidence-requests", response_model=EvidenceRequestResponse, status_code=status.HTTP_201_CREATED)
def request_evidence(
    record_id: int,
    body: EvidenceRequestCreate,
    current_user: Dict[str, Any] = Depends(require_workflow_mutation_user)
):
    """
    Registers a new evidence request for field verification.
    Requires an authenticated backend session with an authorized official workflow role and administrative scope.
    Requester identity is strictly derived from the session.
    """
    _verify_record_exists(record_id)
    if not can_mutate_workflow(current_user, record_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: User is not authorized to request evidence for this project record."
        )

    return create_evidence_request(
        record_id=record_id,
        evidence_type=body.evidence_type,
        description=body.description,
        requested_by=current_user["user_id"],
        reviewer_role=current_user["role"],
        notes=body.notes,
        evidence_reference=body.evidence_reference,
        metadata=body.metadata
    )

@router.get("/cases/{record_id}/evidence-requests", response_model=List[EvidenceRequestResponse])
def list_evidence_requests(
    record_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Lists all evidence verification requests submitted for this case.
    Restricted to authenticated official users with scope over this record.
    """
    _verify_record_exists(record_id)
    if not can_access_project(current_user, record_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Case is outside assigned administrative scope or lacks a trusted district mapping."
        )
    return get_case_evidence_requests(record_id)

@router.patch("/cases/{record_id}/evidence-requests/{request_id}", response_model=EvidenceRequestResponse)
def update_evidence_request_status(
    record_id: int,
    request_id: str,
    body: EvidenceRequestUpdate,
    current_user: Dict[str, Any] = Depends(require_workflow_mutation_user)
):
    """
    Updates status of an evidence request following the separate state graph:
    REQUESTED -> RECEIVED -> UNDER_VERIFICATION -> {VERIFIED, REJECTED}
    Requires an authenticated backend session with an authorized operational workflow role and administrative scope.
    User identity and role are strictly derived from the session.
    """
    _verify_record_exists(record_id)
    if not can_mutate_workflow(current_user, record_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: User is not authorized to update evidence for this project record."
        )

    effective_verified_by = body.verified_by or body.reviewer_user_id
    if body.status in ["UNDER_VERIFICATION", "VERIFIED", "REJECTED"] and not effective_verified_by:
        effective_verified_by = current_user.get("full_name") or current_user["user_id"]

    effective_reviewer_role = body.reviewer_role or current_user["role"]

    try:
        return update_evidence_request(
            record_id=record_id,
            request_id=request_id,
            status=body.status,
            notes=body.notes,
            user_id=current_user["user_id"],
            role=current_user["role"],
            verified_by=effective_verified_by,
            reviewer_user_id=body.reviewer_user_id or current_user["user_id"],
            reviewer_role=effective_reviewer_role,
            verification_result=body.verification_result,
            verification_note=body.verification_note,
            rejection_reason=body.rejection_reason,
            evidence_reference=body.evidence_reference,
            metadata=body.metadata
        )
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/cases/{record_id}/audit", response_model=List[AuditEventResponse])
def list_audit_trail(
    record_id: int,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieves the full workflow audit log of actions, transitions, reviews, and evidence events for this case.
    Restricted to authenticated official users with scope over this record.
    """
    _verify_record_exists(record_id)
    if not can_access_project(current_user, record_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Case is outside assigned administrative scope or lacks a trusted district mapping."
        )
    return get_case_audit_events(record_id)
