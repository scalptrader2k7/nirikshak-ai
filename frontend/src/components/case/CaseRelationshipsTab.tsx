"use client";

import React from "react";
import Link from "next/link";
import {
    Layers,
    AlertTriangle,
    Info,
    ExternalLink,
    FileText,
} from "@/components/shared/Icons";
import type { EnrichedCaseDetail } from "./demoCaseDetailAdapter";

interface CaseRelationshipsTabProps {
    data: EnrichedCaseDetail;
}

export const CaseRelationshipsTab: React.FC<CaseRelationshipsTabProps> = ({
    data,
}) => {
    const { case: project, related_cases, citizen_reports } = data;

    return (
        <div className="space-y-6 pt-4">
            {/* Section 11: Relationship & Network Context */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#dfe3e8] pb-3">
                    <div className="flex items-center gap-2 text-[#172033]">
                        <Layers size={17} className="text-[#174a7e]" />
                        <h2 className="text-sm font-bold uppercase tracking-wider">
                            Relationship &amp; Network Context
                        </h2>
                    </div>
                    <span className="text-[11px] font-mono text-[#536174]">
                        Traceability Graph Summary
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8] space-y-1">
                        <span className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                            Geographic Cluster
                        </span>
                        <span className="font-bold text-[#172033] block">
                            {project.constituency}, {project.state}
                        </span>
                        <p className="text-[11px] text-[#536174]">
                            Cluster monitoring tracks concurrent works sanctioned within same assembly segment.
                        </p>
                    </div>

                    <div className="p-3.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8] space-y-1">
                        <span className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                            Work Type Baseline
                        </span>
                        <span className="font-bold text-[#172033] block">
                            {project.work_type || "Public Works"}
                        </span>
                        <p className="text-[11px] text-[#536174]">
                            Category indexing benchmarks technical specifications across regional executions.
                        </p>
                    </div>

                    <div className="p-3.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8] space-y-1">
                        <span className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                            Related Scheme Records
                        </span>
                        <span className="font-bold text-[#174a7e] block">
                            {related_cases.length} Contextual Matches
                        </span>
                        <p className="text-[11px] text-[#536174]">
                            Identified via lexical overlap and work categorization filters.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 12: Similar / Related Projects Table */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dfe3e8] pb-3">
                    <div className="space-y-0.5">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
                            Similar &amp; Related Projects
                        </h3>
                        <p className="text-xs text-[#536174]">
                            Comparable projects linked through matching sector, geographic proximity, or intake similarity signals.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto border border-[#dfe3e8] rounded-none">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-[#174a7e] text-white">
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Record ID
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Project Title
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Constituency &amp; State
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider text-right">
                                    Sanctioned (₹)
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Risk Level
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Relationship Basis
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider text-right">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dfe3e8] bg-white">
                            {related_cases.map((rel) => {
                                const riskBadge =
                                    rel.priority_level === "HIGH" || rel.priority_level === "CRITICAL"
                                        ? "bg-[#fff0e6] text-[#c2410c] border-[#fed7aa]"
                                        : rel.priority_level === "MEDIUM"
                                        ? "bg-[#fff4df] text-[#a56a00] border-[#fde68a]"
                                        : "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]";

                                const relId = String(rel.record_id).padStart(5, "0");

                                return (
                                    <tr key={rel.record_id} className="hover:bg-[#fafbfc] transition">
                                        <td className="py-2.5 px-3 font-mono font-bold text-[#174a7e]">
                                            REC-{relId}
                                        </td>
                                        <td className="py-2.5 px-3 font-medium text-[#172033] max-w-xs truncate">
                                            {rel.work_title}
                                        </td>
                                        <td className="py-2.5 px-3 text-[#536174]">
                                            {rel.constituency}, {rel.state}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#172033]">
                                            ₹{((rel.allocation_amount || 0) / 100000).toFixed(2)}L
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span
                                                className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border ${riskBadge}`}
                                            >
                                                {rel.priority_level === "CRITICAL" ? "High Risk" : `${rel.priority_level} Risk`}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-[#536174] text-[11px]">
                                            {rel.relationship_type || "Matching Category"}
                                        </td>
                                        <td className="py-2.5 px-3 text-right">
                                            <Link
                                                href={`/projects/${rel.record_id}`}
                                                className="px-2.5 py-1 text-[11px] font-bold text-[#174a7e] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition inline-block"
                                            >
                                                View Case
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <p className="text-[11px] text-[#536174] italic">
                    * Entire table rows are strictly non-clickable. Use the explicit &ldquo;View Case&rdquo; button to navigate.
                </p>
            </div>

            {/* Section 13: Citizen Complaints & Field Input */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#dfe3e8] pb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
                        Citizen Complaints &amp; Field Input (Case Contextual)
                    </h3>
                    <span className="text-[10px] font-mono text-[#536174]">
                        Requires Human Verification
                    </span>
                </div>

                {citizen_reports.length > 0 ? (
                    <div className="space-y-3">
                        {citizen_reports.map((report) => (
                            <div
                                key={report.id}
                                className="p-3.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8] space-y-2 text-xs"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#dfe3e8] pb-2 text-[11px]">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-[#174a7e]">
                                            {report.id}
                                        </span>
                                        <span className="text-[#536174]">({report.date})</span>
                                        <span className="bg-[#f1f3f6] border border-[#dfe3e8] px-2 py-0.2 rounded-none font-semibold text-[#172033]">
                                            {report.category}
                                        </span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border bg-[#fff4df] text-[#a56a00] border-[#fde68a]">
                                        {report.verification_status}
                                    </span>
                                </div>
                                <p className="text-[#172033] font-medium leading-relaxed">
                                    {report.summary}
                                </p>
                                <div className="text-[11px] text-[#536174]">
                                    <strong>Location:</strong> {report.location_detail}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 rounded-none bg-[#fafbfc] border border-[#dfe3e8] text-center text-xs text-[#536174]">
                        No citizen complaints or localized field observations are currently linked to this project record.
                    </div>
                )}

                <div className="flex items-start gap-2 p-3 rounded-none bg-[#f1f3f6] border border-[#dfe3e8] text-[11px] text-[#536174]">
                    <Info size={14} className="text-[#174a7e] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                        <strong>Governance Rule:</strong> Citizen reports are qualitative inputs that assist field investigation. They do NOT automatically alter automated risk scores or establish misconduct without official verification.
                    </p>
                </div>
            </div>
        </div>
    );
};
