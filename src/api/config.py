import os

# API configuration settings
API_PREFIX = "/api/v1"
VERSION = "1.0.0"
SERVICE_NAME = "NIRIKSHAK AI API"

# Allowed CORS origins
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173"
]

# Project relative file paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

INVESTIGATION_JSON_PATH = os.path.join(BASE_DIR, "data", "reports", "investigation_cases.json")
INVESTIGATION_CSV_PATH = os.path.join(BASE_DIR, "data", "processed", "investigation_cases.csv")
CLEAN_CSV_PATH = os.path.join(BASE_DIR, "data", "processed", "mplads_clean.csv")
DUPLICATE_PAIRS_CSV_PATH = os.path.join(BASE_DIR, "data", "processed", "duplicate_pairs.csv")
FEATURES_CSV_PATH = os.path.join(BASE_DIR, "data", "processed", "mplads_features.csv")
ANOMALY_CSV_PATH = os.path.join(BASE_DIR, "data", "processed", "anomaly_results.csv")
VERIFICATION_JSON_PATH = os.path.join(BASE_DIR, "data", "reports", "verification_cases.json")
VERIFICATION_CSV_PATH = os.path.join(BASE_DIR, "data", "processed", "verification_cases.csv")
