import pandas as pd
from typing import Dict, Any, List
from src.verification.verification_models import VerificationBrief, RelatedRecordDetail
from src.verification.peer_benchmark import get_peer_benchmark, calculate_peer_stats
from src.verification.reality_gap import calculate_reality_gap
from src.verification.evidence_service import get_evidence_summary
from src.verification.integrity_passport import generate_integrity_passport
from src.verification.payment_gate import generate_payment_gate_advisory

def compile_verification_brief(
    case_data: Dict[str, Any],
    db: pd.DataFrame
) -> VerificationBrief:
    """
    Compiles a structured VerificationBrief for a given investigation case.
    """
    record_id = int(case_data["record_id"])
    
    # 1. Peer Benchmarking
    peer_benchmark = get_peer_benchmark(record_id, db)
    peer_stats = calculate_peer_stats(record_id, db)
    
    # 2. Reality Gap (utilization and physical progress are missing in current dataset)
    # If in the future columns exist, they can be read. For now they are None.
    reality_gap = calculate_reality_gap(
        fund_utilization=None,
        physical_progress=None
    )
    
    # 3. Evidence Service Summary (uses freshness checks internally)
    evidence = get_evidence_summary(case_data, peer_stats)
    
    # 4. Integrity Passport
    integrity_passport = generate_integrity_passport(case_data, peer_stats)
    
    # 5. Payment Gate Advisory
    payment_gate = generate_payment_gate_advisory(case_data)
    
    # 6. Related Records (convert dict lists to RelatedRecordDetail models)
    def parse_related(rel_list: List[Dict[str, Any]]) -> List[RelatedRecordDetail]:
        res = []
        for r in rel_list:
            res.append(RelatedRecordDetail(**r))
        return res

    related_exact = parse_related(case_data.get("related_exact_duplicates", []))
    related_susp = parse_related(case_data.get("related_potentially_suspicious", []))
    related_cont = parse_related(case_data.get("related_contextual_near_duplicates", []))

    # 7. Construct and return final VerificationBrief
    return VerificationBrief(
        record_id=record_id,
        rank=int(case_data["rank"]),
        work=case_data.get("work"),
        mp_name=case_data.get("mp_name"),
        state=case_data.get("state"),
        constituency=case_data.get("constituency"),
        allocation_amount=case_data.get("allocation_amount"),
        
        investigation_priority_level=case_data["investigation_priority_level"],
        investigation_priority_score=case_data["investigation_priority_score"],
        primary_detector=case_data["primary_detector"],
        highest_severity=case_data["highest_severity"],
        
        evidence=evidence,
        peer_benchmark=peer_benchmark,
        reality_gap=reality_gap,
        integrity_passport=integrity_passport,
        payment_gate=payment_gate,
        
        related_exact_duplicates=related_exact,
        related_potentially_suspicious=related_susp,
        related_contextual_near_duplicates=related_cont
    )
