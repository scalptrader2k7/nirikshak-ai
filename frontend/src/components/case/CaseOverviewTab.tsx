"use client";

import React from "react";
import Link from "next/link";
import {
    AlertTriangle,
    Shield,
    CheckCircle,
    Info,
    ArrowRight,
    FileText,
} from "@/components/shared/Icons";
import type { EnrichedCaseDetail } from "./demoCaseDetailAdapter";

interface CaseOverviewTabProps {
    data: EnrichedCaseDetail;
    onNavigateTab: (tab: "analysis" | "evidence" | "verification") => void;
}

export const CaseOverviewTab: React.FC<CaseOverviewTabProps> = ({
    data,
    onNavigateTab,
}) => {
    const { case: project, integrity_passport, payment_gate } = data;
    const isHigh = project.investigation_priority_level === "HIGH" || project.investigation_priority_level === "CRITICAL";
    const isMedium = project.investigation_priority_level === "MEDIUM";

    const riskBadge = isHigh
        ? { label: "High Risk", bg: "bg-[#fff0e6]", text: "text-[#c2410c]", border: "border-[#fed7aa]" }
        : isMedium
        ? { label: "Medium Risk", bg: "bg-[#fff4df]", text: "text-[#a56a00]", border: "border-[#fde68a]" }
        : { label: "Low Risk", bg: "bg-[#eaf5ef]", text: "text-[#2f7d5a]", border: "border-[#bbf7d0]" };

    const passportColor =
        integrity_passport.integrity_status === "RED"
            ? "bg-[#fff0e6] text-[#c2410c] border-[#fed7aa]"
            : integrity_passport.integrity_status === "AMBER"
            ? "bg-[#fff4df] text-[#a56a00] border-[#fde68a]"
            : "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]";

    const gateColor =
        payment_gate.recommendation === "HOLD_AND_INSPECT"
            ? "bg-[#fff0e6] text-[#c2410c] border-[#fed7aa]"
            : payment_gate.recommendation === "VERIFY"
            ? "bg-[#fff4df] text-[#a56a00] border-[#fde68a]"
            : "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]";

    return (
        <div className="space-y-6 pt-4">
            {/* Top Grid: Review Basis & Risk Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Why Review Is Recommended / Review Basis */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section 3: Review Basis */}
                    <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-[#dfe3e8] pb-3">
                            <div className="flex items-center gap-2 text-[#172033]">
                                <AlertTriangle size={17} className={isHigh ? "text-[#c2410c]" : "text-[#a56a00]"} />
                                <h2 className="text-sm font-bold uppercase tracking-wider">
                                    Why Review Is Recommended (Review Basis)
                                </h2>
                            </div>
                            <span className="text-[11px] font-mono text-[#536174]">
                                Primary Trigger: {project.primary_detector || "General Anomaly"}
                            </span>
                        </div>

                        {/* Structured 3-Part Investigation Framework */}
                        <div className="space-y-3.5 text-xs">
                            <div className="p-3.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8] space-y-1">
                                <span className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                                    1. What Was Observed
                                </span>
                                <p className="text-[#172033] font-medium leading-relaxed">
                                    {project.primary_signal ||
                                        `Recorded project allocation of ₹${((project.allocation_amount || 0) / 100000).toFixed(2)}L exhibits variance relative to comparable ${project.work_type || "public work"} baselines in ${project.constituency || "district"}.`}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8] space-y-1">
                                <span className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                                    2. Why It Matters
                                </span>
                                <p className="text-[#172033] font-medium leading-relaxed">
                                    Substantial cost deviation or documentation staleness without certified site verification may indicate non-conformance with prevailing rate schedules or milestone reporting gaps.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-none bg-[#e8f0f8]/40 border border-[#c8ced6] space-y-1">
                                <span className="text-[10px] font-bold text-[#174a7e] uppercase tracking-wider block">
                                    3. Recommended Verification Action
                                </span>
                                <p className="text-[#172033] font-medium leading-relaxed">
                                    Verify detailed measurement sheets (MB extracts), check line-item material unit rates against District Schedule of Rates (DSR), and inspect fresh geo-tagged site imagery.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs border-t border-[#dfe3e8]">
                            <span className="text-[11px] text-[#536174] italic">
                                * Decision aid for authorized human officer; does not constitute finding of wrongdoing.
                            </span>
                            <button
                                type="button"
                                onClick={() => onNavigateTab("analysis")}
                                className="inline-flex items-center gap-1 font-bold text-[#174a7e] hover:underline"
                            >
                                <span>Detailed Rate &amp; Peer Analysis</span>
                                <ArrowRight size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Section 4: High-Level Financial & Progress Snapshot */}
                    <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#172033] border-b border-[#dfe3e8] pb-3">
                            Project Execution &amp; Financial Snapshot
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                                <span className="text-[10px] font-bold text-[#536174] block uppercase tracking-wider">
                                    Sanctioned Amount
                                </span>
                                <span className="font-mono font-black text-sm text-[#174a7e] mt-1 block">
                                    {project.allocation_amount
                                        ? `₹${(project.allocation_amount / 100000).toFixed(2)} L`
                                        : "₹—"}
                                </span>
                                <span className="text-[10px] text-[#2f7d5a] font-semibold mt-1 block">
                                    ✓ Verified in Registry
                                </span>
                            </div>

                            <div className="p-3 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                                <span className="text-[10px] font-bold text-[#536174] block uppercase tracking-wider">
                                    Expenditure Recorded
                                </span>
                                <span className="font-mono font-bold text-xs text-[#536174] mt-1 block">
                                    Not in dataset
                                </span>
                                <span className="text-[10px] text-[#a56a00] font-semibold mt-1 block">
                                    Requires Source Feed
                                </span>
                            </div>

                            <div className="p-3 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                                <span className="text-[10px] font-bold text-[#536174] block uppercase tracking-wider">
                                    Physical Progress %
                                </span>
                                <span className="font-mono font-bold text-xs text-[#536174] mt-1 block">
                                    Not in dataset
                                </span>
                                <span className="text-[10px] text-[#a56a00] font-semibold mt-1 block">
                                    Requires Site MB Extract
                                </span>
                            </div>

                            <div className="p-3 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                                <span className="text-[10px] font-bold text-[#536174] block uppercase tracking-wider">
                                    Milestone Delay Days
                                </span>
                                <span className="font-mono font-bold text-xs text-[#536174] mt-1 block">
                                    Not in dataset
                                </span>
                                <span className="text-[10px] text-[#536174] font-semibold mt-1 block">
                                    Milestones Unrecorded
                                </span>
                            </div>
                        </div>

                        {/* Honest Data Disclosure */}
                        <div className="flex items-start gap-2 p-3 rounded-none bg-[#f1f3f6] border border-[#dfe3e8] text-[11px] text-[#536174]">
                            <Info size={14} className="text-[#174a7e] shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                                <strong>Data Contract Integrity:</strong> NIRIKSHAK strictly presents available administrative records without manufacturing unverified expenditure or completion metrics.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Integrity Passport & Advisory Payment Gate */}
                <div className="space-y-6">
                    {/* Section 9: Integrity Passport Summary */}
                    <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-[#dfe3e8] pb-3">
                            <div className="flex items-center gap-2 text-[#172033]">
                                <Shield size={16} className="text-[#174a7e]" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">
                                    Integrity Passport
                                </h3>
                            </div>
                            <span
                                className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider border ${passportColor}`}
                            >
                                Status: {integrity_passport.integrity_status}
                            </span>
                        </div>

                        <p className="text-xs text-[#536174] leading-relaxed">
                            {integrity_passport.explanation}
                        </p>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                                <span className="text-[#536174]">Positive Conformance Signals:</span>
                                <span className="font-bold text-[#2f7d5a]">
                                    {integrity_passport.positive_signals.length} verified
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                                <span className="text-[#536174]">Active Review Triggers:</span>
                                <span className="font-bold text-[#c2410c]">
                                    {integrity_passport.risk_signals.length} flagged
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => onNavigateTab("verification")}
                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-[#174a7e] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition"
                        >
                            <span>Inspect Full Passport Dimensions</span>
                            <ArrowRight size={13} />
                        </button>
                    </div>

                    {/* Section 10: Advisory Payment Gate */}
                    <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-[#dfe3e8] pb-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
                                Advisory Payment Gate
                            </h3>
                            <span
                                className={`px-2.5 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider border ${gateColor}`}
                            >
                                {payment_gate.recommendation.replace(/_/g, " ")}
                            </span>
                        </div>

                        <div className="space-y-2 text-xs">
                            <p className="text-[#172033] font-medium leading-relaxed">
                                {payment_gate.reason}
                            </p>
                            <div className="p-2.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8] space-y-1">
                                <span className="text-[10px] font-bold text-[#536174] uppercase block tracking-wider">
                                    Next Required Verification Step:
                                </span>
                                <span className="text-xs font-semibold text-[#174a7e] block">
                                    {payment_gate.required_next_evidence[0] || "Standard stage completion certificate"}
                                </span>
                            </div>
                        </div>

                        <p className="text-[10px] text-[#536174] italic leading-tight">
                            * The Payment Gate is an advisory verification control. Final action remains with the authorized officer.
                        </p>
                    </div>

                    {/* Investigation Ranking Score Note */}
                    {project.investigation_priority_score !== undefined && (
                        <div className="rounded-lg border border-[#dfe3e8] bg-[#fafbfc] p-4 text-xs space-y-1.5 text-[#536174]">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#536174]">
                                    Review Priority Index
                                </span>
                                <span className="font-mono font-bold text-xs text-[#172033]">
                                    {Math.round(project.investigation_priority_score)} / 100
                                </span>
                            </div>
                            <p className="text-[11px] leading-tight">
                                Relative ranking score to assist officer review prioritization across the scheme corpus. Not a probability metric.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
