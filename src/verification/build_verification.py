import os
import json
import pandas as pd
from typing import List, Dict, Any

from src.verification.verification_models import VerificationBrief, REFERENCE_DATE
from src.verification.verification_brief import compile_verification_brief

def build_verification_database(clean_csv: str, feat_csv: str) -> pd.DataFrame:
    """
    Creates a merged projects database for peer benchmarking comparisons.
    """
    clean_df = pd.read_csv(clean_csv)
    feat_df = pd.read_csv(feat_csv)
    
    db = pd.merge(
        clean_df[["original_row_index", "state", "allocation_amount"]],
        feat_df[["original_row_index", "work_type"]],
        on="original_row_index",
        how="left"
    )
    return db

def serialize_brief(brief: VerificationBrief) -> Dict[str, Any]:
    """
    Safely serializes a Pydantic VerificationBrief model supporting Pydantic v1 & v2.
    """
    if hasattr(brief, "model_dump"):
        return brief.model_dump()
    return brief.dict()

def write_verification_csv(briefs: List[VerificationBrief], out_csv_path: str):
    """
    Writes a flattened representation of VerificationBriefs to a CSV file.
    """
    rows = []
    for brief in briefs:
        b_dict = serialize_brief(brief)
        
        # Flatten nested fields
        row = {
            "record_id": b_dict["record_id"],
            "rank": b_dict["rank"],
            "work": b_dict["work"],
            "mp_name": b_dict["mp_name"],
            "state": b_dict["state"],
            "constituency": b_dict["constituency"],
            "allocation_amount": b_dict["allocation_amount"],
            "investigation_priority_level": b_dict["investigation_priority_level"],
            "investigation_priority_score": b_dict["investigation_priority_score"],
            "primary_detector": b_dict["primary_detector"],
            "highest_severity": b_dict["highest_severity"],
            "integrity_status": b_dict["integrity_passport"]["integrity_status"],
            "integrity_score": b_dict["integrity_passport"]["integrity_score"],
            "payment_gate_recommendation": b_dict["payment_gate"]["recommendation"],
            "payment_gate_reason": b_dict["payment_gate"]["reason"],
            "peer_group_level": b_dict["peer_benchmark"]["peer_group_level"],
            "peer_count": b_dict["peer_benchmark"]["peer_count"],
            "peer_median": b_dict["peer_benchmark"]["peer_median"],
            "amount_deviation_percent": b_dict["peer_benchmark"]["amount_deviation_percent"],
            "amount_ratio_to_median": b_dict["peer_benchmark"]["amount_ratio_to_median"],
            "reality_gap_status": b_dict["reality_gap"]["reality_gap_status"],
            "reality_gap": b_dict["reality_gap"]["reality_gap"],
            "evidence_json": json.dumps(b_dict["evidence"]),
            "required_next_evidence_json": json.dumps(b_dict["payment_gate"]["required_next_evidence"]),
            "disclaimer": b_dict["disclaimer"]
        }
        rows.append(row)
        
    df = pd.DataFrame(rows)
    # Ensure stable column order
    cols_order = [
        "record_id", "rank", "work", "mp_name", "state", "constituency", "allocation_amount",
        "investigation_priority_level", "investigation_priority_score", "primary_detector", "highest_severity",
        "integrity_status", "integrity_score", "payment_gate_recommendation", "payment_gate_reason",
        "peer_group_level", "peer_count", "peer_median", "amount_deviation_percent", "amount_ratio_to_median",
        "reality_gap_status", "reality_gap", "evidence_json", "required_next_evidence_json", "disclaimer"
    ]
    df = df[cols_order]
    df.to_csv(out_csv_path, index=False)

def run_verification_pipeline(
    investigation_json: str,
    clean_csv: str,
    feat_csv: str,
    out_csv: str,
    out_json: str
):
    """
    Main pipeline to load investigation cases, compile verification packages, and export CSV/JSON.
    """
    print("Initializing Verification Intelligence Pipeline...")
    
    # 1. Load source comparison database
    db = build_verification_database(clean_csv, feat_csv)
    
    # 2. Load generated investigation cases
    if not os.path.exists(investigation_json):
        raise FileNotFoundError(f"Investigation cases JSON missing: {investigation_json}")
        
    with open(investigation_json, "r", encoding="utf-8") as f:
        cases_data = json.load(f)
        
    cases = cases_data.get("cases", [])
    print(f"Loaded {len(cases)} investigation cases to enrich.")
    
    # 3. Process each case and compile the Verification Brief
    briefs = []
    for idx, case in enumerate(cases):
        brief = compile_verification_brief(case, db)
        briefs.append(brief)
        if (idx + 1) % 100 == 0 or (idx + 1) == len(cases):
            print(f"Processed {idx + 1}/{len(cases)} cases...")
            
    # 4. Generate report packages
    os.makedirs(os.path.dirname(out_csv), exist_ok=True)
    os.makedirs(os.path.dirname(out_json), exist_ok=True)
    
    # Write Flattened CSV
    write_verification_csv(briefs, out_csv)
    print(f"Successfully wrote flattened verification CSV to {out_csv}")
    
    # Write Nested JSON
    serialized_cases = [serialize_brief(b) for b in briefs]
    output_report = {
        "metadata": {
            "total_records_evaluated": len(db),
            "total_verification_cases": len(briefs),
            "audit_reference_date": REFERENCE_DATE
        },
        "cases": serialized_cases
    }
    
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(output_report, f, indent=2, ensure_ascii=False)
    print(f"Successfully wrote nested verification JSON to {out_json}")
    
    # Print Distribution Statistics
    print_verification_summary(briefs)

def print_verification_summary(briefs: List[VerificationBrief]):
    """
    Prints a clean summary of the verification classification results.
    """
    total = len(briefs)
    passport_counts = {"GREEN": 0, "AMBER": 0, "RED": 0}
    payment_counts = {"PROCEED": 0, "VERIFY": 0, "HOLD_AND_INSPECT": 0}
    benchmark_counts = {"local": 0, "national": 0, "insufficient_data": 0}
    
    for b in briefs:
        passport_counts[b.integrity_passport.integrity_status] += 1
        payment_counts[b.payment_gate.recommendation] += 1
        
        level = b.peer_benchmark.peer_group_level
        if b.peer_benchmark.status == "insufficient_data" or not level:
            benchmark_counts["insufficient_data"] += 1
        else:
            benchmark_counts[level] += 1
            
    print("\n================== STEP 6 VERIFICATION SUMMARY ==================")
    print(f"Total verification cases processed: {total}")
    
    print("\nIntegrity Passport Distribution:")
    for status, count in passport_counts.items():
        pct = (count / total) * 100 if total > 0 else 0
        print(f"  - {status}: {count} ({pct:.1f}%)")
        
    print("\nPayment Gate Recommendation Distribution:")
    for rec, count in payment_counts.items():
        pct = (count / total) * 100 if total > 0 else 0
        print(f"  - {rec}: {count} ({pct:.1f}%)")
        
    print("\nPeer Benchmarking Level Coverage:")
    for level, count in benchmark_counts.items():
        pct = (count / total) * 100 if total > 0 else 0
        print(f"  - {level}: {count} ({pct:.1f}%)")
    print("=================================================================\n")

if __name__ == "__main__":
    investigation_json = "data/reports/investigation_cases.json"
    clean_csv = "data/processed/mplads_clean.csv"
    feat_csv = "data/processed/mplads_features.csv"
    
    out_csv = "data/processed/verification_cases.csv"
    out_json = "data/reports/verification_cases.json"
    
    run_verification_pipeline(investigation_json, clean_csv, feat_csv, out_csv, out_json)
