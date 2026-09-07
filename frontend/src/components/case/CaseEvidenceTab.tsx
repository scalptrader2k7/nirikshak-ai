"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Database,
    AlertTriangle,
    ExternalLink,
} from "@/components/shared/Icons";
import type { EnrichedCaseDetail } from "./demoCaseDetailAdapter";

interface CaseEvidenceTabProps {
    data: EnrichedCaseDetail;
}

export const CaseEvidenceTab: React.FC<CaseEvidenceTabProps> = ({ data }) => {
    const { evidence_ledger, evidence_gaps, requested_evidence } = data;
    const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

    return (
        <div className="space-y-6 pt-4">
            {/* Section 7: Case-Specific Evidence Records */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dfe3e8] pb-3">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-[#172033]">
                            <Database size={17} className="text-[#174a7e]" />
                            <h2 className="text-sm font-bold uppercase tracking-wider">
                                Case Evidence Records (Attached Documentation)
                            </h2>
                        </div>
                        <p className="text-xs text-[#536174]">
                            Evidence records and detector observations attached specifically to this project case.
                        </p>
                    </div>

                    <Link
                        href="/evidence"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#174a7e] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition"
                    >
                        <span>Open in Evidence Report</span>
                        <ExternalLink size={13} />
                    </Link>
                </div>

                {/* Evidence Table with #174a7e Header */}
                <div className="overflow-x-auto border border-[#dfe3e8] rounded-none">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-[#174a7e] text-white">
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Detector Source
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Evidence Signal / Record
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Severity
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Observed Context
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dfe3e8] bg-white">
                            {evidence_ledger.map((item, idx) => {
                                const sev = (item.severity || "").toLowerCase();
                                const severityBadge =
                                    sev === "high" || sev === "critical"
                                        ? "bg-[#fff0e6] text-[#c2410c] border-[#fed7aa]"
                                        : sev === "medium"
                                        ? "bg-[#fff4df] text-[#a56a00] border-[#fde68a]"
                                        : "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]";

                                return (
                                    <tr key={idx} className="hover:bg-[#fafbfc] transition">
                                        <td className="py-2.5 px-3 font-mono font-bold text-[#174a7e] uppercase text-[11px]">
                                            {item.detector}
                                        </td>
                                        <td className="py-2.5 px-3 font-semibold text-[#172033] max-w-sm">
                                            {item.signal}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span
                                                className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border ${severityBadge}`}
                                            >
                                                {sev}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-[#536174] text-[11px]">
                                            {item.formatted_message || item.message}
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedEvidence(item.signal)}
                                                className="px-2.5 py-1 text-[11px] font-bold text-[#174a7e] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition cursor-pointer"
                                            >
                                                View Context
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {selectedEvidence && (
                    <div className="p-3.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-[#172033]">
                                Selected Evidence Detail
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedEvidence(null)}
                                className="text-[11px] font-bold text-[#536174] hover:text-[#172033] cursor-pointer"
                            >
                                ✕ Close
                            </button>
                        </div>
                        <p className="text-[#536174]">{selectedEvidence}</p>
                    </div>
                )}
            </div>

            {/* Evidence Gaps Warning */}
            <div className="rounded-lg border border-[#fed7aa] bg-[#fffaf5] p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#c2410c] font-bold text-sm">
                    <AlertTriangle size={16} />
                    <h3>Identified Evidence &amp; Verification Gaps</h3>
                </div>
                <p className="text-xs text-[#536174] leading-relaxed">
                    The following critical documentation items are missing or outdated in the primary intake stream:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {evidence_gaps.map((gap, idx) => (
                        <div
                            key={idx}
                            className="p-2.5 rounded-none bg-white border border-[#fed7aa] text-xs font-semibold text-[#172033]"
                        >
                            • {gap}
                        </div>
                    ))}
                </div>
            </div>

            {/* Section 8: Evidence Request / Required Next Verification Checklist */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dfe3e8] pb-3">
                    <div className="space-y-0.5">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
                            Evidence Request Checklist (Next Verification Steps)
                        </h3>
                        <p className="text-xs text-[#536174]">
                            Checklist of formal documentary evidence required from the executing agency prior to case sign-off.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto border border-[#dfe3e8] rounded-none">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-[#174a7e] text-white">
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Requirement ID
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Evidence Required
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Investigation Purpose
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Target Due Date
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dfe3e8] bg-white">
                            {requested_evidence.map((req) => {
                                const statusBadge =
                                    req.status === "Verified"
                                        ? "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]"
                                        : req.status === "Received"
                                        ? "bg-[#e8f0f8] text-[#174a7e] border-[#c8ced6]"
                                        : req.status === "Requested"
                                        ? "bg-[#fff4df] text-[#a56a00] border-[#fde68a]"
                                        : "bg-[#fff0e6] text-[#c2410c] border-[#fed7aa]";

                                return (
                                    <tr key={req.id} className="hover:bg-[#fafbfc] transition">
                                        <td className="py-2.5 px-3 font-mono font-bold text-[#174a7e]">
                                            {req.id}
                                        </td>
                                        <td className="py-2.5 px-3 font-bold text-[#172033]">
                                            {req.requirement_name}
                                        </td>
                                        <td className="py-2.5 px-3 text-[#536174] text-[11px] max-w-xs">
                                            {req.purpose}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-[#536174]">
                                            {req.dueDate}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span
                                                className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}
                                            >
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <p className="text-[11px] text-[#536174] italic">
                    * Requesting evidence records the request in the Case File audit log. Uploading a file does not automatically certify it.
                </p>
            </div>
        </div>
    );
};
