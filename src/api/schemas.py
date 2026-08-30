from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Evidence(BaseModel):
    detector: str
    signal: str
    severity: str
    message: str
    formatted_message: str
    value: Optional[Any] = None
    reference_value: Optional[Any] = None
    unit: Optional[str] = None
    record_a: Optional[int] = None
    record_b: Optional[int] = None

class RelatedRecord(BaseModel):
    record_id: int
    mp_name: Optional[str] = None
    allocation_amount: Optional[float] = None
    recommended_date: Optional[str] = None
    text_similarity: Optional[float] = None
    location_similarity: Optional[float] = None
    amount_ratio: Optional[float] = None
    date_gap_days: Optional[float] = None
    near_duplicate_context_score: Optional[float] = None
    pair_type: Optional[str] = None

class InvestigationCase(BaseModel):
    rank: int
    record_id: int
    mp_name: Optional[str] = None
    house: Optional[str] = None
    state: Optional[str] = None
    constituency: Optional[str] = None
    city: Optional[str] = None
    ward: Optional[str] = None
    block: Optional[str] = None
    village: Optional[str] = None
    recommended_date: Optional[str] = None
    work: Optional[str] = None
    work_type: Optional[str] = None
    allocation_amount: Optional[float] = None
    
    investigation_priority_score: float
    investigation_priority_level: str
    case_status: str
    
    cost_anomaly: bool
    exact_duplicate_anomaly: bool
    near_duplicate_anomaly: bool
    pattern_anomaly: bool
    
    primary_detector: str
    primary_signal: str
    highest_severity: str
    highest_severity_score: int
    
    title: str
    summary: str
    disclaimer: str
    
    evidence_count: int
    evidence: List[Evidence]
    
    related_exact_duplicates: List[RelatedRecord]
    related_potentially_suspicious: List[RelatedRecord]
    related_contextual_near_duplicates: List[RelatedRecord]

class Pagination(BaseModel):
    page: int
    page_size: int
    total_records: int
    total_pages: int

class Filters(BaseModel):
    priority: Optional[str] = None
    detector: Optional[str] = None
    severity: Optional[str] = None
    state: Optional[str] = None
    constituency: Optional[str] = None
    mp_name: Optional[str] = None
    work_type: Optional[str] = None
    min_score: Optional[float] = None
    max_score: Optional[float] = None
    search: Optional[str] = None

class CaseListResponse(BaseModel):
    data: List[InvestigationCase]
    pagination: Pagination
    filters: Filters

class SingleCaseResponse(BaseModel):
    data: InvestigationCase

class StatisticsScoreSummary(BaseModel):
    min: float
    max: float
    mean: float
    median: float

class StatisticsResponse(BaseModel):
    total_records: int
    investigation_cases: int
    priority_distribution: Dict[str, int]
    detector_distribution: Dict[str, int]
    score: StatisticsScoreSummary

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    data_loaded: bool

# STEP 7: Case Detail & Verification schemas
from src.verification.verification_models import PeerBenchmark, RealityGapResult, IntegrityPassport, PaymentGateAdvisory, EvidenceItem

class ProjectDetails(BaseModel):
    record_id: int
    work: Optional[str] = None
    work_type: Optional[str] = None
    mp_name: Optional[str] = None
    state: Optional[str] = None
    constituency: Optional[str] = None
    block: Optional[str] = None
    village: Optional[str] = None
    city: Optional[str] = None
    ward: Optional[str] = None
    recommended_date: Optional[str] = None
    allocation_amount: Optional[float] = None

class RiskSummary(BaseModel):
    priority_level: str
    priority_score: float
    severity: str
    primary_detector: str
    evidence_count: int
    related_record_count: int

class PrimaryEvidence(BaseModel):
    detector: str
    signal: str
    severity: str
    message: str
    reference_value: Optional[Any] = None

class RelatedCase(BaseModel):
    record_id: int
    work: Optional[str] = None
    mp_name: Optional[str] = None
    state: Optional[str] = None
    constituency: Optional[str] = None
    allocation_amount: Optional[float] = None
    recommended_date: Optional[str] = None
    relationship_type: str  # exact_duplicate, potentially_suspicious, contextual_near_duplicate
    similarity_score: Optional[float] = None
    priority_level: str

class CaseDetailResponse(BaseModel):
    case: InvestigationCase
    project: ProjectDetails
    risk_summary: RiskSummary
    primary_evidence: Optional[PrimaryEvidence] = None
    evidence: Dict[str, List[EvidenceItem]]
    verification: Dict[str, Any]  # aggregated verification fields
    peer_benchmark: PeerBenchmark
    integrity_passport: IntegrityPassport
    payment_gate: PaymentGateAdvisory
    related_records: Dict[str, List[RelatedCase]]
    available_information: List[str]
    missing_information: List[str]
    disclaimer: str = "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."
