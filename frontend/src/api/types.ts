export type SeverityLevel = "low" | "medium" | "high" | "critical";
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DetectorName = "cost" | "exact_duplicate" | "near_duplicate" | "pattern";

// Proposed to Veda, not yet backend-confirmed — see Blueprint §6.
// Falls back gracefully if the real API sends something else.
export type CaseStatus = "OPEN" | "ASSIGNED" | "ESCALATED" | "CLOSED";

export interface Evidence {
    detector: DetectorName | string;
    signal: string;
    severity: SeverityLevel;
    message: string;
    formatted_message: string;
    value?: number | null;
    reference_value?: number | null;
    unit?: string;
    record_a?: number;
    record_b?: number;
}

export interface RelatedRecord {
    record_id: number;
    mp_name?: string;
    allocation_amount?: number;
    recommended_date?: string;
    text_similarity?: number;
    location_similarity?: number;
    amount_ratio?: number;
    date_gap_days?: number;
    near_duplicate_context_score?: number;
    pair_type?: string;
}

export interface InvestigationCase {
    rank: number;
    record_id: number;
    mp_name?: string;
    house?: string;
    state?: string;
    constituency?: string;
    city?: string;
    ward?: string;
    block?: string;
    village?: string;
    recommended_date?: string;
    work?: string;
    work_type?: string;
    allocation_amount?: number;

    // Not present in the confirmed contract as of this version — see
    // Blueprint §0 known gap. Always render an explicit "not available"
    // state for these rather than assuming a value.
    expenditure_amount?: number | null;
    utilization_percent?: number | null;
    physical_progress_percent?: number | null;
    delay_days?: number | null;

    investigation_priority_score: number;
    investigation_priority_level: PriorityLevel;
    // Widened intentionally to string as a defensive fallback for
    // real API responses, but PriorityLevel/SeverityLevel above stay
    // strict literal unions everywhere else — do not repeat this
    // pattern on fields we actually want typo-checked.
    case_status: CaseStatus | string;

    cost_anomaly: boolean;
    exact_duplicate_anomaly: boolean;
    near_duplicate_anomaly: boolean;
    pattern_anomaly: boolean;

    primary_detector: DetectorName;
    primary_signal: string;
    highest_severity: SeverityLevel;
    highest_severity_score: number;

    title: string;
    summary: string;
    disclaimer: string;

    // Project Explorer & Review Queue workflow attributes
    sanction_status?: "Sanctioned" | "Unsanctioned";
    review_status?: "Awaiting Review" | "Under Review" | "Verification Required" | "Reviewed" | "Closed";
    review_trigger?: "Cost deviation" | "Duplicate record" | "Near-duplicate record" | "Pattern deviation";

    evidence_count: number;
    evidence: Evidence[];

    related_exact_duplicates: RelatedRecord[];
    related_potentially_suspicious: RelatedRecord[];
    related_contextual_near_duplicates: RelatedRecord[];
}

export interface Pagination {
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
}

export interface Filters {
    priority?: PriorityLevel | null;
    detector?: DetectorName | null;
    severity?: SeverityLevel | null;
    state?: string | null;
    constituency?: string | null;
    mp_name?: string | null;
    work_type?: string | null;
    status?: string | null;
    sanction_status?: "Sanctioned" | "Unsanctioned" | null;
    review_status?: string | null;
    review_trigger?: string | null;
    min_score?: number | null;
    max_score?: number | null;
    search?: string | null;
    page?: number;
    page_size?: number;
    sort_by?: "rank" | "investigation_priority_score" | "allocation_amount" | "record_id";
    sort_order?: "asc" | "desc";
}

export interface CaseListResponse {
    data: InvestigationCase[];
    pagination: Pagination;
    filters: Filters;
}

export interface SingleCaseResponse {
    data: InvestigationCase;
}

// --- Case detail workspace (GET /cases/{record_id}/detail) ---
// Confirmed part of the real contract; not previously modeled.

export interface PeerBenchmark {
    status: "success" | "insufficient_data" | string;
    project_amount: number;
    peer_count: number;
    peer_median: number;
    peer_mean: number;
    amount_deviation_percent: number;
    amount_ratio_to_median: number;
    peer_group_level: string;
    peer_scope: string;
}

export interface RealityGap {
    reality_gap_status: "not_available" | string;
    explanation: string;
}

export interface IntegrityPassport {
    integrity_status: "RED" | "AMBER" | "GREEN" | string;
    integrity_score: number;
    signal_count: number;
    positive_signals: string[];
    risk_signals: string[];
    data_limitations: string[];
    explanation: string;
}

export interface PaymentGate {
    recommendation: "HOLD_AND_INSPECT" | "PROCEED" | string;
    reason: string;
    required_next_evidence: string[];
}

export interface CaseVerification {
    record_id: number;
    rank: number;
    peer_benchmark: PeerBenchmark;
    reality_gap: RealityGap;
    integrity_passport: IntegrityPassport;
    payment_gate: PaymentGate;
}

export interface CaseDetailResponse {
    case: InvestigationCase;
    project: Partial<InvestigationCase>;
    risk_summary: {
        priority_level: PriorityLevel;
        priority_score: number;
        severity: SeverityLevel;
        primary_detector: DetectorName;
        evidence_count: number;
        related_record_count: number;
    };
    primary_evidence: Evidence | Record<string, never>;
    evidence: {
        available: Evidence[];
        derived: Evidence[];
        missing: string[];
        stale: string[];
    };
    verification: CaseVerification;
    peer_benchmark: PeerBenchmark;
    integrity_passport: IntegrityPassport;
    payment_gate: PaymentGate;
    related_records: {
        exact_duplicates: RelatedRecord[];
        potentially_suspicious: RelatedRecord[];
        contextual: RelatedRecord[];
    };
    available_information: string[];
    missing_information: string[];
    disclaimer: string;
}

// --- Review / audit history ---
// Proposed to Veda, not yet backend-confirmed — see Blueprint §6.
// Frontend uses these against mock data until a real endpoint exists.

export type ReviewActionType =
    | "REQUEST_DOCUMENTS"
    | "ASSIGN_INSPECTION"
    | "MARK_DATA_QUALITY"
    | "DISMISS"
    | "ESCALATE"
    | "CLOSE";

export interface ReviewEvent {
    reviewer: string;
    action_type: ReviewActionType;
    timestamp: string;
    previous_status: CaseStatus;
    new_status: CaseStatus;
    comment: string;
    assignment_reference?: string | null;
    evidence_reference?: string | null;
}

export interface StatisticsScoreSummary {
    min: number;
    max: number;
    mean: number;
    median: number;
}

export interface StatisticsResponse {
    total_records: number;
    investigation_cases: number;
    priority_distribution: Record<PriorityLevel, number>;
    detector_distribution: Record<DetectorName, number>;
    score: StatisticsScoreSummary;
}
export interface HealthResponse {
    status: string;
    service: string;
    version: string;
    data_loaded: boolean;
}