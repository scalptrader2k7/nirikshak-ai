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

# ==========================================
# PHASE B1 EXTENSIONS: LIFECYCLE & OVERVIEW
# ==========================================

class DimensionDetail(BaseModel):
    available_fields: List[str]
    expected_fields: List[str]
    missing_fields: List[str]
    not_available_in_source_dataset: List[str] = Field(default_factory=list)
    completeness_percent: float

class DataCompletenessModel(BaseModel):
    dimensions: Dict[str, DimensionDetail]
    total_available_fields: int
    total_expected_fields: int
    overall_completeness_percent: float
    coverage_level: str  # HIGH, MODERATE, LIMITED, VERY_LIMITED
    missing_fields: List[str] = Field(default_factory=list)
    not_available_in_source_dataset: List[str] = Field(default_factory=list)

class RecommendationModel(BaseModel):
    recommended_date: Optional[str] = None
    allocation_amount: Optional[float] = None
    mp_name: Optional[str] = None
    house: Optional[str] = None
    state: Optional[str] = None
    constituency: Optional[str] = None
    availability: str = "AVAILABLE"

class SanctionModel(BaseModel):
    status: Optional[str] = None
    ida_approval: Optional[str] = None
    sanctioned_amount: Optional[float] = None
    sanction_date: Optional[str] = None
    availability: str = "DERIVED_STATUS_ONLY"

class EstimateModel(BaseModel):
    approved_estimate_amount: Optional[float] = None
    technical_sanction_reference: Optional[str] = None
    availability: str = "NOT_AVAILABLE_IN_CURRENT_DATASET"

class WorkOrderModel(BaseModel):
    work_order_number: Optional[str] = None
    work_order_date: Optional[str] = None
    agency_name: Optional[str] = None
    availability: str = "NOT_AVAILABLE_IN_CURRENT_DATASET"

class FundReleaseModel(BaseModel):
    funds_released_amount: Optional[float] = None
    release_installments: Optional[int] = None
    availability: str = "NOT_AVAILABLE_IN_CURRENT_DATASET"

class ExpenditureModel(BaseModel):
    expenditure_amount: Optional[float] = None
    expenditure_date: Optional[str] = None
    availability: str = "NOT_AVAILABLE_IN_CURRENT_DATASET"

class PaymentModel(BaseModel):
    total_disbursed: Optional[float] = None
    voucher_count: Optional[int] = None
    availability: str = "NOT_AVAILABLE_IN_CURRENT_DATASET"

class MilestoneModel(BaseModel):
    milestones_count: Optional[int] = None
    current_milestone: Optional[str] = None
    availability: str = "NOT_AVAILABLE_IN_CURRENT_DATASET"

class ProgressModel(BaseModel):
    physical_progress_percent: Optional[float] = None
    financial_progress_percent: Optional[float] = None
    availability: str = "NOT_AVAILABLE_IN_CURRENT_DATASET"

class InspectionModel(BaseModel):
    inspection_count: Optional[int] = None
    last_inspection_date: Optional[str] = None
    availability: str = "NOT_AVAILABLE_IN_CURRENT_DATASET"

class CompletionModel(BaseModel):
    expected_completion_date: Optional[str] = None
    actual_completion_date: Optional[str] = None
    delay_days: Optional[int] = None
    completion_certificate_available: bool = False
    availability: str = "NOT_AVAILABLE_IN_CURRENT_DATASET"

class AssetModel(BaseModel):
    asset_id: Optional[str] = None
    asset_registered: bool = False
    availability: str = "NOT_AVAILABLE_IN_CURRENT_DATASET"

class DocumentModel(BaseModel):
    documents_count: int = 0
    document_links: List[str] = Field(default_factory=list)
    availability: str = "NOT_AVAILABLE_IN_CURRENT_DATASET"

class LifecycleOverview(BaseModel):
    recommendation: Dict[str, Any]
    sanction: Dict[str, Any]
    estimate: Dict[str, Any]
    work_order: Dict[str, Any]
    fund_release: Dict[str, Any]
    expenditure: Dict[str, Any]
    payment: Dict[str, Any]
    milestone: Dict[str, Any]
    progress: Dict[str, Any]
    inspection: Dict[str, Any]
    completion: Dict[str, Any]
    asset: Dict[str, Any]
    document: Dict[str, Any]

class FinancialSummaryModel(BaseModel):
    allocation_amount: Optional[float] = None
    sanctioned_amount: Optional[float] = None
    expenditure_amount: Optional[float] = None
    funds_released: Optional[float] = None
    status: Optional[str] = None
    cost_anomaly_triggered: bool = False
    cost_deviation_percent: Optional[float] = None

class ProgressSummaryModel(BaseModel):
    physical_progress_percent: Optional[float] = None
    financial_progress_percent: Optional[float] = None
    reality_gap: Optional[float] = None
    reality_gap_status: str = "not_available"
    explanation: str

class CanonicalRiskModel(BaseModel):
    triggered: bool
    risk_score: float
    review_priority: str
    severity: str
    primary_detector: str
    primary_signal: str = ""
    signal_count: int
    title: str
    summary: str

class ReviewSummaryModel(BaseModel):
    total_reviews: int
    latest_outcome: Optional[str] = None
    reviews: List[Dict[str, Any]] = Field(default_factory=list)

class DataProvenanceModel(BaseModel):
    source_name: str
    snapshot_type: str
    record_count: int
    available_fields: List[str]
    unavailable_lifecycle_fields: List[str]
    analysis_coverage: str

class ProjectListItem(BaseModel):
    record_id: int
    work: Optional[str] = None
    category: Optional[str] = None
    mp_name: Optional[str] = None
    house: Optional[str] = None
    state: Optional[str] = None
    constituency: Optional[str] = None
    ida: Optional[str] = None
    city: Optional[str] = None
    ward: Optional[str] = None
    block: Optional[str] = None
    village: Optional[str] = None
    recommended_date: Optional[str] = None
    allocation_amount: Optional[float] = None
    ida_approval: Optional[str] = None
    status: Optional[str] = None
    has_investigation_case: bool
    investigation_priority_level: Optional[str] = "NONE"
    investigation_priority_score: Optional[float] = 0.0
    primary_detector: Optional[str] = None

class ProjectListResponse(BaseModel):
    data: List[ProjectListItem]
    pagination: Pagination
    filters: Dict[str, Any]

class ProjectOverviewResponse(BaseModel):
    project: Dict[str, Any]
    recommendation: Dict[str, Any]
    lifecycle: LifecycleOverview
    financial: FinancialSummaryModel
    progress: ProgressSummaryModel
    risk: CanonicalRiskModel
    data_completeness: DataCompletenessModel
    evidence_summary: List[Any] = Field(default_factory=list)
    workflow: Dict[str, Any]
    review_summary: ReviewSummaryModel
    related_records: Dict[str, List[Any]] = Field(default_factory=dict)
    data_provenance: DataProvenanceModel
    disclaimer: str = "Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption."
    demo_enrichment: Optional[Dict[str, Any]] = None

# ==========================================
# PHASE B1 EXTENSIONS: WORKFLOW & AUDIT
# ==========================================

class WorkflowStatusResponse(BaseModel):
    record_id: int
    status: str
    assigned_to: Optional[str] = None
    assigned_role: Optional[str] = None
    updated_at: str
    created_at: Optional[str] = None
    decision: Optional[str] = None
    decision_reason: Optional[str] = None
    allowed_next_states: List[str]

class WorkflowStatusUpdateRequest(BaseModel):
    new_status: str
    user_id: str = "investigator"
    role: str = "investigator"
    reason: Optional[str] = None
    assigned_to: Optional[str] = None
    assigned_role: Optional[str] = None
    decision: Optional[str] = None
    decision_reason: Optional[str] = None

class ReviewCreateRequest(BaseModel):
    reviewer_id: str
    reviewer_role: str = "investigator"
    outcome: str
    note: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    record_id: int
    reviewer_id: str
    reviewer_role: str
    outcome: str
    note: Optional[str] = None
    timestamp: str

class EvidenceRequestCreate(BaseModel):
    evidence_type: str
    description: Optional[str] = None
    requested_by: Optional[str] = "investigator"
    notes: Optional[str] = None
    evidence_reference: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class EvidenceRequestUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    user_id: Optional[str] = "investigator"
    role: Optional[str] = "investigator"
    verified_by: Optional[str] = None
    reviewer_user_id: Optional[str] = None
    reviewer_role: Optional[str] = None
    verification_result: Optional[str] = None
    verification_note: Optional[str] = None
    rejection_reason: Optional[str] = None
    evidence_reference: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class EvidenceRequestResponse(BaseModel):
    evidence_request_id: Optional[str] = None
    request_id: str
    case_id: Optional[int] = None
    record_id: int
    evidence_type: str
    description: Optional[str] = None
    status: str
    requested_by: str
    requested_at: str
    received_at: Optional[str] = None
    notes: Optional[str] = None
    verification_started_at: Optional[str] = None
    verified_at: Optional[str] = None
    verified_by: Optional[str] = None
    rejected_at: Optional[str] = None
    reviewer_user_id: Optional[str] = None
    reviewer_role: Optional[str] = None
    verification_result: Optional[str] = None
    verification_note: Optional[str] = None
    rejection_reason: Optional[str] = None
    evidence_reference: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AuditEventResponse(BaseModel):
    action_id: str
    record_id: int
    user_id: str
    role: str
    timestamp: str
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    action: str
    reason: Optional[str] = None
    evidence_reference: Optional[str] = None

# ==========================================
# PHASE B1 EXTENSIONS: TREND ANALYTICS
# ==========================================

class AllocationTrendItem(BaseModel):
    period: str
    record_count: int
    total_allocation_amount: float
    mean_allocation_amount: float
    median_allocation_amount: float
    min_allocation_amount: float
    max_allocation_amount: float

class AllocationTrendsResponse(BaseModel):
    interval: str
    total_periods: int
    data: List[AllocationTrendItem]

class RecommendationTrendItem(BaseModel):
    period: str
    recommendation_count: int
    unique_mps: int
    unique_constituencies: int
    unique_states: int

class RecommendationTrendsResponse(BaseModel):
    interval: str
    total_periods: int
    data: List[RecommendationTrendItem]

class RiskTrendItem(BaseModel):
    period: str
    case_count: int
    mean_priority_score: float
    max_priority_score: float
    priority_distribution: Dict[str, int]

class RiskTrendsResponse(BaseModel):
    interval: str
    total_periods: int
    data: List[RiskTrendItem]

class AnomalyTrendItem(BaseModel):
    period: str
    total_detector_triggers: int
    detector_counts: Dict[str, int]

class AnomalyTrendsResponse(BaseModel):
    interval: str
    total_periods: int
    data: List[AnomalyTrendItem]

# ==========================================
# PHASE B2 EXTENSIONS: AUTHENTICATION & RBAC
# ==========================================

class UserScopeModel(BaseModel):
    scope_id: Optional[str] = None
    scope_type: str
    state: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None
    mp_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str
    requested_portal: Optional[str] = None

    model_config = {"extra": "forbid"}

class UserResponse(BaseModel):
    user_id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    onboarding_completed: bool
    designation: Optional[str] = None
    phone: Optional[str] = None
    scope: Optional[UserScopeModel] = None
    recommended_portal: str

class LoginResponse(BaseModel):
    user: UserResponse
    message: str = "Login successful."

class CurrentUserResponse(BaseModel):
    authenticated: bool
    user_id: str
    email: str
    full_name: str
    role: str
    scope: Optional[UserScopeModel] = None
    onboarding_completed: bool
    designation: Optional[str] = None
    phone: Optional[str] = None
    recommended_portal: str

class PortalAccessRequest(BaseModel):
    portal: str

    model_config = {"extra": "forbid"}

class PortalAccessResponse(BaseModel):
    allowed: bool
    actual_role: str
    recommended_portal: str

class PortalOptionsResponse(BaseModel):
    official_portals: List[str]
    citizen_portal: str

class OnboardingProfileResponse(BaseModel):
    user_id: str
    email: str
    full_name: str
    designation: Optional[str] = None
    phone: Optional[str] = None
    onboarding_completed: bool
    role: str
    scope: Optional[UserScopeModel] = None

class OnboardingUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None

    model_config = {"extra": "forbid"}

class OnboardingCompleteResponse(BaseModel):
    user_id: str
    email: str
    onboarding_completed: bool
    message: str

# ==========================================
# DEMONSTRATION LIFECYCLE ENRICHMENT SCHEMAS
# ==========================================

class DemoProjectMetadataModel(BaseModel):
    state: Optional[str] = None
    constituency: Optional[str] = None
    work_type: Optional[str] = None
    work_order_number: Optional[str] = None
    work_order_date: Optional[str] = None
    agency_name: Optional[str] = None
    sanction_date: Optional[str] = None
    completion_certificate_available: bool = False

class DemoFinancialIntelligenceModel(BaseModel):
    sanctioned_amount: float
    approved_estimate: float
    revised_estimate: float
    funds_released: float
    expenditure_amount: float
    remaining_balance: float
    utilization_percent: float
    cost_overrun_amount: float
    cost_overrun_percent: float
    cost_overrun_status: str
    financial_status: str

class DemoTrajectoryPredictionModel(BaseModel):
    trajectory_algorithm: str
    predicted_completion_date: Optional[str] = None
    projected_additional_days: Optional[int] = None
    confidence: str

class DemoExecutionProgressModel(BaseModel):
    physical_progress_percent: float
    financial_progress_percent: float
    reality_gap_percent: float
    reality_gap_status: str
    reality_gap_alert: bool
    reality_gap_explanation: str
    expected_completion_date: Optional[str] = None
    actual_completion_date: Optional[str] = None
    delay_days: int
    delay_status: str
    prediction: DemoTrajectoryPredictionModel

class DemoPaymentIntelligenceModel(BaseModel):
    total_disbursed: float
    voucher_count: int
    anomaly_signals: List[Dict[str, Any]] = Field(default_factory=list)
    has_payment_anomalies: bool = False
    vouchers: List[Dict[str, Any]] = Field(default_factory=list)

class DemoAssetRegisterModel(BaseModel):
    asset_registered: bool
    registration_status: Optional[str] = None
    primary_asset_id: Optional[str] = None
    primary_asset_name: Optional[str] = None
    handover_recipient: Optional[str] = None
    total_assets: int = 0
    assets: List[Dict[str, Any]] = Field(default_factory=list)

class DemoGeospatialModel(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_source: str
    proximity_cluster: Optional[Dict[str, Any]] = None

class DemoComplianceScreeningModel(BaseModel):
    overall_status: str
    stages_passed: int
    total_stages: int
    checklist: List[Dict[str, Any]] = Field(default_factory=list)

class DemoLifecycleResponse(BaseModel):
    record_id: int
    is_demo_enrichment: bool
    available: bool
    data_source: str
    source_classification: str
    disclaimer: Optional[str] = None
    is_healthy_control: Optional[bool] = None
    project_metadata: Optional[DemoProjectMetadataModel] = None
    financial_intelligence: Optional[DemoFinancialIntelligenceModel] = None
    execution_progress: Optional[DemoExecutionProgressModel] = None
    milestones: Optional[List[Dict[str, Any]]] = None
    payment_intelligence: Optional[DemoPaymentIntelligenceModel] = None
    inspections: Optional[List[Dict[str, Any]]] = None
    asset_register: Optional[DemoAssetRegisterModel] = None
    geospatial: Optional[DemoGeospatialModel] = None
    compliance_screening: Optional[DemoComplianceScreeningModel] = None
    message: Optional[str] = None

# ==================================================
# B4 INTELLIGENCE SCHEMAS
# ==================================================

class PublicProjectDetailResponse(BaseModel):
    record_id: int
    work: Optional[str] = None
    category: Optional[str] = None
    mp_name: Optional[str] = None
    house: Optional[str] = None
    state: Optional[str] = None
    constituency: Optional[str] = None
    ida: Optional[str] = None
    city: Optional[str] = None
    ward: Optional[str] = None
    block: Optional[str] = None
    village: Optional[str] = None
    recommended_date: Optional[str] = None
    allocation_amount: Optional[float] = None
    ida_approval: Optional[str] = None
    status: Optional[str] = None
    disclaimer: str

class PeerBenchmarkResponse(BaseModel):
    record_id: int
    project_amount: Optional[float] = None
    peer_group_level: str
    peer_group_definition: str
    peer_count: int
    peer_min: Optional[float] = None
    peer_max: Optional[float] = None
    peer_mean: Optional[float] = None
    peer_median: Optional[float] = None
    peer_percentile: Optional[float] = None
    ratio_to_peer_median: Optional[float] = None
    deviation_percent_from_peer_median: Optional[float] = None
    benchmark_period: str
    benchmark_version: str
    fallback_used: bool
    interpretation: str
    disclaimer: str

class DuplicateMatchModel(BaseModel):
    record_id: int
    matched_record_id: int
    duplicate_type: str
    classification: str
    similarity_score: Optional[float] = None
    exact_group_id: Optional[str] = None
    amount_difference: Optional[float] = None
    amount_ratio: Optional[float] = None
    date_gap_days: Optional[int] = None
    same_state: Optional[bool] = None
    same_constituency: Optional[bool] = None
    same_ida: Optional[bool] = None
    reason: str

class ProjectDuplicatesResponse(BaseModel):
    record_id: int
    total_matches: int
    exact_duplicate_count: int
    near_duplicate_count: int
    matches: List[DuplicateMatchModel]
    disclaimer: str

class DuplicateListResponse(BaseModel):
    data: List[DuplicateMatchModel]
    pagination: Pagination
    disclaimer: str

class ImplementingAuthorityItem(BaseModel):
    ida_name: str
    project_count: int
    total_allocation: float
    average_allocation: float
    median_allocation: float
    average_risk_score: float
    high_risk_record_count: int
    exact_duplicate_record_count: int
    near_duplicate_signal_count: int
    work_type_distribution: Dict[str, int]
    state_distribution: Dict[str, int]
    interpretation: str
    disclaimer: str

class ImplementingAuthorityListResponse(BaseModel):
    total_authorities: int
    authorities: List[ImplementingAuthorityItem]
    disclaimer: str

class ConcentrationAnalyticsResponse(BaseModel):
    total_projects: int
    total_allocation: float
    category_concentration: List[Dict[str, Any]]
    ida_concentration: List[Dict[str, Any]]
    constituency_concentration: List[Dict[str, Any]]
    temporal_bursts: List[Dict[str, Any]]
    allocation_concentration: Dict[str, Any]
    interpretation: str
    disclaimer: str

class DetectorMetadataModel(BaseModel):
    detector_id: str
    detector_name: str
    detector_version: str
    description: str
    input_fields: List[str]
    threshold_config_summary: Dict[str, Any]
    output_type: str
    limitations: List[str]
    interpretation: str
    last_updated: str

class DetectorRegistryResponse(BaseModel):
    registry_version: str
    versioning_note: str
    total_detectors: int
    detectors: List[DetectorMetadataModel]
    disclaimer: str

class SystemProvenanceResponse(BaseModel):
    generated_at: str
    service: str
    official_data: Dict[str, Any]
    derived_analytics: Dict[str, Any]
    demonstration_lifecycle: Dict[str, Any]
    disclaimer: str


