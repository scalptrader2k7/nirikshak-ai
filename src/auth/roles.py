from enum import Enum
from typing import Tuple, Dict, Set, List

class OfficialRole(str, Enum):
    """
    The exactly four authenticated official user-facing roles in NIRIKSHAK AI.
    Citizen access is public and has no official authenticated login role.
    """
    MP = "MP"
    DISTRICT_AUTHORITY = "DISTRICT_AUTHORITY"
    STATE_NODAL_AUTHORITY = "STATE_NODAL_AUTHORITY"
    MOSPI = "MOSPI"

OFFICIAL_PRODUCT_ROLES: List[str] = [
    OfficialRole.MP.value,
    OfficialRole.DISTRICT_AUTHORITY.value,
    OfficialRole.STATE_NODAL_AUTHORITY.value,
    OfficialRole.MOSPI.value,
]

# Internal-only capabilities retained for backward compatibility / maintenance / test harness.
# NEVER exposed as user-facing portals, onboarding choices, or official product roles.
INTERNAL_CAPABILITIES: Set[str] = {"ADMIN", "INVESTIGATOR"}

class Role(str, Enum):
    MOSPI = "MOSPI"
    STATE_NODAL = "STATE_NODAL"
    STATE_NODAL_AUTHORITY = "STATE_NODAL_AUTHORITY"
    DISTRICT_AUTHORITY = "DISTRICT_AUTHORITY"
    MP = "MP"
    INVESTIGATOR = "INVESTIGATOR"
    ADMIN = "ADMIN"
    CITIZEN = "CITIZEN"

class ScopeType(str, Enum):
    NATIONAL = "NATIONAL"
    STATE = "STATE"
    DISTRICT = "DISTRICT"
    CONSTITUENCY = "CONSTITUENCY"
    INVESTIGATION = "INVESTIGATION"

VALID_ROLES: Set[str] = {r.value for r in Role}
VALID_SCOPE_TYPES: Set[str] = {s.value for s in ScopeType}

# User-facing portals available in the application
OFFICIAL_PORTALS: Set[str] = {
    "MOSPI",
    "STATE_NODAL_AUTHORITY",
    "DISTRICT_AUTHORITY",
    "MP"
}

# Authoritative role to recommended portal mapping
ROLE_PORTAL_MAP: Dict[str, str] = {
    Role.MOSPI.value: "MOSPI",
    Role.STATE_NODAL.value: "STATE_NODAL",
    Role.STATE_NODAL_AUTHORITY.value: "STATE_NODAL_AUTHORITY",
    Role.DISTRICT_AUTHORITY.value: "DISTRICT_AUTHORITY",
    Role.MP.value: "MP",
    Role.INVESTIGATOR.value: "MOSPI",
    Role.ADMIN.value: "MOSPI",
    Role.CITIZEN.value: "CITIZEN",
}

# Permitted portals per role (ADMIN has universal portal access across official portals)
ALLOWED_PORTALS_PER_ROLE: Dict[str, Set[str]] = {
    Role.ADMIN.value: {"MOSPI", "STATE_NODAL_AUTHORITY", "STATE_NODAL", "DISTRICT_AUTHORITY", "MP", "CITIZEN"},
    Role.MOSPI.value: {"MOSPI", "CITIZEN"},
    Role.STATE_NODAL.value: {"STATE_NODAL_AUTHORITY", "STATE_NODAL", "CITIZEN"},
    Role.STATE_NODAL_AUTHORITY.value: {"STATE_NODAL_AUTHORITY", "STATE_NODAL", "CITIZEN"},
    Role.DISTRICT_AUTHORITY.value: {"DISTRICT_AUTHORITY", "CITIZEN"},
    Role.MP.value: {"MP", "CITIZEN"},
    Role.INVESTIGATOR.value: {"MOSPI", "CITIZEN"},
    Role.CITIZEN.value: {"CITIZEN"},
}

# Roles permitted to perform official investigation workflow state changes, reviews, and evidence requests.
# DISTRICT_AUTHORITY is the ONLY official product portal role authorized for operational investigation mutations.
# MOSPI and STATE_NODAL_AUTHORITY are read-only oversight/coordination roles.
OFFICIAL_WORKFLOW_ROLES: Set[str] = {
    Role.ADMIN.value,
    Role.DISTRICT_AUTHORITY.value,
    Role.INVESTIGATOR.value,
}
OFFICIAL_WORKFLOW_MUTATION_ROLES: Set[str] = OFFICIAL_WORKFLOW_ROLES

def normalize_role(role: str) -> str:
    """Normalizes role strings, aliasing legacy STATE_NODAL to STATE_NODAL_AUTHORITY."""
    norm = role.upper().strip()
    if norm == "STATE_NODAL":
        return "STATE_NODAL_AUTHORITY"
    return norm

def get_official_roles() -> List[str]:
    """Returns the four official user-facing roles."""
    return list(OFFICIAL_PRODUCT_ROLES)

def get_recommended_portal(role: str) -> str:
    """
    Returns the recommended official portal for the given backend role.
    Guarantees ADMIN and INVESTIGATOR are never returned as user portals.
    """
    return ROLE_PORTAL_MAP.get(role.upper().strip(), "CITIZEN")

def validate_portal_access(actual_role: str, requested_portal: str) -> Tuple[bool, str, str]:
    """
    Validates whether the user's authoritative account role is permitted
    to use the requested UI portal.
    
    Portal selection never mutates or determines the user's role.
    ADMIN and INVESTIGATOR are rejected as valid product portals.
    
    Returns:
        (is_allowed: bool, actual_role: str, recommended_portal: str)
    """
    actual_role_norm = actual_role.upper().strip()
    requested_portal_norm = requested_portal.upper().strip()

    # ADMIN and INVESTIGATOR cannot be chosen as portals by users
    if requested_portal_norm in {"ADMIN", "INVESTIGATOR"}:
        return False, actual_role_norm, get_recommended_portal(actual_role_norm)

    recommended = get_recommended_portal(actual_role_norm)
    allowed_portals = ALLOWED_PORTALS_PER_ROLE.get(actual_role_norm, {"CITIZEN"})

    if requested_portal_norm == "STATE_NODAL":
        requested_portal_norm = "STATE_NODAL_AUTHORITY"

    is_allowed = (requested_portal_norm in allowed_portals) or (
        requested_portal_norm == "STATE_NODAL_AUTHORITY" and "STATE_NODAL" in allowed_portals
    )
    return is_allowed, actual_role_norm, recommended
