import { DEMO_PROJECTS_CORPUS } from "@/api/demoProjectsData";
import type { PriorityLevel } from "@/api/types";

export interface EvidenceRepositoryItem {
    id: string;
    title: string;
    evidence_type:
        | "Site Photograph"
        | "Measurement Book"
        | "Rate Schedule (DSR)"
        | "Contractor Invoice"
        | "Intake Anomaly Record"
        | "Duplicate Signature"
        | "Administrative Sanction";
    project_id: number;
    project_title: string;
    state: string;
    constituency: string;
    mp_name: string;
    work_type: string;
    sanctioned_amount: number;
    risk_level: PriorityLevel;
    date: string;
    freshness: "Fresh (<30d)" | "Moderate (30-60d)" | "Stale (>60d)" | "Unavailable";
    verification_status: "Verified" | "Pending" | "Requires Verification" | "Not Reviewed";
    source: string;
    document_ref: string;
    vendor_name: string;
    cross_case_count: number;
    traceability_notes: string;
}

// Generate a rich, cross-case repository of evidence items linked to real demo projects
export function getEvidenceRepositoryData(): EvidenceRepositoryItem[] {
    const items: EvidenceRepositoryItem[] = [];

    DEMO_PROJECTS_CORPUS.forEach((p, idx) => {
        const isHigh = p.investigation_priority_level === "HIGH" || p.investigation_priority_level === "CRITICAL";
        const isMedium = p.investigation_priority_level === "MEDIUM";

        // Evidence Item 1: Primary Intake / Anomaly Record
        items.push({
            id: `EVD-INT-${String(p.record_id).padStart(5, "0")}`,
            title: `Intake Evaluation: ${p.primary_detector.replace(/_/g, " ").toUpperCase()} Signal`,
            evidence_type: "Intake Anomaly Record",
            project_id: p.record_id,
            project_title: p.work || p.title,
            state: p.state || "State",
            constituency: p.constituency || "Constituency",
            mp_name: p.mp_name || "Representative",
            work_type: p.work_type || "Public Works",
            sanctioned_amount: p.allocation_amount || 1500000,
            risk_level: p.investigation_priority_level,
            date: p.recommended_date || "2024-03-15",
            freshness: "Moderate (30-60d)",
            verification_status: isHigh ? "Requires Verification" : isMedium ? "Pending" : "Verified",
            source: "MoSPI Intake Feed / MPLADS Portal",
            document_ref: `MPLAD-INT-${String(p.record_id).padStart(4, "0")}`,
            vendor_name: `Executing Agency Div-${(idx % 12) + 1}`,
            cross_case_count: (idx % 3) + 1,
            traceability_notes: `Primary detection signal: ${p.primary_signal || "Standard administrative record"}`,
        });

        // Evidence Item 2: Measurement Book / Site Document for subset
        if (idx % 2 === 0) {
            items.push({
                id: `EVD-MB-${String(p.record_id).padStart(5, "0")}`,
                title: `Measurement Book Extract (MB Vol ${((idx % 5) + 1)})`,
                evidence_type: "Measurement Book",
                project_id: p.record_id,
                project_title: p.work || p.title,
                state: p.state || "State",
                constituency: p.constituency || "Constituency",
                mp_name: p.mp_name || "Representative",
                work_type: p.work_type || "Public Works",
                sanctioned_amount: p.allocation_amount || 1500000,
                risk_level: p.investigation_priority_level,
                date: "2026-07-10",
                freshness: isHigh ? "Stale (>60d)" : "Moderate (30-60d)",
                verification_status: isHigh ? "Requires Verification" : "Verified",
                source: "District Engineering Division",
                document_ref: `MB-REC-${String(p.record_id).padStart(4, "0")}/24`,
                vendor_name: `Executing Agency Div-${(idx % 12) + 1}`,
                cross_case_count: 1,
                traceability_notes: "Certified quantity measurements submitted by Junior Engineer",
            });
        }

        // Evidence Item 3: Geo-Tagged Site Imagery for subset
        if (idx % 3 === 0) {
            items.push({
                id: `EVD-IMG-${String(p.record_id).padStart(5, "0")}`,
                title: `Geo-Tagged Progress Imagery (Stage ${(idx % 3) + 1})`,
                evidence_type: "Site Photograph",
                project_id: p.record_id,
                project_title: p.work || p.title,
                state: p.state || "State",
                constituency: p.constituency || "Constituency",
                mp_name: p.mp_name || "Representative",
                work_type: p.work_type || "Public Works",
                sanctioned_amount: p.allocation_amount || 1500000,
                risk_level: p.investigation_priority_level,
                date: "2026-08-01",
                freshness: isHigh ? "Stale (>60d)" : "Fresh (<30d)",
                verification_status: isHigh ? "Requires Verification" : "Verified",
                source: "Mobile Field Inspection App",
                document_ref: `IMG-GEO-${String(p.record_id).padStart(4, "0")}.jpg`,
                vendor_name: `Executing Agency Div-${(idx % 12) + 1}`,
                cross_case_count: isHigh ? 2 : 1,
                traceability_notes: "Visual site inspection verification with GPS coordinates embedded",
            });
        }
    });

    return items;
}
