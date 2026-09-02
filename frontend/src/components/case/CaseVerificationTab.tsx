"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Shield,
    AlertTriangle,
    FileText,
    Check,
    ExternalLink,
} from "@/components/shared/Icons";
import type { EnrichedCaseDetail } from "./demoCaseDetailAdapter";

interface CaseVerificationTabProps {
    data: EnrichedCaseDetail;
}

export const CaseVerificationTab: React.FC<CaseVerificationTabProps> = ({
    data,
}) => {
    const { case: project, integrity_passport, payment_gate } = data;
    const [officerDecision, setOfficerDecision] = useState<string>(payment_gate.recommendation);
    const [workflowStatus, setWorkflowStatus] = useState<string>("Under Active Scrutiny");

    const passportColor =
        integrity_passport.integrity_status === "RED"
            ? "bg-[#fff0e6] text-[#c2410c] border-[#fed7aa]"
            : integrity_passport.integrity_status === "AMBER"
            ? "bg-[#fff4df] text-[#a56a00] border-[#fde68a]"
            : "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]";

    return (
        <div className="space-y-6 pt-4">
            {/* Top Grid: Detailed Integrity Passport & Advisory Payment Gate */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section 9: Integrity Passport Detail */}
                <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#dfe3e8] pb-3">
                        <div className="flex items-center gap-2 text-[#172033]">
                            <Shield size={17} className="text-[#174a7e]" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">
                                Integrity Passport Evaluation
                            </h3>
                        </div>
                        <span
                            className={`px-2.5 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider border ${passportColor}`}
                        >
                            Evaluation: {integrity_passport.integrity_status}
                        </span>
                    </div>

                    <p className="text-xs text-[#536174] leading-relaxed">
                        {integrity_passport.explanation}
                    </p>

                    <div className="space-y-3 text-xs">
                        {/* Positive Signals */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-[#2f7d5a] uppercase tracking-wider block">
                                Verified Conformance Signals ({integrity_passport.positive_signals.length})
                            </span>
                            <div className="space-y-1">
                                {integrity_passport.positive_signals.map((sig, i) => (
                                    <div
                                        key={i}
                                        className="p-2 rounded-none bg-[#eaf5ef]/50 border border-[#bbf7d0] text-[#172033] flex items-start gap-1.5"
                                    >
                                        <Check size={13} className="text-[#2f7d5a] shrink-0 mt-0.5" />
                                        <span>{sig}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Risk Signals */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-[#c2410c] uppercase tracking-wider block">
                                Active Review Signals ({integrity_passport.risk_signals.length})
                            </span>
                            <div className="space-y-1">
                                {integrity_passport.risk_signals.map((sig, i) => (
                                    <div
                                        key={i}
                                        className="p-2 rounded-none bg-[#fff0e6]/50 border border-[#fed7aa] text-[#172033] flex items-start gap-1.5"
                                    >
                                        <AlertTriangle size={13} className="text-[#c2410c] shrink-0 mt-0.5" />
                                        <span>{sig}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Data Limitations */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                                Monitored Data Boundaries
                            </span>
                            <div className="p-2.5 rounded-none bg-[#f1f3f6] border border-[#dfe3e8] text-[11px] text-[#536174] space-y-1">
                                {integrity_passport.data_limitations.map((lim, i) => (
                                    <div key={i}>• {lim}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 10: Advisory Payment Gate Decision Control */}
                <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#dfe3e8] pb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
                            Advisory Payment Gate Decision
                        </h3>
                        <span className="text-[10px] font-mono text-[#536174]">
                            Human-in-the-Loop Control
                        </span>
                    </div>

                    <div className="p-3 rounded-none bg-[#fafbfc] border border-[#dfe3e8] space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-[#536174] uppercase block tracking-wider">
                            Automated Advisory Recommendation
                        </span>
                        <p className="font-bold text-sm text-[#172033]">
                            {payment_gate.recommendation.replace(/_/g, " ")}
                        </p>
                        <p className="text-[#536174]">{payment_gate.reason}</p>
                    </div>

                    {/* Officer Decision Options */}
                    <div className="space-y-2 text-xs">
                        <label className="font-bold text-[#172033] block">
                            Record Officer Gate Determination:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { val: "HOLD_AND_INSPECT", label: "Hold & Inspect", color: "hover:border-[#fed7aa]" },
                                { val: "VERIFY", label: "Desk Scrutiny", color: "hover:border-[#fde68a]" },
                                { val: "PROCEED", label: "Clear to Proceed", color: "hover:border-[#bbf7d0]" },
                            ].map((opt) => (
                                <button
                                    key={opt.val}
                                    type="button"
                                    onClick={() => setOfficerDecision(opt.val)}
                                    className={`p-2.5 rounded-none text-xs font-bold border text-center transition ${opt.color} ${
                                        officerDecision === opt.val
                                            ? "bg-[#174a7e] text-white border-[#174a7e]"
                                            : "bg-[#fafbfc] text-[#172033] border-[#dfe3e8]"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Officer Workflow Actions */}
                    <div className="space-y-2 text-xs pt-2 border-t border-[#dfe3e8]">
                        <span className="font-bold text-[#172033] block">
                            Update Case Workflow Status:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "Mark Under Review",
                                "Request Evidence",
                                "Record Verification",
                                "Escalate to DPO",
                                "Mark Reviewed",
                                "Close Case",
                            ].map((action) => (
                                <button
                                    key={action}
                                    type="button"
                                    onClick={() => setWorkflowStatus(action)}
                                    className={`px-3 py-1.5 rounded-none text-[11px] font-bold border transition ${
                                        workflowStatus === action
                                            ? "bg-[#174a7e] text-white border-[#174a7e]"
                                            : "bg-[#f1f3f6] text-[#172033] border-[#dfe3e8] hover:bg-[#e8f0f8]"
                                    }`}
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                        <span className="text-[11px] text-[#2f7d5a] font-semibold block mt-1">
                            Current Status: {workflowStatus}
                        </span>
                    </div>

                    <p className="text-[10px] text-[#536174] italic leading-tight">
                        * The Payment Gate is an advisory verification control. Final action remains with the authorized officer.
                    </p>
                </div>
            </div>

            {/* Section 15: Neutral Verification Brief Preview */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dfe3e8] pb-3">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-[#172033]">
                            <FileText size={17} className="text-[#174a7e]" />
                            <h3 className="text-sm font-bold uppercase tracking-wider">
                                Neutral Verification Brief (Summary Content)
                            </h3>
                        </div>
                        <p className="text-xs text-[#536174]">
                            Structured factual summary generated for administrative oversight.
                        </p>
                    </div>

                    <Link
                        href="/reports"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#174a7e] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition"
                    >
                        <span>Formal Reports &amp; PDF Export</span>
                        <ExternalLink size={13} />
                    </Link>
                </div>

                {/* Brief Document Container */}
                <div className="p-4 rounded-none bg-[#fafbfc] border border-[#dfe3e8] space-y-3 text-xs">
                    <div className="border-b border-[#dfe3e8] pb-2 flex justify-between items-center text-[11px]">
                        <span className="font-mono font-bold text-[#174a7e]">
                            VERIFICATION BRIEF: REC-{String(project.record_id).padStart(5, "0")}
                        </span>
                        <span className="text-[#536174]">
                            Scheme: MPLADS · MoSPI Oversight
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                            <strong className="text-[#172033]">Project Title:</strong> {project.work || project.title}
                        </div>
                        <div>
                            <strong className="text-[#172033]">Location:</strong> {project.constituency}, {project.state}
                        </div>
                        <div>
                            <strong className="text-[#172033]">Sanctioned Allocation:</strong> ₹{((project.allocation_amount || 0) / 100000).toFixed(2)} Lakhs
                        </div>
                        <div>
                            <strong className="text-[#172033]">Representative:</strong> {project.mp_name || "—"}
                        </div>
                    </div>

                    <div className="p-3 rounded-none bg-white border border-[#dfe3e8] space-y-1">
                        <strong className="text-[#172033] block text-[11px] uppercase tracking-wider">
                            Review Basis &amp; Observed Indicators:
                        </strong>
                        <p className="text-[#536174] leading-relaxed">
                            {project.primary_signal ||
                                `Project exhibits cost deviation (+${data.peer_benchmark.amount_deviation_percent}% relative to peer median) and documentation freshness gap. Verification recommended against District Schedule of Rates and on-site Measurement Book entries.`}
                        </p>
                    </div>

                    <div className="p-2.5 rounded-none bg-[#f1f3f6] border border-[#dfe3e8] text-[10px] text-[#536174] italic">
                        <strong>Mandatory Governance Disclaimer:</strong> Risk indicators support human verification and do not constitute proof of fraud, misconduct, or guilt. Final determination rests with the competent inquiry authority.
                    </div>
                </div>
            </div>
        </div>
    );
};
