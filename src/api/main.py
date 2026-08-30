from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.config import API_PREFIX, ALLOWED_ORIGINS, SERVICE_NAME, VERSION
from src.api.routes import health, cases, statistics
from src.api.data_loader import load_all_datasets

app = FastAPI(
    title=SERVICE_NAME,
    version=VERSION,
    description="REST API for NIRIKSHAK AI Anomaly Detection & Investigation Cases Dashboard"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup caching event
@app.on_event("startup")
def startup_event():
    print("FastAPI: Loading and caching datasets in memory...")
    success = load_all_datasets()
    if success:
        print("FastAPI: Pre-caching complete.")
    else:
        print("FastAPI WARNING: Pre-caching failed. Verify raw/processed files exist.")

# Include routers
app.include_router(health.router, prefix=API_PREFIX)
app.include_router(cases.router, prefix=API_PREFIX)
app.include_router(statistics.router, prefix=API_PREFIX)
