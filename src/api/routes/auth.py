from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Response, Request, status
from src.api.schemas import (
    LoginRequest,
    LoginResponse,
    CurrentUserResponse,
    PortalAccessRequest,
    PortalAccessResponse,
    PortalOptionsResponse,
    OnboardingProfileResponse,
    OnboardingUpdateRequest,
    OnboardingCompleteResponse
)
from src.auth.auth_service import (
    authenticate_user,
    logout_user,
    update_onboarding_profile,
    complete_user_onboarding
)
from src.auth.session import set_session_cookie, clear_session_cookie, COOKIE_NAME
from src.auth.authorization import get_current_user, get_optional_current_user
from src.auth.roles import validate_portal_access

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

@router.get("/portal-options", response_model=PortalOptionsResponse)
def get_portal_options():
    """
    Returns the public list of official user-facing portals.
    ADMIN and INVESTIGATOR are strictly internal and never exposed as portal choices.
    """
    return {
        "official_portals": ["MOSPI", "STATE_NODAL_AUTHORITY", "DISTRICT_AUTHORITY", "MP"],
        "citizen_portal": "CITIZEN"
    }

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, response: Response, request: Request):
    """
    Authenticates user credentials, generates a server-side session, and attaches
    a secure HttpOnly session cookie.
    
    Roles and scopes are determined strictly by the backend database account.
    Client-provided roles are ignored and cannot elevate privilege.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("User-Agent")
    
    user_profile, raw_token, error_msg = authenticate_user(
        email=req.email,
        password=req.password,
        client_ip=client_ip,
        user_agent=user_agent
    )
    
    if error_msg or not user_profile or not raw_token:
        status_code = status.HTTP_403_FORBIDDEN if "inactive" in (error_msg or "").lower() else status.HTTP_401_UNAUTHORIZED
        raise HTTPException(status_code=status_code, detail=error_msg or "Invalid credentials.")
        
    set_session_cookie(response, raw_token)
    return {
        "user": user_profile,
        "message": "Login successful."
    }

@router.get("/me", response_model=CurrentUserResponse)
def get_current_authenticated_user(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Validates current session from HttpOnly cookie and returns authoritative user identity,
    role, scope, and onboarding completion status.
    Returns 401 if session is missing, invalid, revoked, or expired.
    """
    return {
        "authenticated": True,
        "user_id": user["user_id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "scope": user.get("scope"),
        "onboarding_completed": user["onboarding_completed"],
        "designation": user.get("designation"),
        "phone": user.get("phone"),
        "recommended_portal": user.get("recommended_portal") or "CITIZEN"
    }

@router.post("/logout")
def logout(response: Response, request: Request):
    """
    Revokes the active server-side session and clears the client's session cookie.
    """
    raw_token = request.cookies.get(COOKIE_NAME)
    if not raw_token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            raw_token = auth_header[7:].strip()
            
    if raw_token:
        logout_user(raw_token)
        
    clear_session_cookie(response)
    return {"message": "Logged out successfully."}

@router.post("/portal-access", response_model=PortalAccessResponse)
def check_portal_access(
    req: PortalAccessRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Verifies whether the authenticated account is authorized to access the requested portal.
    Never mutates or determines user role based on portal choice.
    """
    allowed, actual_role, recommended = validate_portal_access(
        actual_role=user["role"],
        requested_portal=req.portal
    )
    return {
        "allowed": allowed,
        "actual_role": actual_role,
        "recommended_portal": recommended
    }

@router.get("/onboarding", response_model=OnboardingProfileResponse)
def get_onboarding_status(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves the onboarding state and editable profile fields for the authenticated user.
    """
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "designation": user.get("designation"),
        "phone": user.get("phone"),
        "onboarding_completed": user["onboarding_completed"],
        "role": user["role"],
        "scope": user.get("scope")
    }

@router.patch("/onboarding", response_model=OnboardingProfileResponse)
@router.post("/onboarding", response_model=OnboardingProfileResponse)
def update_onboarding(
    req: OnboardingUpdateRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Allows a first-time user to update non-authoritative profile details
    (full_name, designation, phone).
    Strictly forbids and rejects attempts to modify role, scope, is_active, or email.
    """
    updated_profile = update_onboarding_profile(
        user_id=user["user_id"],
        updates=req.model_dump(exclude_unset=True)
    )
    return updated_profile

@router.post("/onboarding/complete", response_model=OnboardingCompleteResponse)
def complete_onboarding(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Marks the onboarding process completed for the authenticated user.
    Subsequent calls to /auth/me return onboarding_completed = true.
    """
    return complete_user_onboarding(user["user_id"])
