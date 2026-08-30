import pandas as pd
from typing import Dict, Any, List, Optional
from src.api.data_loader import (
    get_cases,
    get_verification_cases,
    get_clean_df,
    get_anomaly_df
)
from src.api.config import CLEAN_CSV_PATH, FEATURES_CSV_PATH
from src.verification.verification_models import PeerBenchmark, RealityGapResult, IntegrityPassport, PaymentGateAdvisory, EvidenceItem

def enrich_related_case(
    rel_id: int,
    rel_type: str,
    similarity_score: Optional[float],
    clean_df: pd.DataFrame,
    anomaly_df: pd.DataFrame
) -> Dict[str, Any]:
    """
    Enriches a basic related record ID with its work description, location, budget,
    recommended date, and current priority level.
    """
    work = None
    mp_name = None
    state = None
    constituency = None
    allocation_amount = None
    recommended_date = None

    clean_matches = clean_df[clean_df["original_row_index"] == rel_id]
    if len(clean_matches) > 0:
        row = clean_matches.iloc[0]
        work = row.get("work")
        mp_name = row.get("mp_name")
        state = row.get("state")
        constituency = row.get("constituency")
        amt = row.get("allocation_amount")
        if pd.notnull(amt):
            allocation_amount = float(amt)
        recommended_date = row.get("recommended_date")

    priority_level = "LOW"
    anomaly_matches = anomaly_df[anomaly_df["original_row_index"] == rel_id]
    if len(anomaly_matches) > 0:
        p_lvl = anomaly_matches.iloc[0].get("investigation_priority_level")
        if pd.notnull(p_lvl) and p_lvl != "":
            priority_level = str(p_lvl).upper()

    return {
        "record_id": rel_id,
        "work": work,
        "mp_name": mp_name,
        "state": state,
        "constituency": constituency,
        "allocation_amount": allocation_amount,
        "recommended_date": recommended_date,
        "relationship_type": rel_type,
        "similarity_score": similarity_score,
        "priority_level": priority_level
    }

def get_case_detail(record_id: int) -> Optional[Dict[str, Any]]:
    """
    Aggregates data from clean database, investigation cases, and verification briefs
    to compose a CaseDetailResponse dictionary for a specific record_id.
    """
    cases = get_cases()
    case = next((c for c in cases if int(c["record_id"]) == record_id), None)
    if case is None:
        return None

    clean_df = get_clean_df()
    anomaly_df = get_anomaly_df()

    # 1. Project Information Lookup
    project_info = {
        "record_id": record_id,
        "work": None,
        "work_type": case.get("work_type"),
        "mp_name": case.get("mp_name"),
        "state": case.get("state"),
        "constituency": case.get("constituency"),
        "block": None,
        "village": None,
        "city": None,
        "ward": None,
        "recommended_date": case.get("recommended_date"),
        "allocation_amount": case.get("allocation_amount")
    }

    clean_matches = clean_df[clean_df["original_row_index"] == record_id]
    if len(clean_matches) > 0:
        row = clean_matches.iloc[0]
        project_info["work"] = row.get("work")
        project_info["block"] = row.get("block") if pd.notnull(row.get("block")) else None
        project_info["village"] = row.get("village") if pd.notnull(row.get("village")) else None
        project_info["city"] = row.get("city") if pd.notnull(row.get("city")) else None
        project_info["ward"] = row.get("ward") if pd.notnull(row.get("ward")) else None

    # 2. Related Records Compilation (excluding template_match)
    exact_duplicates = [
        enrich_related_case(r["record_id"], "exact_duplicate", 1.0, clean_df, anomaly_df)
        for r in case.get("related_exact_duplicates", [])
    ]
    
    potentially_suspicious = [
        enrich_related_case(
            r["record_id"], 
            "potentially_suspicious", 
            r.get("near_duplicate_context_score"), 
            clean_df, 
            anomaly_df
        )
        for r in case.get("related_potentially_suspicious", [])
        if r.get("pair_type") != "template_match"
    ]
    
    contextual_near_duplicates = [
        enrich_related_case(
            r["record_id"], 
            "contextual_near_duplicate", 
            r.get("near_duplicate_context_score"), 
            clean_df, 
            anomaly_df
        )
        for r in case.get("related_contextual_near_duplicates", [])
        if r.get("pair_type") != "template_match"
    ]

    related_records = {
        "exact_duplicates": exact_duplicates,
        "potentially_suspicious": potentially_suspicious,
        "contextual": contextual_near_duplicates
    }

    total_related_count = len(exact_duplicates) + len(potentially_suspicious) + len(contextual_near_duplicates)

    # 3. Risk Summary Compilation
    risk_summary = {
        "priority_level": case["investigation_priority_level"],
        "priority_score": case["investigation_priority_score"],
        "severity": case["highest_severity"],
        "primary_detector": case["primary_detector"],
        "evidence_count": len(case.get("evidence", [])),
        "related_record_count": total_related_count
    }

    # 4. Primary Evidence Lookup
    primary_evidence = None
    for ev in case.get("evidence", []):
        if ev.get("detector") == case["primary_detector"] and ev.get("signal") == case["primary_signal"]:
            primary_evidence = {
                "detector": ev["detector"],
                "signal": ev["signal"],
                "severity": ev["severity"],
                "message": ev["formatted_message"],
                "reference_value": ev.get("reference_value")
            }
            break
            
    if not primary_evidence and len(case.get("evidence", [])) > 0:
        ev = case["evidence"][0]
        primary_evidence = {
            "detector": ev["detector"],
            "signal": ev["signal"],
            "severity": ev["severity"],
            "message": ev.get("formatted_message", ev.get("message", "")),
            "reference_value": ev.get("reference_value")
        }

    # 5. Verification Brief Aggregation (from cache or dynamically compiled)
    verification_cases = get_verification_cases()
    ver_brief = next((v for v in verification_cases if int(v["record_id"]) == record_id), None)

    if ver_brief is None:
        # Dynamic compilation fallback
        try:
            from src.verification.build_verification import build_verification_database
            from src.verification.verification_brief import compile_verification_brief
            from src.verification.build_verification import serialize_brief
            
            db = build_verification_database(CLEAN_CSV_PATH, FEATURES_CSV_PATH)
            brief_model = compile_verification_brief(case, db)
            ver_brief = serialize_brief(brief_model)
        except Exception as e:
            print(f"Service Fallback: Verification Brief compile failed for {record_id}: {e}")
            # Minimum structure to prevent crash
            ver_brief = {
                "evidence": [],
                "peer_benchmark": {
                    "status": "insufficient_data",
                    "project_amount": case.get("allocation_amount"),
                    "peer_count": 0,
                    "peer_median": None,
                    "peer_mean": None,
                    "amount_deviation_percent": None,
                    "amount_ratio_to_median": None,
                    "peer_group_level": None,
                    "peer_scope": None
                },
                "reality_gap": {
                    "reality_gap_status": "not_available",
                    "reality_gap": None,
                    "fund_utilization": None,
                    "physical_progress": None,
                    "explanation": "Verification pipeline outputs missing."
                },
                "integrity_passport": {
                    "integrity_status": "GREEN" if case["investigation_priority_level"] == "LOW" else "AMBER" if case["investigation_priority_level"] == "MEDIUM" else "RED",
                    "integrity_score": float(max(0.0, min(100.0, 100.0 - case["investigation_priority_score"]))),
                    "signal_count": 0,
                    "positive_signals": [],
                    "risk_signals": [],
                    "data_limitations": ["Verification outputs missing."],
                    "explanation": "Integrity Passport degraded. Source verification brief not loaded."
                },
                "payment_gate": {
                    "recommendation": "PROCEED" if case["investigation_priority_level"] == "LOW" else "VERIFY" if case["investigation_priority_level"] == "MEDIUM" else "HOLD_AND_INSPECT",
                    "reason": "Payment gate advisory defaulted due to missing verification parameters.",
                    "supporting_signals": [],
                    "required_next_evidence": ["Standard sanction order"]
                }
            }

    # 6. Evidence Structuring
    evidence_categories = {
        "available": [],
        "derived": [],
        "missing": [],
        "stale": []
    }
    
    for item in ver_brief.get("evidence", []):
        status = item.get("status")
        if status == "available":
            evidence_categories["available"].append(item)
        elif status == "derived":
            evidence_categories["derived"].append(item)
        elif status == "stale":
            evidence_categories["stale"].append(item)
        elif status in ["missing", "not_available_in_current_dataset"]:
            evidence_categories["missing"].append(item)

    # 7. Available/Missing Information Lists
    available_information = [
        item["evidence_type"] for item in ver_brief.get("evidence", []) if item.get("status") == "available"
    ]
    missing_information = [
        item["evidence_type"] for item in ver_brief.get("evidence", []) if item.get("status") in ["missing", "not_available_in_current_dataset"]
    ]

    return {
        "case": case,
        "project": project_info,
        "risk_summary": risk_summary,
        "primary_evidence": primary_evidence,
        "evidence": evidence_categories,
        "verification": ver_brief,
        "peer_benchmark": ver_brief["peer_benchmark"],
        "integrity_passport": ver_brief["integrity_passport"],
        "payment_gate": ver_brief["payment_gate"],
        "related_records": related_records,
        "available_information": available_information,
        "missing_information": missing_information,
        "disclaimer": "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."
    }
