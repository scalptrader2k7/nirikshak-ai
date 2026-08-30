import pandas as pd

def create_evidence(detector, signal, severity, message, value, reference_value, unit=""):
    """
    Creates a standardized evidence dictionary.
    Nulls/NaNs are converted to None for valid JSON serialization.
    """
    return {
        "detector": str(detector),
        "signal": str(signal),
        "severity": str(severity),  # 'low', 'medium', 'high', 'critical'
        "message": str(message),
        "value": float(value) if pd.notnull(value) and isinstance(value, (int, float, complex)) else (str(value) if pd.notnull(value) else None),
        "reference_value": float(reference_value) if pd.notnull(reference_value) and isinstance(reference_value, (int, float, complex)) else (str(reference_value) if pd.notnull(reference_value) else None),
        "unit": str(unit)
    }
