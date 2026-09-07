"use client";

export interface FormalReportItem {
    id: string;
    report_number: string;
    title: string;
    report_type: "Verification Brief" | "Investigation Dossier" | "District Audit Summary" | "Quarterly Compliance";
    project_id?: number;
    project_title?: string;
    constituency?: string;
    state?: string;
    mp_name?: string;
    sanctioned_amount?: number;
    generated_date: string;
    last_updated: string;
    status: "Certified" | "Under Review" | "Draft" | "Archived";
    author: string;
    summary: string;
    recommendations: string[];
    risk_level?: "HIGH" | "MEDIUM" | "LOW";
    observed_signals?: string[];
}

export interface DataIntakeRecord {
    id: string;
    file_name: string;
    file_type: "CSV" | "Excel (.xlsx)" | "Excel (.xls)" | "PDF Sanction Order";
    file_size_kb: number;
    uploaded_on: string;
    total_records: number;
    valid_records: number;
    warnings_count: number;
    schema_status: "100% Compliant" | "Compliant with Warnings" | "Schema Mismatch";
    processing_status: "Ready for Review" | "Ingested" | "Validating" | "Failed";
    target_registry: string;
    notes: string;
}

export interface SubmissionItem {
    id: string;
    submission_type: "Data Intake" | "Report Data Issue" | "Give Feedback" | "Formal Report Archive";
    subject: string;
    submitted_on: string;
    last_updated: string;
    status: "Logged / Awaiting Review" | "Under Review" | "Processed" | "Acknowledged" | "Action Taken";
    submitter: string;
    contact_email?: string | undefined;
    details: {
        [key: string]: any;
    };
}

// Initial seed data for Formal Reports
export const INITIAL_FORMAL_REPORTS: FormalReportItem[] = [
    {
        id: "RPT-2026-001",
        report_number: "VB-REC-00001",
        title: "Verification Brief: Community Hall & Training Infrastructure",
        report_type: "Verification Brief",
        project_id: 1,
        project_title: "Construction of Community Hall and Skill Training Center at Ward 12",
        constituency: "North District",
        state: "State Sector A",
        mp_name: "Representative S. Kumar",
        sanctioned_amount: 4500000,
        generated_date: "2026-08-28 11:30 IST",
        last_updated: "2026-08-30 16:45 IST",
        status: "Certified",
        author: "Audit Officer OFF-10234",
        summary: "Detailed documentary verification brief confirming variance (+34.2%) relative to district benchmark schedules. On-site measurement sheet requested from Executive Engineer.",
        recommendations: [
            "Obtain certified Measurement Book (MB) page copies for foundation concrete work.",
            "Verify cement and rebar itemized rates against District Schedule of Rates (DSR 2024-25).",
            "Hold subsequent milestone tranche release pending physical verification sign-off."
        ],
        risk_level: "HIGH",
        observed_signals: [
            "Cost deviation above peer median for standard community hall infrastructure.",
            "Documentation staleness: No updated physical progress certificate recorded in 60+ days."
        ]
    },
    {
        id: "RPT-2026-002",
        report_number: "INV-REC-00002",
        title: "Investigation Dossier: Solar High-Mast Lighting Cluster",
        report_type: "Investigation Dossier",
        project_id: 2,
        project_title: "Installation of 12.5m Solar High-Mast LED Lighting Units (Phase II)",
        constituency: "Central East",
        state: "State Sector B",
        mp_name: "Representative P. Sharma",
        sanctioned_amount: 2800000,
        generated_date: "2026-08-25 14:15 IST",
        last_updated: "2026-08-29 09:20 IST",
        status: "Certified",
        author: "Audit Officer OFF-10234",
        summary: "Investigation into itemized luminary procurement costs and batch warranty certifications across 8 village nodal junctions.",
        recommendations: [
            "Cross-verify GST e-invoices with the central tax portal for luminary vendors.",
            "Inspect GPS-tagged time-stamped night illumination photographs."
        ],
        risk_level: "MEDIUM",
        observed_signals: [
            "Vendor unit rate deviates +18% from standardized state tender rate contracts."
        ]
    },
    {
        id: "RPT-2026-003",
        report_number: "DAS-DIST-2026",
        title: "District Audit Summary: Public Works & Sanitation Allocation Oversight",
        report_type: "District Audit Summary",
        constituency: "District Nodal Range IV",
        state: "State Sector A",
        sanctioned_amount: 32500000,
        generated_date: "2026-08-15 10:00 IST",
        last_updated: "2026-08-20 17:00 IST",
        status: "Archived",
        author: "Superintending Officer OFF-10002",
        summary: "Quarterly multi-project synthesis across 42 developmental public works recommended under MPLADS scheme guidelines.",
        recommendations: [
            "Standardize physical completion reporting format across all block development offices.",
            "Mandate digital measurement entry prior to contractor final billing."
        ],
        risk_level: "LOW",
        observed_signals: [
            "General timeline adherence with minor reporting lag in 4 rural work packages."
        ]
    }
];

// Initial seed data for Data Intake History
export const INITIAL_DATA_INTAKES: DataIntakeRecord[] = [
    {
        id: "INT-2026-089",
        file_name: "MPLADS_Sanctions_FY2024_25_Batch4.xlsx",
        file_type: "Excel (.xlsx)",
        file_size_kb: 342.5,
        uploaded_on: "2026-08-31 15:40 IST",
        total_records: 120,
        valid_records: 118,
        warnings_count: 2,
        schema_status: "Compliant with Warnings",
        processing_status: "Ready for Review",
        target_registry: "Active MPLADS Works Corpus",
        notes: "2 records flagged for missing optional block development codes; primary financial schema fully valid."
    },
    {
        id: "INT-2026-088",
        file_name: "District_Public_Works_Sanctions_Q1.csv",
        file_type: "CSV",
        file_size_kb: 184.2,
        uploaded_on: "2026-08-22 11:20 IST",
        total_records: 74,
        valid_records: 74,
        warnings_count: 0,
        schema_status: "100% Compliant",
        processing_status: "Ingested",
        target_registry: "District Benchmark Registry",
        notes: "All 24 fields validated with 0 schema variances."
    },
    {
        id: "INT-2026-087",
        file_name: "Sanction_Order_PWD_WaterSupply_2026.pdf",
        file_type: "PDF Sanction Order",
        file_size_kb: 1420.0,
        uploaded_on: "2026-08-10 09:15 IST",
        total_records: 18,
        valid_records: 18,
        warnings_count: 0,
        schema_status: "100% Compliant",
        processing_status: "Ingested",
        target_registry: "Verified Sanction Archive",
        notes: "PDF OCR extracted 18 line items with authenticated digital signatures."
    }
];

// Initial seed data for Submissions Log
export const INITIAL_SUBMISSIONS: SubmissionItem[] = [
    {
        id: "SUB-2026-042",
        submission_type: "Report Data Issue",
        subject: "REC-00045: Outdated Physical Progress Metric in Portal",
        submitted_on: "2026-08-30 14:22 IST",
        last_updated: "2026-08-31 10:15 IST",
        status: "Under Review",
        submitter: "Audit Officer OFF-10234",
        contact_email: "audit.officer@mospi.gov.in",
        details: {
            issueType: "Outdated Data",
            projectId: "REC-00045",
            mpName: "Representative M. Roy",
            location: "Kolkata North, West Bengal",
            expectedValue: "Physical Progress: 85% (MB Stage III signed on 12/08/2026)",
            currentValue: "Physical Progress: 40% (Outdated baseline)",
            description: "Site inspection confirmed structural slab casting completed. Portal record lags actual progress by 45 days."
        }
    },
    {
        id: "SUB-2026-041",
        submission_type: "Data Intake",
        subject: "Ingestion Batch: MPLADS_Sanctions_FY2024_25_Batch4.xlsx",
        submitted_on: "2026-08-31 15:40 IST",
        last_updated: "2026-08-31 15:42 IST",
        status: "Processed",
        submitter: "Data Management Officer",
        details: {
            fileName: "MPLADS_Sanctions_FY2024_25_Batch4.xlsx",
            recordsCount: 120,
            validRecords: 118,
            warnings: "2 records missing non-critical block codes."
        }
    },
    {
        id: "SUB-2026-040",
        submission_type: "Give Feedback",
        subject: "Peer Benchmark Range Filtering in Rate Schedule Explorer",
        submitted_on: "2026-08-26 16:50 IST",
        last_updated: "2026-08-28 11:00 IST",
        status: "Acknowledged",
        submitter: "Field Investigator",
        contact_email: "investigator.range@audit.gov.in",
        details: {
            category: "Usability & Navigation",
            title: "Peer Benchmark Range Filtering in Rate Schedule Explorer",
            description: "Requesting district-level multi-select dropdown in peer benchmark filter so neighboring district rate schedules can be compared concurrently."
        }
    },
    {
        id: "SUB-2026-039",
        submission_type: "Formal Report Archive",
        subject: "Archival Copy: Verification Brief VB-REC-00001",
        submitted_on: "2026-08-28 11:30 IST",
        last_updated: "2026-08-30 16:45 IST",
        status: "Action Taken",
        submitter: "Audit Officer OFF-10234",
        details: {
            reportNumber: "VB-REC-00001",
            projectId: "REC-00001",
            action: "Certified brief dispatched to Executive Engineer and archived in MoSPI Oversight Record."
        }
    }
];

// In-memory Store Singleton for the session
class ReportsStore {
    private formalReports: FormalReportItem[] = [...INITIAL_FORMAL_REPORTS];
    private dataIntakes: DataIntakeRecord[] = [...INITIAL_DATA_INTAKES];
    private submissions: SubmissionItem[] = [...INITIAL_SUBMISSIONS];
    private listeners: Array<() => void> = [];

    private notify() {
        this.listeners.forEach((l) => l());
    }

    public subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    public getFormalReports(): FormalReportItem[] {
        return [...this.formalReports];
    }

    public getDataIntakes(): DataIntakeRecord[] {
        return [...this.dataIntakes];
    }

    public getSubmissions(): SubmissionItem[] {
        return [...this.submissions];
    }

    public addDataIssue(data: {
        issueType: string;
        location: string;
        mpName: string;
        projectId: string;
        expectedValue: string;
        currentValue: string;
        description: string;
        contactEmail?: string | undefined;
    }): SubmissionItem {
        const id = `SUB-2026-${String(this.submissions.length + 43).padStart(3, "0")}`;
        const newSubmission: SubmissionItem = {
            id,
            submission_type: "Report Data Issue",
            subject: data.projectId ? `${data.projectId}: ${data.issueType} Report` : `${data.location || "District"}: ${data.issueType}`,
            submitted_on: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) + " IST",
            last_updated: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) + " IST",
            status: "Logged / Awaiting Review",
            submitter: "Authorized Audit Officer",
            contact_email: data.contactEmail,
            details: data,
        };

        this.submissions = [newSubmission, ...this.submissions];
        this.notify();
        return newSubmission;
    }

    public addFeedback(data: {
        category: string;
        title: string;
        description: string;
        contactEmail?: string | undefined;
    }): SubmissionItem {
        const id = `SUB-2026-${String(this.submissions.length + 43).padStart(3, "0")}`;
        const newSubmission: SubmissionItem = {
            id,
            submission_type: "Give Feedback",
            subject: data.title,
            submitted_on: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) + " IST",
            last_updated: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) + " IST",
            status: "Logged / Awaiting Review",
            submitter: "Authorized Audit Officer",
            contact_email: data.contactEmail,
            details: data,
        };

        this.submissions = [newSubmission, ...this.submissions];
        this.notify();
        return newSubmission;
    }

    public addDataIntake(file: {
        fileName: string;
        fileType: "CSV" | "Excel (.xlsx)" | "Excel (.xls)" | "PDF Sanction Order";
        fileSizeKb: number;
        recordsCount: number;
        validRecords: number;
        warningsCount: number;
        notes?: string;
    }): DataIntakeRecord {
        const id = `INT-2026-${String(this.dataIntakes.length + 90).padStart(3, "0")}`;
        const newIntake: DataIntakeRecord = {
            id,
            file_name: file.fileName,
            file_type: file.fileType,
            file_size_kb: file.fileSizeKb,
            uploaded_on: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) + " IST",
            total_records: file.recordsCount,
            valid_records: file.validRecords,
            warnings_count: file.warningsCount,
            schema_status: file.warningsCount === 0 ? "100% Compliant" : "Compliant with Warnings",
            processing_status: "Ready for Review",
            target_registry: "Active MPLADS Works Corpus",
            notes: file.notes || "Intake verified against MoSPI schema standards.",
        };

        this.dataIntakes = [newIntake, ...this.dataIntakes];

        // Also record in general Submissions log
        const subId = `SUB-2026-${String(this.submissions.length + 43).padStart(3, "0")}`;
        const newSub: SubmissionItem = {
            id: subId,
            submission_type: "Data Intake",
            subject: `Ingestion Batch: ${file.fileName}`,
            submitted_on: newIntake.uploaded_on,
            last_updated: newIntake.uploaded_on,
            status: "Processed",
            submitter: "Authorized Audit Officer",
            details: {
                fileName: file.fileName,
                recordsCount: file.recordsCount,
                validRecords: file.validRecords,
                warnings: file.warningsCount > 0 ? `${file.warningsCount} non-blocking schema warnings` : "Zero schema warnings",
            },
        };
        this.submissions = [newSub, ...this.submissions];

        this.notify();
        return newIntake;
    }
}

export const demoReportsStore = new ReportsStore();
