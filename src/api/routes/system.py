from fastapi import APIRouter, Depends
from typing import Dict, Any
from src.api.schemas import DetectorRegistryResponse, SystemProvenanceResponse
from src.governance.detector_registry import get_detector_registry
from src.governance.provenance_service import get_system_provenance
from src.auth.authorization import get_current_user

router = APIRouter(prefix="/system", tags=["System Governance & Provenance"])

@router.get("/detectors", response_model=DetectorRegistryResponse)
def get_detectors(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns the centralized governance metadata registry for all analytical detectors.
    Restricted to authenticated official users.
    """
    return get_detector_registry()

@router.get("/provenance", response_model=SystemProvenanceResponse)
def get_provenance():
    """
    Returns the dataset and pipeline provenance report distinguishing official MPLADS data,
    derived analytics, and isolated synthetic demonstration lifecycle data.
    Publicly accessible metadata.
    """
    return get_system_provenance()
