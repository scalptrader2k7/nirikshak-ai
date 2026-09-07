import React from "react";
import Link from "next/link";
import {
    X,
    Shield,
    AlertTriangle,
    Check,
    ArrowRight,
    Info,
    FileText,
} from "@/components/shared/Icons";
import type { InvestigationCase } from "@/api/types";

interface IntegrityPassportModalProps {
    project: InvestigationCase | null;
    onClose: () => void;
}

export const IntegrityPassportModal: React.FC<IntegrityPassportModalProps> = ({
    project,
    onClose,
}) => {
    if (!project) return null;

    const isHigh = project.investigation_priority_level === "HIGH" || project.investigation_priority_level === "CRITICAL";
    const isMedium = project.investigation_priority_level === "MEDIUM";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071524]/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[#d8d4ca] bg-white shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#ece7dc] bg-[#fbfaf8] sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#102d49]/10 text-[#102d49]">
                            <Shield size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#102d49] text-sm">
                                    REC-{String(project.record_id).padStart(5, "0")}
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                        isHigh
                                            ? "bg-[#fff0e6] text-[#c2410c] border-[#fed7aa]"
                                            : isMedium
                                            ? "bg-[#fff4df] text-[#a56a00] border-[#fde68a]"
                                            : "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]"
                                    }`}
                                >
                                    {isHigh ? "High Risk Passport" : isMedium ? "Medium Risk Passport" : "Low Risk Passport"}
                                </span>
                            </div>
                            <span className="text-[11px] text-[#687487] font-medium">
                                Institutional Integrity Passport · MPLADS Oversight
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-[#687487] hover:text-[#17263a] hover:bg-black/5 rounded-md transition cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 text-xs">
                    {/* Project Title */}
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#687487]">
                            Public Work Description
                        </span>
                        <h3 className="text-base font-bold text-[#17263a] mt-1 leading-snug">
                            {project.work || project.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="bg-[#f4f2ec] border border-[#d8d4ca] px-2 py-0.5 rounded text-[11px] font-semibold text-[#17263a]">
                                MP: {project.mp_name || "Hon'ble MP"}
                            </span>
                            <span className="bg-[#f4f2ec] border border-[#d8d4ca] px-2 py-0.5 rounded text-[11px] font-semibold text-[#17263a]">
                                Constituency: {project.constituency}, {project.state}
                            </span>
                        </div>
                    </div>

                    {/* Review Trigger & Integrity Audit Summary */}
                    <div className="rounded-lg border border-[#fed7aa] bg-[#fffaf5] p-4 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[#c2410c] font-bold text-xs">
                            <AlertTriangle size={14} />
                            <span>Review Trigger: {project.review_trigger || "Cost deviation"}</span>
                        </div>
                        <p className="text-xs text-[#17263a] leading-relaxed">
                            {project.primary_signal || project.summary}
                        </p>
                    </div>

                    {/* Integrity Telemetry Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-[#fbfaf8] border border-[#ece7dc]">
                            <span className="text-[10px] font-bold text-[#687487] block uppercase">Allocated Amount</span>
                            <span className="font-mono font-black text-sm text-[#102d49] mt-0.5 block">
                                {project.allocation_amount
                                    ? `₹${(project.allocation_amount / 100000).toFixed(2)} L`
                                    : "₹—"}
                            </span>
                        </div>

                        <div className="p-3 rounded-lg bg-[#fbfaf8] border border-[#ece7dc]">
                            <span className="text-[10px] font-bold text-[#687487] block uppercase">Human Review Status</span>
                            <span className="font-bold text-xs text-[#17263a] mt-0.5 block">
                                {project.review_status || "Awaiting Review"}
                            </span>
                        </div>

                        <div className="p-3 rounded-lg bg-[#fbfaf8] border border-[#ece7dc]">
                            <span className="text-[10px] font-bold text-[#687487] block uppercase">Action Gate</span>
                            <span className="font-bold text-xs text-[#c2410c] mt-0.5 block">
                                {isHigh ? "HOLD & VERIFY" : isMedium ? "DESK SCRUTINY" : "PROCEED"}
                            </span>
                        </div>
                    </div>

                    {/* Verification Protocol Notice */}
                    <div className="flex items-start gap-2 text-[11px] text-[#687487] bg-[#f4f2ec] p-3.5 rounded-lg border border-[#d8d4ca]">
                        <Info size={15} className="text-[#102d49] shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            <strong>Integrity Protocol:</strong> The Integrity Passport provides an auditable snapshot of statistical risk indicators and data completeness checks. Official disbursement decisions require physical inspection by the District Authority.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[#ece7dc] bg-[#fbfaf8] flex items-center justify-between sticky bottom-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-2 text-xs font-bold text-[#536174] hover:text-[#17263a] rounded-lg cursor-pointer"
                    >
                        Close Passport
                    </button>

                    <Link
                        href={`/projects/${project.record_id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#102d49] px-4 py-2 text-xs font-bold text-white hover:bg-[#173d61] shadow-xs cursor-pointer"
                    >
                        <FileText size={13} />
                        <span>View Evidence Case File</span>
                        <ArrowRight size={13} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default IntegrityPassportModal;
