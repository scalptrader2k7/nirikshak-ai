import os
import json
import pandas as pd
from typing import List, Dict, Any, Optional
from src.api.config import (
    INVESTIGATION_JSON_PATH,
    INVESTIGATION_CSV_PATH,
    CLEAN_CSV_PATH,
    DUPLICATE_PAIRS_CSV_PATH,
    FEATURES_CSV_PATH,
    ANOMALY_CSV_PATH,
    VERIFICATION_JSON_PATH
)

# Global in-memory cache
_CASES_CACHE: Optional[List[Dict[str, Any]]] = None
_VERIFICATION_CACHE: Optional[List[Dict[str, Any]]] = None
_CLEAN_DF_CACHE: Optional[pd.DataFrame] = None
_DUPLICATE_PAIRS_DF_CACHE: Optional[pd.DataFrame] = None
_FEATURES_DF_CACHE: Optional[pd.DataFrame] = None
_ANOMALY_DF_CACHE: Optional[pd.DataFrame] = None
_DATA_LOADED: bool = False

def load_all_datasets(force: bool = False) -> bool:
    """
    Loads all required CSV and JSON datasets from disk into memory.
    Returns True if load is successful, False otherwise.
    """
    global _CASES_CACHE, _VERIFICATION_CACHE, _CLEAN_DF_CACHE, _DUPLICATE_PAIRS_DF_CACHE, _FEATURES_DF_CACHE, _ANOMALY_DF_CACHE, _DATA_LOADED
    
    if _DATA_LOADED and not force:
        return True
        
    try:
        # Check files existence
        paths = [
            INVESTIGATION_JSON_PATH, 
            CLEAN_CSV_PATH, 
            DUPLICATE_PAIRS_CSV_PATH, 
            FEATURES_CSV_PATH, 
            ANOMALY_CSV_PATH,
            VERIFICATION_JSON_PATH
        ]
        for p in paths:
            if not os.path.exists(p):
                print(f"Data Loader: File not found at {p}")
                _DATA_LOADED = False
                return False
                
        # 1. Load JSON cases
        with open(INVESTIGATION_JSON_PATH, "r", encoding="utf-8") as f:
            cases_report = json.load(f)
            _CASES_CACHE = cases_report.get("cases", [])
            
        # 1.5 Load JSON verification cases
        with open(VERIFICATION_JSON_PATH, "r", encoding="utf-8") as f:
            verification_report = json.load(f)
            _VERIFICATION_CACHE = verification_report.get("cases", [])
            
        # 2. Load CSV DataFrames
        _CLEAN_DF_CACHE = pd.read_csv(CLEAN_CSV_PATH)
        _DUPLICATE_PAIRS_DF_CACHE = pd.read_csv(DUPLICATE_PAIRS_CSV_PATH)
        _FEATURES_DF_CACHE = pd.read_csv(FEATURES_CSV_PATH)
        _ANOMALY_DF_CACHE = pd.read_csv(ANOMALY_CSV_PATH)
        
        # Basic column checks
        required_clean = ["original_row_index", "mp_name", "allocation_amount", "recommended_date"]
        for c in required_clean:
            if c not in _CLEAN_DF_CACHE.columns:
                raise KeyError(f"Data Loader: Missing column '{c}' in mplads_clean.csv")
                
        _DATA_LOADED = True
        print("Data Loader: All datasets successfully cached in memory.")
        return True
        
    except Exception as e:
        print(f"Data Loader: Failed to load datasets: {e}")
        _DATA_LOADED = False
        _CASES_CACHE = None
        _VERIFICATION_CACHE = None
        _CLEAN_DF_CACHE = None
        _DUPLICATE_PAIRS_DF_CACHE = None
        _FEATURES_DF_CACHE = None
        _ANOMALY_DF_CACHE = None
        return False

def get_cases() -> List[Dict[str, Any]]:
    """
    Retrieves the list of all investigation cases.
    """
    global _CASES_CACHE
    if _CASES_CACHE is None:
        load_all_datasets()
    return _CASES_CACHE if _CASES_CACHE is not None else []

def get_clean_df() -> pd.DataFrame:
    """
    Retrieves the clean dataset DataFrame.
    """
    global _CLEAN_DF_CACHE
    if _CLEAN_DF_CACHE is None:
        load_all_datasets()
    return _CLEAN_DF_CACHE if _CLEAN_DF_CACHE is not None else pd.DataFrame()

def get_duplicate_pairs_df() -> pd.DataFrame:
    """
    Retrieves the duplicate pairs DataFrame.
    """
    global _DUPLICATE_PAIRS_DF_CACHE
    if _DUPLICATE_PAIRS_DF_CACHE is None:
        load_all_datasets()
    return _DUPLICATE_PAIRS_DF_CACHE if _DUPLICATE_PAIRS_DF_CACHE is not None else pd.DataFrame()

def get_anomaly_df() -> pd.DataFrame:
    """
    Retrieves the raw anomaly results DataFrame.
    """
    global _ANOMALY_DF_CACHE
    if _ANOMALY_DF_CACHE is None:
        load_all_datasets()
    return _ANOMALY_DF_CACHE if _ANOMALY_DF_CACHE is not None else pd.DataFrame()

def get_verification_cases() -> List[Dict[str, Any]]:
    """
    Retrieves the list of all verification cases.
    """
    global _VERIFICATION_CACHE
    if _VERIFICATION_CACHE is None:
        load_all_datasets()
    return _VERIFICATION_CACHE if _VERIFICATION_CACHE is not None else []

def is_loaded() -> bool:
    """
    Checks if datasets have been successfully loaded.
    """
    return _DATA_LOADED
