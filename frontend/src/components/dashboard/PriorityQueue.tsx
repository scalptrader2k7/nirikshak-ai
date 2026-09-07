import React from "react";
import Link from "next/link";
import {
    ShieldAlert,
    ArrowRight,
    Info,
} from "@/components/shared/Icons";
import type { InvestigationCase, PriorityLevel } from "@/api/types";

interface PriorityQueueProps {
    cases: InvestigationCase[];
    loading?: boolean;
}

function getPriorityBadge(level: PriorityLevel) {
    switch (level) {
        case "CRITICAL":
        case "HIGH":
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

function getDetectorBadge(detector: string) {
    switch (detector) {
        case "cost":
            return { label: "Cost Outlier", bg: "bg-[#fff0e6] text-[#c2410c]" };
        case "exact_duplicate":
            return { label: "Exact Duplicate", bg: "bg-[#fff0e6] text-[#c2410c]" };
        case "near_duplicate":
            return { label: "Near Duplicate", bg: "bg-[#fff4df] text-[#a56a00]" };
        case "pattern":
        default:
            return { label: "Pattern Signal", bg: "bg-[#e8f0f8] text-[#102d49]" };
    }
}

export const PriorityQueue: React.FC<PriorityQueueProps> = ({
    cases,
    loading = false,
}) => {
    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white shadow-xs overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-[#ece7dc] bg-white">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff0e6] text-[#c2410c]">
                        <ShieldAlert size={19} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-[#17263a]">
                                High-Priority Review Queue
                            </h2>
                            <span className="rounded bg-[#fff0e6] border border-[#fed7aa] px-2 py-0.5 text-[10px] font-bold text-[#c2410c]">
                                Prioritized Cases
                            </span>
                        </div>
                        <p className="text-xs text-[#687487] mt-0.5">
                            Projects with strongest available anomaly indicators requiring official audit verification
                        </p>
                    </div>
                </div>

                <Link
                    href="/projects"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#102d49] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#173d61] shadow-xs shrink-0 cursor-pointer"
                >
                    <span>Explore All 742 Projects</span>
                    <ArrowRight size={13} />
                </Link>
            </div>

            {/* Governance Information Banner */}
            <div className="bg-[#fbfaf8] border-b border-[#ece7dc] px-6 py-3 flex items-start gap-2.5 text-xs text-[#536174]">
                <Info size={15} className="text-[#102d49] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    <strong className="text-[#17263a]">Investigation Governance:</strong> Relative priority index reflects objective anomaly signals (cost deviation, duplicate similarity, pattern indicators). It guides human review sequence and does not establish legal liability or proven fraud.
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-[#f4f2ec] text-[#536174] border-b border-[#d8d4ca] uppercase text-[10px] font-bold tracking-wider select-none">
                        <tr>
                            <th className="py-3 px-4 w-28">Record ID</th>
                            <th className="py-3 px-6">Work Description</th>
                            <th className="py-3 px-4">Location / MP</th>
                            <th className="py-3 px-4">Work Type</th>
                            <th className="py-3 px-4 text-right">Sanctioned (₹)</th>
                            <th className="py-3 px-4 text-center">Risk Tier</th>
                            <th className="py-3 px-4 text-center">Score</th>
                            <th className="py-3 px-4">Primary Signal</th>
                            <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ece7dc]">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="py-4 px-4"><div className="h-4 w-20 bg-[#e2ddd1] rounded" /></td>
                                    <td className="py-4 px-6"><div className="h-4 w-64 bg-[#e2ddd1] rounded" /></td>
                                    <td className="py-4 px-4"><div className="h-4 w-24 bg-[#e2ddd1] rounded" /></td>
                                    <td className="py-4 px-4"><div className="h-4 w-20 bg-[#e2ddd1] rounded" /></td>
                                    <td className="py-4 px-4"><div className="h-4 w-16 bg-[#e2ddd1] rounded ml-auto" /></td>
                                    <td className="py-4 px-4"><div className="h-5 w-16 bg-[#e2ddd1] rounded mx-auto" /></td>
                                    <td className="py-4 px-4"><div className="h-4 w-10 bg-[#e2ddd1] rounded mx-auto" /></td>
                                    <td className="py-4 px-4"><div className="h-5 w-24 bg-[#e2ddd1] rounded" /></td>
                                    <td className="py-4 px-4"><div className="h-6 w-16 bg-[#e2ddd1] rounded ml-auto" /></td>
                                </tr>
                            ))
                        ) : cases.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="py-10 text-center text-[#687487]">
                                    No project records available in current dataset.
                                </td>
                            </tr>
                        ) : (
                            cases.map((c) => {
                                const priorityBadge = getPriorityBadge(c.investigation_priority_level);
                                const detectorBadge = getDetectorBadge(c.primary_detector);

                                return (
                                    <tr
                                        key={c.record_id}
                                        className="hover:bg-[#f8f7f3] transition-colors"
                                    >
                                        {/* Record ID */}
                                        <td className="py-3.5 px-4 font-mono font-bold text-[#102d49]">
                                            REC-{String(c.record_id).padStart(5, "0")}
                                        </td>

                                        {/* Work Description */}
                                        <td className="py-3.5 px-6 max-w-xs">
                                            <div className="font-bold text-[#17263a] line-clamp-1">
                                                {c.work || c.title || "Monitored Public Development Work"}
                                            </div>
                                            <div className="text-[10px] text-[#687487] mt-0.5 truncate">
                                                {c.summary || "Pending evidence review"}
                                            </div>
                                        </td>

                                        {/* Location / MP */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="font-semibold text-[#17263a]">
                                                {c.constituency || "Constituency"}, {c.state || "State"}
                                            </div>
                                            <div className="text-[10px] text-[#687487]">
                                                {c.mp_name || "Hon'ble MP"}
                                            </div>
                                        </td>

                                        {/* Work Type */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <span className="text-[11px] font-medium text-[#536174]">
                                                {c.work_type || "Infrastructure"}
                                            </span>
                                        </td>

                                        {/* Allocation Amount */}
                                        <td className="py-3.5 px-4 text-right font-mono font-black text-[#17263a] whitespace-nowrap">
                                            {c.allocation_amount
                                                ? `₹${(c.allocation_amount / 100000).toFixed(2)} L`
                                                : "₹—"}
                                        </td>

                                        {/* Risk Badge */}
                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                            <span
                                                className={`inline-block px-2.5 py-0.5 rounded-none text-[10px] font-bold border ${priorityBadge.bg} ${priorityBadge.text} ${priorityBadge.border}`}
                                            >
                                                {priorityBadge.label}
                                            </span>
                                        </td>

                                        {/* Priority Score */}
                                        <td className="py-3.5 px-4 text-center font-mono font-black text-[#17263a]">
                                            {c.investigation_priority_score?.toFixed(1) || "—"}
                                        </td>

                                        {/* Primary Detector / Signal */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded-none text-[10px] font-bold ${detectorBadge.bg}`}
                                            >
                                                {detectorBadge.label}
                                            </span>
                                        </td>

                                        {/* Action */}
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            <Link
                                                href={`/projects/${c.record_id}`}
                                                className="inline-flex items-center gap-1 rounded-none bg-[#f4f2ec] border border-[#d8d4ca] px-2.5 py-1 text-[11px] font-bold text-[#102d49] hover:bg-[#102d49] hover:text-white transition cursor-pointer"
                                            >
                                                <span>VIEW CASE</span>
                                                <ArrowRight size={11} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Summary */}
            <div className="bg-[#fbfaf8] border-t border-[#ece7dc] px-6 py-3.5 flex items-center justify-between text-xs text-[#536174]">
                <span>Displaying highest-priority investigation cases ranked by multi-detector score</span>
                <Link
                    href="/projects?sort_by=investigation_priority_score&sort_order=desc"
                    className="font-bold text-[#102d49] hover:underline"
                >
                    View Complete Case Registry →
                </Link>
            </div>
        </div>
    );
};

export default PriorityQueue;
