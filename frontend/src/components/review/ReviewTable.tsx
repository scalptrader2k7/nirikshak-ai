import React, { useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RotateCcw,
    AlertTriangle,
    ShieldAlert,
    Shield,
    FileText,
} from "@/components/shared/Icons";
import type { InvestigationCase, PriorityLevel, Filters } from "@/api/types";
import { IntegrityPassportModal } from "./IntegrityPassportModal";

interface ReviewTableProps {
    projects: InvestigationCase[];
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    filters: Filters;
    onSortChange: (sortBy: "rank" | "allocation_amount" | "record_id") => void;
    onResetFilters?: () => void;
}

function getRiskRatingBadge(level: PriorityLevel, score: number) {
    const scoreVal = Math.round(score);
    switch (level) {
        case "HIGH":
        case "CRITICAL":
            return {
                label: `High Risk · ${scoreVal}`,
                classes: "border border-[#ef4444] bg-[#fef2f2] text-[#b91c1c]",
            };
        case "MEDIUM":
            return {
                label: `Medium Risk · ${scoreVal}`,
                classes: "border border-[#f59e0b] bg-[#fffbeb] text-[#b45309]",
            };
        case "LOW":
        default:
            return {
                label: `Low Risk · ${scoreVal}`,
                classes: "border border-[#10b981] bg-[#ecfdf5] text-[#15803d]",
            };
    }
}

function getReviewTriggerBadge(trigger?: string) {
    switch (trigger) {
        case "Cost deviation":
            return {
                label: "Cost deviation",
                classes: "border border-[#f59e0b] bg-[#fffbeb] text-[#b45309]",
            };
        case "Duplicate record":
            return {
                label: "Duplicate record",
                classes: "border border-[#ef4444] bg-[#fef2f2] text-[#b91c1c]",
            };
        case "Near-duplicate record":
            return {
                label: "Near-duplicate record",
                classes: "border border-[#f59e0b] bg-[#fffbeb] text-[#b45309]",
            };
        case "Pattern deviation":
        default:
            return {
                label: "Pattern deviation",
                classes: "border border-[#0284c7] bg-[#f0f9ff] text-[#0369a1]",
            };
    }
}

function getReviewStatusBadge(status?: string) {
    switch (status) {
        case "Under Review":
            return {
                label: "Under Review",
                classes: "border border-[#f59e0b] bg-[#fffbeb] text-[#b45309]",
            };
        case "Verification Required":
            return {
                label: "Verification Required",
                classes: "border border-[#ef4444] bg-[#fef2f2] text-[#b91c1c]",
            };
        case "Reviewed":
            return {
                label: "Reviewed",
                classes: "border border-[#10b981] bg-[#ecfdf5] text-[#15803d]",
            };
        case "Closed":
            return {
                label: "Closed",
                classes: "border border-[#94a3b8] bg-[#f8fafc] text-[#475569]",
            };
        case "Awaiting Review":
        default:
            return {
                label: "Awaiting Review",
                classes: "border border-[#0284c7] bg-[#f0f9ff] text-[#0369a1]",
            };
    }
}

export const ReviewTable: React.FC<ReviewTableProps> = ({
    projects,
    loading = false,
    error = null,
    onRetry,
    filters,
    onSortChange,
    onResetFilters,
}) => {
    const [selectedPassportProject, setSelectedPassportProject] = useState<InvestigationCase | null>(null);

    const currentSortBy = filters.sort_by || "rank";
    const currentSortOrder = filters.sort_order || "asc";

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
        <>
            <div className="rounded-xl border border-[#d8d4ca] bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#17263a] border-collapse">
                        <thead>
                            {/* Table Header with Top Navigation Bar Background Color (#102d49) & Contrasting Light Text */}
                            <tr className="border-b border-white/20 bg-[#102d49] text-[11px] font-bold uppercase tracking-wider text-white">
                                {/* 1. Rank */}
                                <th scope="col" className="py-3.5 px-4 w-20 text-center font-mono text-white">
                                    <button
                                        type="button"
                                        onClick={() => onSortChange("rank")}
                                        className="group inline-flex items-center gap-1 font-bold uppercase text-white hover:text-[#d8b45c] transition cursor-pointer mx-auto"
                                    >
                                        <span>Rank</span>
                                        {renderSortIcon("rank")}
                                    </button>
                                </th>

                                {/* 2. Risk Rating */}
                                <th scope="col" className="py-3.5 px-4 min-w-[140px] text-center text-white">
                                    Risk Rating
                                </th>

                                {/* 3. MP Name & Constituency */}
                                <th scope="col" className="py-3.5 px-4 min-w-[200px] text-white">
                                    MP Name &amp; Constituency
                                </th>

                                {/* 4. Project Description */}
                                <th scope="col" className="py-3.5 px-5 min-w-[280px] text-white">
                                    Project Description
                                </th>

                                {/* 5. Allocated Amount */}
                                <th scope="col" className="py-3.5 px-4 text-right min-w-[130px]">
                                    <button
                                        type="button"
                                        onClick={() => onSortChange("allocation_amount")}
                                        className="group inline-flex items-center gap-1.5 font-bold uppercase text-white hover:text-[#d8b45c] transition cursor-pointer ml-auto"
                                    >
                                        <span>Allocated Amount</span>
                                        {renderSortIcon("allocation_amount")}
                                    </button>
                                </th>

                                {/* 6. Review Trigger */}
                                <th scope="col" className="py-3.5 px-4 min-w-[170px] text-white">
                                    Review Trigger
                                </th>

                                {/* 7. Status (Human Review Status) */}
                                <th scope="col" className="py-3.5 px-4 text-center min-w-[140px] text-white">
                                    Status
                                </th>

                                {/* 8. Action (Evidence Report + Integrity Passport) */}
                                <th scope="col" className="py-3.5 px-4 text-right min-w-[220px] text-white">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#ece7dc]">
                            {/* Loading Skeleton */}
                            {loading &&
                                [...Array(8)].map((_, i) => (
                                    <tr key={i} className="animate-pulse bg-white">
                                        <td className="py-4 px-4 text-center">
                                            <div className="h-3.5 w-6 bg-[#e2ddd1] rounded mx-auto" />
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="h-5 w-24 bg-[#e2ddd1] rounded-none mx-auto" />
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="h-3.5 w-32 bg-[#e2ddd1] rounded mb-1" />
                                            <div className="h-2.5 w-20 bg-[#ece7dc] rounded" />
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="h-3.5 w-64 bg-[#e2ddd1] rounded mb-1.5" />
                                            <div className="h-2.5 w-28 bg-[#ece7dc] rounded" />
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="h-3.5 w-16 bg-[#e2ddd1] rounded ml-auto" />
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="h-5 w-24 bg-[#e2ddd1] rounded-none" />
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="h-5 w-24 bg-[#e2ddd1] rounded-none mx-auto" />
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="h-7 w-36 bg-[#e2ddd1] rounded ml-auto" />
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
                                                Error Loading Review Workload
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
                                                No Cases Match the Selected Review Filters
                                            </h3>
                                            <p className="text-xs text-[#687487] leading-relaxed">
                                                Try adjusting search keywords or resetting review status and risk filters.
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

                            {/* Data Rows - NOT Clickable outside buttons */}
                            {!loading &&
                                !error &&
                                projects.map((c) => {
                                    const riskRatingBadge = getRiskRatingBadge(
                                        c.investigation_priority_level,
                                        c.investigation_priority_score
                                    );
                                    const triggerBadge = getReviewTriggerBadge(c.review_trigger);
                                    const statusBadge = getReviewStatusBadge(c.review_status);

                                    return (
                                        <tr
                                            key={c.record_id}
                                            className="hover:bg-[#fbfaf8] transition-colors"
                                        >
                                            {/* 1. Rank */}
                                            <td className="py-3.5 px-4 text-center font-mono font-bold text-[#102d49]">
                                                #{c.rank}
                                            </td>

                                            {/* 2. Risk Rating (Outlined Rectangular Badge) */}
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <span
                                                    className={`inline-block uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-none text-center ${riskRatingBadge.classes}`}
                                                >
                                                    {riskRatingBadge.label}
                                                </span>
                                            </td>

                                            {/* 3. MP Name & Constituency */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="font-bold text-[#17263a]">
                                                    {c.mp_name || "Hon'ble MP"}
                                                </div>
                                                <div className="text-[10px] text-[#687487] mt-0.5">
                                                    {c.constituency || "Constituency"}, {c.state || "State"}
                                                </div>
                                            </td>

                                            {/* 4. Project Description */}
                                            <td className="py-3.5 px-5 max-w-md">
                                                <div className="font-bold text-[#17263a] line-clamp-1">
                                                    {c.work || c.title}
                                                </div>
                                                <div className="text-[10px] text-[#8e897e] mt-0.5 font-mono">
                                                    REC-{String(c.record_id).padStart(5, "0")} · {c.work_type || "Infrastructure"}
                                                </div>
                                            </td>

                                            {/* 5. Allocated Amount */}
                                            <td className="py-3.5 px-4 text-right font-mono font-black text-[#17263a] whitespace-nowrap">
                                                {c.allocation_amount
                                                    ? `₹${(c.allocation_amount / 100000).toFixed(2)} L`
                                                    : "₹—"}
                                            </td>

                                            {/* 6. Review Trigger (Outlined Rectangular Badge) */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-block uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-none ${triggerBadge.classes}`}
                                                >
                                                    {triggerBadge.label}
                                                </span>
                                            </td>

                                            {/* 7. Status (Outlined Rectangular Badge) */}
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <span
                                                    className={`inline-block uppercase text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-none ${statusBadge.classes}`}
                                                >
                                                    {statusBadge.label}
                                                </span>
                                            </td>

                                            {/* 8. Action (Evidence Report + Integrity Passport ONLY) */}
                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedPassportProject(c)}
                                                        className="inline-flex items-center gap-1 rounded-md border border-[#d8d4ca] bg-white px-2.5 py-1 text-[11px] font-bold text-[#102d49] hover:bg-[#f4f2ec] transition shadow-2xs cursor-pointer"
                                                        title="Open Integrity Passport"
                                                    >
                                                        <Shield size={11} />
                                                        <span>Integrity Passport</span>
                                                    </button>

                                                    <Link
                                                        href={`/projects/${c.record_id}`}
                                                        className="inline-flex items-center gap-1 rounded-md bg-[#102d49] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#173d61] transition shadow-2xs cursor-pointer"
                                                        title="Open Evidence Report"
                                                    >
                                                        <FileText size={11} />
                                                        <span>Evidence Report</span>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Integrity Passport Modal */}
            {selectedPassportProject && (
                <IntegrityPassportModal
                    project={selectedPassportProject}
                    onClose={() => setSelectedPassportProject(null)}
                />
            )}
        </>
    );
};

export default ReviewTable;
