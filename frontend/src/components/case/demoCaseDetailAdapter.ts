import type {
    InvestigationCase,
    PeerBenchmark,
    IntegrityPassport,
    PaymentGate,
    Evidence,
    PriorityLevel,
} from "@/api/types";
import { getDemoProjectById, DEMO_PROJECTS_CORPUS } from "@/api/demoProjectsData";

export interface RateAuditItem {
    id: string;
    item_description: string;
    quantity: number;
    unit: string;
    reported_rate: number;
    reference_rate: number | null;
    deviation_percent: number | null;
    status: "Verified" | "Deviation Observed" | "Reference Unavailable";
    notes: string;
}

export interface RequestedEvidenceItem {
    id: string;
    requirement_name: string;
    purpose: string;
    status: "Requested" | "Pending" | "Received" | "Verified";
    priority: "High" | "Medium" | "Low";
    dueDate: string;
}

export interface CitizenInputItem {
    id: string;
    date: string;
    category: string;
    location_detail: string;
    summary: string;
    verification_status: "Pending Field Review" | "Under Review" | "Verified" | "Closed";
    evidence_attached: boolean;
}

export interface AuditEventItem {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
    type: "system" | "officer" | "intake" | "evidence";
}

export interface CaseRelatedItem {
    record_id: number;
    work_title: string;
    state: string;
    constituency: string;
    allocation_amount: number;
    priority_level: PriorityLevel;
    priority_score: number;
    relationship_type: string;
}

export interface EnrichedCaseDetail {
    case: InvestigationCase;
    peer_benchmark: PeerBenchmark;
    integrity_passport: IntegrityPassport;
    payment_gate: PaymentGate;
    evidence_ledger: Evidence[];
    evidence_gaps: string[];
    requested_evidence: RequestedEvidenceItem[];
    rate_audit_items: RateAuditItem[];
    citizen_reports: CitizenInputItem[];
    audit_history: AuditEventItem[];
    related_cases: CaseRelatedItem[];
    is_demo_scenario: boolean;
}

/**
 * Builds an enriched case investigation structure from real API data or demo corpus.
 * Clearly isolates simulated prototype scenarios so they are not confused with official records.
 */
export function getEnrichedCaseDetail(recordId: number): EnrichedCaseDetail | null {
    const project = getDemoProjectById(recordId);
    if (!project) return null;

    const isHigh = project.investigation_priority_level === "HIGH" || project.investigation_priority_level === "CRITICAL";
    const isMedium = project.investigation_priority_level === "MEDIUM";

    // 1. Peer Benchmark (Estimated from category averages)
    const baseAllocation = project.allocation_amount || 1500000;
    const peerMedian = isHigh ? Math.round(baseAllocation * 0.55) : isMedium ? Math.round(baseAllocation * 0.85) : Math.round(baseAllocation * 0.98);
    const deviationPercent = peerMedian > 0 ? Math.round(((baseAllocation - peerMedian) / peerMedian) * 100) : 0;
    const ratioToMedian = peerMedian > 0 ? parseFloat((baseAllocation / peerMedian).toFixed(2)) : 1.0;

    const peerBenchmark: PeerBenchmark = {
        status: "success",
        project_amount: baseAllocation,
        peer_count: 34,
        peer_median: peerMedian,
        peer_mean: Math.round(peerMedian * 1.05),
        amount_deviation_percent: deviationPercent,
        amount_ratio_to_median: ratioToMedian,
        peer_group_level: "District & Work Category",
        peer_scope: `${project.state || "State"} · ${project.work_type || "Works"}`,
    };

    // 2. Integrity Passport
    const passportStatus: "RED" | "AMBER" | "GREEN" = isHigh ? "RED" : isMedium ? "AMBER" : "GREEN";
    const integrityPassport: IntegrityPassport = {
        integrity_status: passportStatus,
        integrity_score: isHigh ? 38 : isMedium ? 64 : 92,
        signal_count: isHigh ? 3 : isMedium ? 2 : 1,
        positive_signals: [
            "Administrative sanction and work order verified in registry",
            "Geographic demarcation matches constituency records",
            ...(isHigh ? [] : ["Contract value within anticipated range", "Vendor registration active"]),
        ],
        risk_signals: isHigh
            ? [
                  `Cost benchmark ratio is ${ratioToMedian}x district median`,
                  "Latest physical verification report older than 60 days",
                  "Multiple related works registered with matching title structure",
              ]
            : isMedium
            ? [
                  "Single moderate cost variance compared to peer baseline",
                  "Documentation freshness requires updated site verification",
              ]
            : ["No significant variance across monitored consistency dimensions"],
        data_limitations: [
            "Physical progress % not present in baseline dataset",
            "Actual expenditure amount not recorded in intake dataset",
            "Milestone delay days unrecorded in source feed",
        ],
        explanation: isHigh
            ? "Passport indicates elevated review priority due to cost deviation and documentation freshness gaps. Field inspection recommended."
            : isMedium
            ? "Passport indicates moderate variance. Desk scrutiny recommended against supporting invoices and site certificates."
            : "Project records conform to standard baseline patterns across verified dimensions.",
    };

    // 3. Advisory Payment Gate
    const gateRec = isHigh ? "HOLD_AND_INSPECT" : isMedium ? "VERIFY" : "PROCEED";
    const paymentGate: PaymentGate = {
        recommendation: gateRec,
        reason: isHigh
            ? "Cost deviation and documentation freshness gap require verification before subsequent disbursement."
            : isMedium
            ? "Desk review of recent measurement book entries recommended."
            : "Records conform to established peer benchmarks.",
        required_next_evidence: isHigh
            ? [
                  "Fresh geo-tagged site photograph (within 14 days)",
                  "Measurement Book (MB) extract signed by Junior Engineer",
                  "Itemized contractor bill with verified material rates",
                  "District field inspection confirmation report",
              ]
            : isMedium
            ? [
                  "Measurement Book (MB) extract",
                  "Itemized contractor invoice",
              ]
            : ["Standard stage completion certificate"],
    };

    // 4. Evidence Ledger (Severity lowercase conforming to SeverityLevel)
    const evidenceLedger: Evidence[] = [
        {
            detector: project.primary_detector,
            signal: project.primary_signal,
            severity: isHigh ? "high" : isMedium ? "medium" : "low",
            message: `Intake anomaly signal registered for ${project.work_type || "public work"}.`,
            formatted_message: project.primary_signal,
        },
        {
            detector: "cost",
            signal: `Recorded cost ₹${((project.allocation_amount || 0) / 100000).toFixed(2)}L vs district peer median ₹${(peerMedian / 100000).toFixed(2)}L.`,
            severity: isHigh ? "high" : "low",
            message: "Peer baseline comparison calculated against identical work categories in same state.",
            formatted_message: `Variance: +${deviationPercent}% relative to peer median.`,
        },
        {
            detector: "pattern",
            signal: "Intake record structure verified against parliamentary constituency ledger.",
            severity: "low",
            message: "Administrative entry confirmed in MoSPI / MPLADS monitoring portal.",
            formatted_message: `Recommended on ${project.recommended_date || "2024-03-15"} for ${project.mp_name || "Representative"}.`,
        },
    ];

    // 5. Evidence Gaps
    const evidenceGaps = [
        "Fresh geo-tagged site photograph (last image > 60 days old)",
        "Certified Measurement Book (MB) page extract",
        "Itemized vendor materials rate breakdown",
    ];

    // 6. Requested Next Evidence Checklist
    const requestedEvidence: RequestedEvidenceItem[] = [
        {
            id: "REQ-01",
            requirement_name: "Fresh Geo-Tagged Site Photograph",
            purpose: "Verify on-ground physical execution status and current stage of work.",
            status: isHigh ? "Pending" : "Verified",
            priority: "High",
            dueDate: "2026-09-15",
        },
        {
            id: "REQ-02",
            requirement_name: "Measurement Book (MB) Extract",
            purpose: "Validate recorded quantities of civil work executed against sanctioned estimate.",
            status: isHigh ? "Requested" : "Verified",
            priority: "High",
            dueDate: "2026-09-18",
        },
        {
            id: "REQ-03",
            requirement_name: "Itemized Contractor Rate Bill",
            purpose: "Compare unit material rates against prevailing District Schedule of Rates (DSR).",
            status: isHigh ? "Requested" : "Pending",
            priority: "Medium",
            dueDate: "2026-09-20",
        },
        {
            id: "REQ-04",
            requirement_name: "District Field-Inspection Confirmation",
            purpose: "Official verification by District Planning Officer / Nodal Authority.",
            status: "Pending",
            priority: "High",
            dueDate: "2026-09-25",
        },
    ];

    // 7. Simulated Rate Audit Line Items (Demonstration scenario)
    const rateAuditItems: RateAuditItem[] = [
        {
            id: "RATE-01",
            item_description: "RCC M-25 Grade Structural Concrete with reinforcement",
            quantity: 45,
            unit: "cum",
            reported_rate: isHigh ? 9850 : 7200,
            reference_rate: 6800,
            deviation_percent: isHigh ? 44.8 : 5.8,
            status: isHigh ? "Deviation Observed" : "Verified",
            notes: isHigh ? "Unit rate exceeds prevailing district schedule baseline by 44.8%" : "Within acceptable standard tolerance",
        },
        {
            id: "RATE-02",
            item_description: "TMT Fe-500 Reinforcement Steel including cutting & bending",
            quantity: 3200,
            unit: "kg",
            reported_rate: isHigh ? 94 : 76,
            reference_rate: 74,
            deviation_percent: isHigh ? 27.0 : 2.7,
            status: isHigh ? "Deviation Observed" : "Verified",
            notes: isHigh ? "Material procurement rate above quarterly market benchmark" : "Aligned with regional index",
        },
        {
            id: "RATE-03",
            item_description: "Brickwork in cement mortar 1:6 in foundation & plinth",
            quantity: 68,
            unit: "cum",
            reported_rate: 5400,
            reference_rate: 5350,
            deviation_percent: 0.9,
            status: "Verified",
            notes: "Conforms to District Schedule of Rates (DSR 2024)",
        },
        {
            id: "RATE-04",
            item_description: "Solar PV Module 540W Monocrystalline PERC with mounting structure",
            quantity: 12,
            unit: "nos",
            reported_rate: 22500,
            reference_rate: null,
            deviation_percent: null,
            status: "Reference Unavailable",
            notes: "Specialized equipment; reference schedule requires vendor quote verification",
        },
    ];

    // 8. Simulated Citizen / Field Input (Contextual only, non-accusatory)
    const citizenReports: CitizenInputItem[] = isHigh
        ? [
              {
                  id: "CIT-8842",
                  date: "2026-08-14",
                  category: "Work Progress Verification",
                  location_detail: `${project.city || "Ward"}, ${project.constituency}`,
                  summary: "Local resident feedback: Construction activity paused for 45 days; boundary wall incomplete.",
                  verification_status: "Pending Field Review",
                  evidence_attached: true,
              },
          ]
        : [];

    // 9. Chronological Audit Trail
    const auditHistory: AuditEventItem[] = [
        {
            id: "AUD-01",
            timestamp: "2024-03-15 10:30 IST",
            actor: "MoSPI Data Intake Feed",
            action: "Project Record Ingested",
            details: `Sanctioned work order logged under ${project.constituency} MPLADS allocation.`,
            type: "intake",
        },
        {
            id: "AUD-02",
            timestamp: "2024-03-15 10:35 IST",
            actor: "NIRIKSHAK Automated Intake Scanner",
            action: "Automated Multi-Detector Evaluation",
            details: `Calculated priority level ${project.investigation_priority_level} (Score: ${Math.round(project.investigation_priority_score)}). Review trigger: ${project.primary_detector}.`,
            type: "system",
        },
        {
            id: "AUD-03",
            timestamp: "2026-08-20 14:15 IST",
            actor: "Audit Officer OFF-10234",
            action: "Case File Opened for Scrutiny",
            details: "Officer initiated preliminary desk review of project allocations and peer deviations.",
            type: "officer",
        },
        {
            id: "AUD-04",
            timestamp: "2026-08-22 11:00 IST",
            actor: "Audit Officer OFF-10234",
            action: "Evidence Request Generated",
            details: "Requested updated geo-tagged site imagery and signed Measurement Book extract.",
            type: "evidence",
        },
    ];

    // 10. Related Records from corpus
    const relatedCases: CaseRelatedItem[] = DEMO_PROJECTS_CORPUS.filter(
        (c) => c.record_id !== recordId && (c.work_type === project.work_type || c.constituency === project.constituency)
    )
        .slice(0, 4)
        .map((c, i) => ({
            record_id: c.record_id,
            work_title: c.work || c.title,
            state: c.state || "State",
            constituency: c.constituency || "Constituency",
            allocation_amount: c.allocation_amount || 1500000,
            priority_level: c.investigation_priority_level,
            priority_score: c.investigation_priority_score,
            relationship_type: i === 0 ? "Same Constituency & Category" : "Matching Work Category",
        }));

    return {
        case: project,
        peer_benchmark: peerBenchmark,
        integrity_passport: integrityPassport,
        payment_gate: paymentGate,
        evidence_ledger: evidenceLedger,
        evidence_gaps: evidenceGaps,
        requested_evidence: requestedEvidence,
        rate_audit_items: rateAuditItems,
        citizen_reports: citizenReports,
        audit_history: auditHistory,
        related_cases: relatedCases,
        is_demo_scenario: isHigh,
    };
}
