import React from "react";
import Link from "next/link";
import {
    X,
    AlertTriangle,
    ArrowRight,
    Info,
} from "@/components/shared/Icons";
import type { InvestigationCase, PriorityLevel } from "@/api/types";

interface ProjectQuickDetailsModalProps {
    project: InvestigationCase | null;
    onClose: () => void;
}

function getPriorityBadge(level: PriorityLevel) {
    switch (level) {
        case "HIGH":
        case "CRITICAL":
            return {
                label: "High Risk",
                bg: "bg-[#fff0e6]",
                text: "text-[#c2410c]",
                border: "border-[#fed7aa]",
            };
        case "MEDIUM":
            return {
                label: "Medium Risk",
                bg: "bg-[#fff4df]",
                text: "text-[#a56a00]",
                border: "border-[#fde68a]",
            };
        case "LOW":
        default:
            return {
                label: "Low Risk",
                bg: "bg-[#eaf5ef]",
                text: "text-[#2f7d5a]",
                border: "border-[#bbf7d0]",
            };
    }
}

function getFlaggedReasonLabel(detector: string) {
    switch (detector) {
        case "cost":
            return "Cost anomaly";
        case "exact_duplicate":
            return "Exact duplicate";
        case "near_duplicate":
            return "Near duplicate";
        case "pattern":
        default:
            return "Pattern anomaly";
    }
}

export const ProjectQuickDetailsModal: React.FC<ProjectQuickDetailsModalProps> = ({
    project,
    onClose,
}) => {
    if (!project) return null;

    const badge = getPriorityBadge(project.investigation_priority_level);
    const reasonLabel = getFlaggedReasonLabel(project.primary_detector);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071524]/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[#d8d4ca] bg-white shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#ece7dc] bg-[#fbfaf8] sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#102d49]/10 text-[#102d49] font-mono font-bold text-xs">
                            REC
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#102d49] text-sm">
                                    REC-{String(project.record_id).padStart(5, "0")}
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                                >
                                    {badge.label}
                                </span>
                            </div>
                            <span className="text-[11px] text-[#687487] font-medium">
                                Fast Scrutiny Card · MPLADS Public Works
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-[#687487] hover:text-[#102d49] hover:bg-black/5 rounded-md transition cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5 text-xs">
                    {/* Project Title & Category */}
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#687487]">
                            Work Description &amp; Classification
                        </span>
                        <h3 className="text-base font-bold text-[#17263a] mt-1 leading-snug">
                            {project.work || project.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-[#f4f2ec] border border-[#d8d4ca] px-2 py-0.5 rounded text-[11px] font-semibold text-[#17263a]">
                                Category: {project.work_type || "Infrastructure"}
                            </span>
                            <span className="bg-[#f4f2ec] border border-[#d8d4ca] px-2 py-0.5 rounded text-[11px] font-semibold text-[#17263a]">
                                Sanction Date: {project.recommended_date || "2024-03-15"}
                            </span>
                            <span className="bg-[#f4f2ec] border border-[#d8d4ca] px-2 py-0.5 rounded text-[11px] font-semibold text-[#17263a]">
                                Status: {project.case_status || "OPEN"}
                            </span>
                        </div>
                    </div>

                    {/* Flagged Reason Box */}
                    <div className="rounded-lg border border-[#fed7aa] bg-[#fffaf5] p-4 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[#c2410c] font-bold text-xs">
                            <AlertTriangle size={14} />
                            <span>Flagged Reason: {reasonLabel}</span>
                        </div>
                        <p className="text-xs text-[#17263a] leading-relaxed">
                            {project.primary_signal || project.summary}
                        </p>
                    </div>

                    {/* Grid: Financial Metrics & Honest Data Limitation Notice */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-lg bg-[#fbfaf8] border border-[#ece7dc]">
                            <span className="text-[10px] font-bold text-[#687487] block uppercase">
                                Sanctioned Amount
                            </span>
                            <span className="font-mono font-black text-sm text-[#102d49] mt-0.5 block">
                                {project.allocation_amount
                                    ? `₹${(project.allocation_amount / 100000).toFixed(2)} L`
                                    : "₹—"}
                            </span>
                            <span className="text-[9px] text-[#2f7d5a] font-semibold">
                                Confirmed on Record
                            </span>
                        </div>

                        <div className="p-3 rounded-lg bg-[#fbfaf8] border border-[#ece7dc]">
                            <span className="text-[10px] font-bold text-[#687487] block uppercase">
                                Expenditure
                            </span>
                            <span className="font-mono text-xs text-[#8e897e] mt-0.5 block">
                                Not recorded
                            </span>
                            <span className="text-[9px] text-[#8e897e]">In baseline dataset</span>
                        </div>

                        <div className="p-3 rounded-lg bg-[#fbfaf8] border border-[#ece7dc]">
                            <span className="text-[10px] font-bold text-[#687487] block uppercase">
                                Physical Progress
                            </span>
                            <span className="font-mono text-xs text-[#8e897e] mt-0.5 block">
                                Not recorded
                            </span>
                            <span className="text-[9px] text-[#8e897e]">Requires field audit</span>
                        </div>

                        <div className="p-3 rounded-lg bg-[#fbfaf8] border border-[#ece7dc]">
                            <span className="text-[10px] font-bold text-[#687487] block uppercase">
                                Audit Action Gate
                            </span>
                            <span
                                className={`font-mono font-bold text-xs mt-0.5 block ${
                                    project.investigation_priority_level === "HIGH" ||
                                    project.investigation_priority_level === "CRITICAL"
                                        ? "text-[#c2410c]"
                                        : project.investigation_priority_level === "MEDIUM"
                                        ? "text-[#a56a00]"
                                        : "text-[#2f7d5a]"
                                }`}
                            >
                                {project.investigation_priority_level === "HIGH" ||
                                project.investigation_priority_level === "CRITICAL"
                                    ? "HOLD & VERIFY"
                                    : project.investigation_priority_level === "MEDIUM"
                                    ? "DESK SCRUTINY"
                                    : "PROCEED"}
                            </span>
                            <span className="text-[9px] text-[#687487]">Decision support</span>
                        </div>
                    </div>

                    {/* Location & Representative Hierarchy */}
                    <div className="p-4 rounded-lg bg-[#fbfaf8] border border-[#ece7dc] space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#687487]">
                            Geographic Hierarchy &amp; Representation
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                            <div>
                                <span className="text-[#687487] block">State:</span>
                                <span className="font-bold text-[#17263a]">{project.state}</span>
                            </div>
                            <div>
                                <span className="text-[#687487] block">Constituency:</span>
                                <span className="font-bold text-[#17263a]">
                                    {project.constituency}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#687487] block">District / City:</span>
                                <span className="font-bold text-[#17263a]">
                                    {project.city || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#687487] block">MP Representative:</span>
                                <span className="font-bold text-[#17263a]">
                                    {project.mp_name}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#687487] block">Ward / Block:</span>
                                <span className="font-bold text-[#17263a]">
                                    {project.ward || project.block || "—"}
                                </span>
                            </div>
                            <div>
                                <span className="text-[#687487] block">Village / Locality:</span>
                                <span className="font-bold text-[#17263a]">
                                    {project.village || "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Legal Governance Notice */}
                    <div className="flex items-start gap-2 text-[11px] text-[#687487] bg-[#f4f2ec] p-3 rounded-lg border border-[#d8d4ca]">
                        <Info size={14} className="text-[#102d49] shrink-0 mt-0.5" />
                        <p>
                            <strong>Investigation Notice:</strong> Anomaly flags indicate statistical variance or similarity patterns for audit prioritization. Human audit officers determine official findings.
                        </p>
                    </div>
                </div>

                {/* Modal Footer with Drilldown CTA */}
                <div className="p-4 border-t border-[#ece7dc] bg-[#fbfaf8] flex items-center justify-between sticky bottom-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-2 text-xs font-bold text-[#536174] hover:text-[#17263a] rounded-lg cursor-pointer"
                    >
                        Close Scrutiny Card
                    </button>

                    <Link
                        href={`/projects/${project.record_id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#102d49] px-4 py-2 text-xs font-bold text-white hover:bg-[#173d61] shadow-xs cursor-pointer"
                    >
                        <span>OPEN FULL CASE FILE</span>
                        <ArrowRight size={13} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProjectQuickDetailsModal;
