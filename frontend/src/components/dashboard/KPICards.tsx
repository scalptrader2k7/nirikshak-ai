import React from "react";
import Link from "next/link";
import {
    Database,
    ShieldAlert,
    AlertTriangle,
    FolderSearch,
    Layers,
    ArrowRight,
} from "@/components/shared/Icons";
import type { StatisticsResponse } from "@/api/types";
import { useLanguage } from "@/i18n/LanguageContext";

interface KPICardsProps {
    stats: StatisticsResponse | null;
    totalSanctionedCr?: number;
    loading?: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({
    stats,
    totalSanctionedCr = 384.6,
    loading = false,
}) => {
    if (loading || !stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="h-36 rounded-lg border border-slate-200 bg-white p-4 shadow-sm animate-pulse flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-center">
                            <div className="h-3 w-20 bg-slate-200 rounded" />
                            <div className="h-4 w-4 bg-slate-200 rounded" />
                        </div>
                        <div className="h-8 w-24 bg-slate-200 rounded my-2" />
                        <div className="h-3 w-32 bg-slate-100 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    const totalRecords = stats.total_records || 742;
    const highCount = (stats.priority_distribution.HIGH || 35) + (stats.priority_distribution.CRITICAL || 0); // 45 High priority records
    const medCount = stats.priority_distribution.MEDIUM || 140;
    const reviewPriorityCount = highCount + medCount; // 185 records (24.9%)

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* KPI 1 — MONITORED WORKS */}
            <Link
                href="/projects"
                className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#102d49]/40 hover:shadow-md flex flex-col justify-between h-full"
            >
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            Monitored Works
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                            <Database size={14} />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                            {totalRecords.toLocaleString()}
                        </span>
                        <span className="inline-block text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Full Corpus
                        </span>
                    </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">All monitored public works</span>
                    <span className="text-slate-400 group-hover:text-[#102d49] group-hover:translate-x-0.5 transition font-bold shrink-0 ml-1">
                        →
                    </span>
                </div>
            </Link>

            {/* KPI 2 — SANCTIONED ALLOCATION */}
            <Link
                href="/projects"
                className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#102d49]/40 hover:shadow-md flex flex-col justify-between h-full"
            >
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            Sanctioned Alloc.
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700 font-bold text-xs">
                            ₹
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                            ₹{totalSanctionedCr.toFixed(1)}
                        </span>
                        <span className="text-xs font-bold text-slate-600">Cr</span>
                    </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">Confirmed baseline</span>
                    <span className="text-slate-400 group-hover:text-[#102d49] group-hover:translate-x-0.5 transition font-bold shrink-0 ml-1">
                        →
                    </span>
                </div>
            </Link>

            {/* KPI 3 — REVIEW-PRIORITY RECORDS */}
            <Link
                href="/review"
                className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-400 hover:shadow-md flex flex-col justify-between h-full"
            >
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            Review-Priority
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-50 text-amber-600 border border-amber-200/60">
                            <ShieldAlert size={14} />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono">
                            {reviewPriorityCount}
                        </span>
                        <span className="inline-block text-xs font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
                            {((reviewPriorityCount / totalRecords) * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">{reviewPriorityCount} / {totalRecords} works</span>
                    <span className="text-amber-500 group-hover:translate-x-0.5 transition font-bold shrink-0 ml-1">
                        →
                    </span>
                </div>
            </Link>

            {/* KPI 4 — HIGH RISK WORKS */}
            <Link
                href="/review?priority=HIGH"
                className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-red-400 hover:shadow-md flex flex-col justify-between h-full"
            >
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            High Risk Works
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-600 border border-red-200/60">
                            <AlertTriangle size={14} />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-red-600 font-mono">
                            {highCount}
                        </span>
                        <span className="inline-block text-xs font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            {((highCount / totalRecords) * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">{highCount} / {totalRecords} priority</span>
                    <span className="text-red-500 group-hover:translate-x-0.5 transition font-bold shrink-0 ml-1">
                        →
                    </span>
                </div>
            </Link>

            {/* KPI 5 — STATES & UTs COVERED */}
            <Link
                href="/projects"
                className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#102d49]/40 hover:shadow-md flex flex-col justify-between h-full"
            >
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            States &amp; UTs
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                            <FolderSearch size={14} />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                            28
                        </span>
                        <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            Pan-India
                        </span>
                    </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">National coverage</span>
                    <span className="text-slate-400 group-hover:text-[#102d49] group-hover:translate-x-0.5 transition font-bold shrink-0 ml-1">
                        →
                    </span>
                </div>
            </Link>

            {/* KPI 6 — MONITORED WORK CATEGORIES */}
            <Link
                href="/projects"
                className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#102d49]/40 hover:shadow-md flex flex-col justify-between h-full"
            >
                <div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                            Work Sectors
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                            <Layers size={14} />
                        </div>
                    </div>
                    <div className="mt-2.5 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                            7
                        </span>
                        <span className="inline-block text-xs font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            Sectors
                        </span>
                    </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">Key scheme domains</span>
                    <span className="text-slate-400 group-hover:text-[#102d49] group-hover:translate-x-0.5 transition font-bold shrink-0 ml-1">
                        →
                    </span>
                </div>
            </Link>
        </div>
    );
};

export default KPICards;
