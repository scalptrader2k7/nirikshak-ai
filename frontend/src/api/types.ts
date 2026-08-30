export interface Evidence {
  detector: string;
  signal: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  formatted_message: string;
  value?: any;
  reference_value?: any;
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

  investigation_priority_score: number;
  investigation_priority_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  case_status: string;

  cost_anomaly: boolean;
  exact_duplicate_anomaly: boolean;
  near_duplicate_anomaly: boolean;
  pattern_anomaly: boolean;

  primary_detector: 'cost' | 'exact_duplicate' | 'near_duplicate' | 'pattern' | string;
  primary_signal: string;
  highest_severity: 'low' | 'medium' | 'high' | 'critical' | string;
  highest_severity_score: number;

  title: string;
  summary: string;
  disclaimer: string;

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
  priority?: string | null;
  detector?: string | null;
  severity?: string | null;
  state?: string | null;
  constituency?: string | null;
  mp_name?: string | null;
  work_type?: string | null;
  min_score?: number | null;
  max_score?: number | null;
  search?: string | null;
}

export interface CaseListResponse {
  data: InvestigationCase[];
  pagination: Pagination;
  filters: Filters;
}

export interface SingleCaseResponse {
  data: InvestigationCase;
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
  priority_distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
    [key: string]: number;
  };
  detector_distribution: {
    cost: number;
    exact_duplicate: number;
    near_duplicate: number;
    pattern: number;
    [key: string]: number;
  };
  score: StatisticsScoreSummary;
}

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  data_loaded: boolean;
}
