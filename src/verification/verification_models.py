from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

# Configurable constants / thresholds
REFERENCE_DATE = "2024-03-15"  # Audit cycle reference date
FRESHNESS_FRESH_DAYS = 7
FRESHNESS_AGING_DAYS = 30
PEER_GROUP_MIN_SIZE = 3
COST_DEVIATION_HIGH_LIMIT = 50.0  # Deviation percent threshold to flag as cost risk in Integrity Passport

class EvidenceItem(BaseModel):
    evidence_type: str = Field(..., description="Type of evidence: e.g. site_photograph, measurement_book, allocation_amount")
    status: str = Field(..., description="Classification: available, derived, missing, stale")
    value: Optional[Any] = Field(None, description="Actual data value if available")
    unit: Optional[str] = Field(None, description="Unit of measurement: e.g. INR, count, percentage")
    source: str = Field(..., description="Data source name or database file origin")
    explanation: str = Field(..., description="Human readable explanation of the evidence status/value")
    confidence: float = Field(..., description="System confidence score for this evidence item (0.0 to 1.0)")

class PeerBenchmark(BaseModel):
    status: str = Field(..., description="Success or insufficient_data status")
    project_amount: Optional[float] = Field(None, description="Target project amount")
    peer_count: Optional[int] = Field(None, description="Number of comparison peers in the group")
    peer_median: Optional[float] = Field(None, description="Median amount of the peer group")
    peer_mean: Optional[float] = Field(None, description="Mean amount of the peer group")
    amount_deviation_percent: Optional[float] = Field(None, description="Percentage deviation from peer median")
    amount_ratio_to_median: Optional[float] = Field(None, description="Ratio of project amount to peer median")
    peer_group_level: Optional[str] = Field(None, description="Level used for peer group: local or national")
    peer_scope: Optional[str] = Field(None, description="Scope used for comparison: local or national")

class RealityGapResult(BaseModel):
    reality_gap_status: str = Field("not_available", description="reality_gap_status: calculated, not_available")
    reality_gap: Optional[float] = Field(None, description="Difference between utilization and progress")
    fund_utilization: Optional[float] = Field(None, description="Fund utilization percentage")
    physical_progress: Optional[float] = Field(None, description="Physical progress percentage")
    explanation: str = Field(..., description="Short explanation detailing calculations or missing values")

class IntegrityPassport(BaseModel):
    integrity_status: str = Field(..., description="Integrity badge: GREEN, AMBER, RED")
    integrity_score: float = Field(..., description="Deterministic integrity score between 0.0 and 100.0")
    signal_count: int = Field(..., description="Count of triggered anomaly flags")
    positive_signals: List[str] = Field(default_factory=list, description="List of positive indicators")
    risk_signals: List[str] = Field(default_factory=list, description="List of risk indicators")
    data_limitations: List[str] = Field(default_factory=list, description="List of missing or low quality data characteristics")
    explanation: str = Field(..., description="Summary explanation of the integrity assessment")

class PaymentGateAdvisory(BaseModel):
    recommendation: str = Field(..., description="Advisory action: PROCEED, VERIFY, HOLD_AND_INSPECT")
    reason: str = Field(..., description="Reason for the recommendation")
    supporting_signals: List[str] = Field(default_factory=list, description="Signals supporting this decision")
    required_next_evidence: List[str] = Field(default_factory=list, description="Checklist of evidence to request next")

class RelatedRecordDetail(BaseModel):
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

class VerificationBrief(BaseModel):
    record_id: int
    rank: int
    work: Optional[str] = None
    mp_name: Optional[str] = None
    state: Optional[str] = None
    constituency: Optional[str] = None
    allocation_amount: Optional[float] = None

    investigation_priority_level: str
    investigation_priority_score: float
    primary_detector: str
    highest_severity: str

    evidence: List[EvidenceItem]
    peer_benchmark: PeerBenchmark
    reality_gap: RealityGapResult
    integrity_passport: IntegrityPassport
    payment_gate: PaymentGateAdvisory

    related_exact_duplicates: List[RelatedRecordDetail] = Field(default_factory=list)
    related_potentially_suspicious: List[RelatedRecordDetail] = Field(default_factory=list)
    related_contextual_near_duplicates: List[RelatedRecordDetail] = Field(default_factory=list)

    disclaimer: str = "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."
