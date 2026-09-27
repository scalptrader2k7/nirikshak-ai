from typing import Dict, Any, List

def format_demo_assets(raw_assets: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Formats asset register information for demonstration lifecycle records.
    """
    if not raw_assets:
        return {
            "asset_registered": False,
            "total_assets": 0,
            "assets": []
        }

    first_asset = raw_assets[0]
    status = str(first_asset.get("registration_status", "NOT_REGISTERED")).upper()
    is_registered = status == "REGISTERED"

    return {
        "asset_registered": is_registered,
        "registration_status": status,
        "primary_asset_id": first_asset.get("asset_id"),
        "primary_asset_name": first_asset.get("asset_name"),
        "handover_recipient": first_asset.get("handover_to"),
        "total_assets": len(raw_assets),
        "assets": raw_assets
    }
