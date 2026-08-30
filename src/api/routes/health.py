from fastapi import APIRouter
from src.api.schemas import HealthResponse
from src.api.config import VERSION, SERVICE_NAME
from src.api.data_loader import is_loaded, load_all_datasets

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health():
    """
    Checks the service health and reports if the underlying data files are successfully loaded in memory.
    """
    loaded = is_loaded()
    if not loaded:
        # Try to reload on health check if not already loaded
        loaded = load_all_datasets()
        
    return {
        "status": "ok" if loaded else "error",
        "service": SERVICE_NAME,
        "version": VERSION,
        "data_loaded": loaded
    }
