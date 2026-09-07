import React from "react";
import Link from "next/link";
import {
    ArrowRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RotateCcw,
    AlertTriangle,
    ShieldAlert,
} from "@/components/shared/Icons";
import type { InvestigationCase, PriorityLevel, Filters } from "@/api/types";

interface ProjectTableProps {
    projects: InvestigationCase[];
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    filters: Filters;
    onSortChange: (sortBy: "rank" | "allocation_amount" | "record_id") => void;
    onResetFilters?: () => void;
}

function getRiskBadge(level: PriorityLevel) {
    switch (level) {
        case "HIGH":
        case "CRITICAL": // Safety fallback
            return {
                label: "High Risk",
                classes: "border border-[#ef4444] bg-[#fef2f2] text-[#b91c1c]",
            };
        case "MEDIUM":
            return {
                label: "Medium Risk",
                classes: "border border-[#f59e0b] bg-[#fffbeb] text-[#b45309]",
            };
        case "LOW":
        default:
            return {
                label: "Low Risk",
                classes: "border border-[#10b981] bg-[#ecfdf5] text-[#15803d]",
            };
    }
}

function getStatusBadge(status?: string) {
    const isSanctioned = status !== "Unsanctioned";
    if (isSanctioned) {
        return {
            label: "Sanctioned",
            classes: "border border-[#10b981] bg-[#ecfdf5] text-[#15803d]",
        };
    }
    return {
        label: "Unsanctioned",
        classes: "border border-[#ef4444] bg-[#fef2f2] text-[#b91c1c]",
    };
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
    projects,
    loading = false,
    error = null,
    onRetry,
    filters,
    onSortChange,
    onResetFilters,
}) => {
    const currentSortBy = filters.sort_by || "allocation_amount";
    const currentSortOrder = filters.sort_order || "desc";

    const renderSortIcon = (field: "rank" | "allocation_amount" | "record_id") => {
        if (currentSortBy !== field) {
            return <ArrowUpDown size={12} className="text-white/60 group-hover:text-[#d8b45c] transition" />;
        }
        return currentSortOrder === "asc" ? (
            <ArrowUp size={12} className="text-[#d8b45c]" />
        ) : (
            <ArrowDown size={12} className="text-[#d8b45c]" />
        );
    };

    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#17263a] border-collapse">
                    <thead>
                        {/* Table Header with Top Navigation Bar Background Color (#102d49) & Contrasting Light Text */}
                        <tr className="border-b border-white/20 bg-[#102d49] text-[11px] font-bold uppercase tracking-wider text-white">
                            {/* 1. Project ID */}
                            <th scope="col" className="py-3.5 px-4 w-32">
                                <button
                                    type="button"
                                    onClick={() => onSortChange("record_id")}
                                    className="group inline-flex items-center gap-1.5 font-bold uppercase text-white hover:text-[#d8b45c] transition cursor-pointer"
                                >
                                    <span>Project ID</span>
                                    {renderSortIcon("record_id")}
                                </button>
                            </th>

                            {/* 2. Project */}
                            <th scope="col" className="py-3.5 px-5 min-w-[300px] text-white">
                                Project
                            </th>

                            {/* 3. Work Type */}
                            <th scope="col" className="py-3.5 px-4 min-w-[150px] text-white">
                                Work Type
                            </th>

                            {/* 4. State & Constituency (Combined) */}
                            <th scope="col" className="py-3.5 px-4 min-w-[200px] text-white">
                                State &amp; Constituency
                            </th>

                            {/* 5. Allocated Amount */}
                            <th scope="col" className="py-3.5 px-4 text-right min-w-[140px]">
                                <button
                                    type="button"
                                    onClick={() => onSortChange("allocation_amount")}
                                    className="group inline-flex items-center gap-1.5 font-bold uppercase text-white hover:text-[#d8b45c] transition cursor-pointer ml-auto"
                                >
                                    <span>Allocated Amount</span>
                                    {renderSortIcon("allocation_amount")}
                                </button>
                            </th>

                            {/* 6. Risk (Immediately beside Allocated Amount) */}
                            <th scope="col" className="py-3.5 px-4 text-center min-w-[110px] text-white">
                                Risk
                            </th>

                            {/* 7. Status (Sanctioned / Unsanctioned) */}
                            <th scope="col" className="py-3.5 px-4 text-center min-w-[120px] text-white">
                                Status
                            </th>

                            {/* 8. Action (View Case ONLY) */}
                            <th scope="col" className="py-3.5 px-4 text-right w-28 text-white">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[#ece7dc]">
                        {/* Loading Skeleton */}
                        {loading &&
                            [...Array(8)].map((_, i) => (
                                <tr key={i} className="animate-pulse bg-white">
                                    <td className="py-4 px-4">
                                        <div className="h-3.5 w-20 bg-[#e2ddd1] rounded" />
                                    </td>
                                    <td className="py-4 px-5">
                                        <div className="h-3.5 w-64 bg-[#e2ddd1] rounded mb-1.5" />
                                        <div className="h-2.5 w-32 bg-[#ece7dc] rounded" />
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="h-3 w-24 bg-[#e2ddd1] rounded" />
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="h-3 w-28 bg-[#e2ddd1] rounded" />
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="h-3.5 w-16 bg-[#e2ddd1] rounded ml-auto" />
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="h-5 w-16 bg-[#e2ddd1] rounded-none mx-auto" />
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <div className="h-5 w-20 bg-[#e2ddd1] rounded-none mx-auto" />
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="h-7 w-20 bg-[#e2ddd1] rounded ml-auto" />
                                    </td>
                                </tr>
                            ))}

                        {/* Error State */}
                        {!loading && error && (
                            <tr>
                                <td colSpan={8} className="py-12 px-6 text-center">
                                    <div className="max-w-md mx-auto space-y-3">
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fbe9e9] text-[#b91c1c]">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <h3 className="text-sm font-bold text-[#17263a]">
                                            Error Loading Projects
                                        </h3>
                                        <p className="text-xs text-[#687487] leading-relaxed">
                                            {error}
                                        </p>
                                        {onRetry && (
                                            <button
                                                type="button"
                                                onClick={onRetry}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#102d49] px-4 py-2 text-xs font-bold text-white hover:bg-[#173d61] transition cursor-pointer"
                                            >
                                                <RotateCcw size={13} />
                                                <span>Retry</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Empty State */}
                        {!loading && !error && projects.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-12 px-6 text-center">
                                    <div className="max-w-md mx-auto space-y-3">
                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f2ec] text-[#687487]">
                                            <ShieldAlert size={20} />
                                        </div>
                                        <h3 className="text-sm font-bold text-[#17263a]">
                                            No Projects Match the Selected Filters
                                        </h3>
                                        <p className="text-xs text-[#687487] leading-relaxed">
                                            Try adjusting your keyword search or resetting geographic, work type, risk, and status filters.
                                        </p>
                                        {onResetFilters && (
                                            <button
                                                type="button"
                                                onClick={onResetFilters}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#102d49] px-4 py-2 text-xs font-bold text-white hover:bg-[#173d61] transition cursor-pointer"
                                            >
                                                <RotateCcw size={13} />
                                                <span>Reset All Filters</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Data Rows - NOT Clickable outside action button */}
                        {!loading &&
                            !error &&
                            projects.map((c) => {
                                const riskBadge = getRiskBadge(c.investigation_priority_level);
                                const statusBadge = getStatusBadge(c.sanction_status);

                                return (
                                    <tr
                                        key={c.record_id}
                                        className="hover:bg-[#fbfaf8] transition-colors"
                                    >
                                        {/* 1. Project ID */}
                                        <td className="py-3.5 px-4 font-mono font-bold text-[#102d49] whitespace-nowrap">
                                            REC-{String(c.record_id).padStart(5, "0")}
                                        </td>

                                        {/* 2. Project Title / Description */}
                                        <td className="py-3.5 px-5 max-w-md">
                                            <div className="font-bold text-[#17263a] line-clamp-1">
                                                {c.work || c.title}
                                            </div>
                                            {c.mp_name && (
                                                <div className="text-[10px] text-[#687487] mt-0.5 truncate">
                                                    Representative: {c.mp_name}
                                                </div>
                                            )}
                                        </td>

                                        {/* 3. Work Type */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <span className="inline-block text-[11px] font-semibold text-[#17263a] bg-[#f4f2ec] border border-[#d8d4ca] px-2 py-0.5 rounded">
                                                {c.work_type || "Infrastructure"}
                                            </span>
                                        </td>

                                        {/* 4. State & Constituency (Combined) */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <div className="font-semibold text-[#17263a]">
                                                {c.state || "State"} · {c.constituency || "Constituency"}
                                            </div>
                                        </td>

                                        {/* 5. Allocated Amount */}
                                        <td className="py-3.5 px-4 text-right font-mono font-black text-[#17263a] whitespace-nowrap">
                                            {c.allocation_amount
                                                ? `₹${(c.allocation_amount / 100000).toFixed(2)} L`
                                                : "₹—"}
                                        </td>

                                        {/* 6. Risk (Outlined Rectangular Badge) */}
                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                            <span
                                                className={`inline-block uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-none text-center ${riskBadge.classes}`}
                                            >
                                                {riskBadge.label}
                                            </span>
                                        </td>

                                        {/* 7. Status (Outlined Rectangular Badge) */}
                                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                            <span
                                                className={`inline-block uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-none text-center ${statusBadge.classes}`}
                                            >
                                                {statusBadge.label}
                                            </span>
                                        </td>

                                        {/* 8. Action (View Case ONLY) */}
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            <Link
                                                href={`/projects/${c.record_id}`}
                                                className="inline-flex items-center gap-1 rounded-md bg-[#102d49] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#173d61] transition shadow-2xs cursor-pointer"
                                            >
                                                <span>View Case</span>
                                                <ArrowRight size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectTable;
