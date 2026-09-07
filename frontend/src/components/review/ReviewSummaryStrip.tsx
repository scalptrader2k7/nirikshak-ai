import React from "react";
import {
    ShieldAlert,
    AlertTriangle,
    Layers,
    Check,
} from "@/components/shared/Icons";
import type { PriorityLevel } from "@/api/types";
import { useLanguage } from "@/i18n/LanguageContext";

interface ReviewSummaryStripProps {
    totalCount: number;
    filteredCount: number;
    activePriorityFilter: PriorityLevel | null;
    onSelectPriorityFilter: (priority: PriorityLevel | null) => void;
    highCount?: number;
    mediumCount?: number;
    lowCount?: number;
}

export const ReviewSummaryStrip: React.FC<ReviewSummaryStripProps> = ({
    totalCount = 742,
    filteredCount = 742,
    activePriorityFilter,
    onSelectPriorityFilter,
    highCount = 45,
    mediumCount = 140,
    lowCount = 557,
}) => {
    const { t } = useLanguage();
    const isFiltered = filteredCount !== totalCount;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* 1. Total Projects */}
            <button
                type="button"
                onClick={() => onSelectPriorityFilter(null)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    activePriorityFilter === null
                        ? "bg-[#102d49] text-white border-[#102d49] shadow-sm"
                        : "bg-white text-[#17263a] border-[#d8d4ca] hover:border-[#102d49]/50"
                }`}
            >
                <div className="flex items-center justify-between">
                    <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                            activePriorityFilter === null
                                ? "text-white/80"
                                : "text-[#687487]"
                        }`}
                    >
                        Total Projects
                    </span>
                    <Layers
                        size={14}
                        className={
                            activePriorityFilter === null
                                ? "text-[#d8b45c]"
                                : "text-[#687487]"
                        }
                    />
                </div>
                <div className="mt-2">
                    <div className="text-2xl font-black font-mono">
                        {totalCount}
                    </div>
                    <div
                        className={`text-[11px] mt-0.5 ${
                            activePriorityFilter === null
                                ? "text-white/70"
                                : "text-[#687487]"
                        }`}
                    >
                        {isFiltered ? `${filteredCount} in active view` : "All monitored works"}
                    </div>
                </div>
            </button>

            {/* 2. High Risk */}
            <button
                type="button"
                onClick={() =>
                    onSelectPriorityFilter(activePriorityFilter === "HIGH" ? null : "HIGH")
                }
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    activePriorityFilter === "HIGH"
                        ? "bg-[#7c2d12] text-white border-[#7c2d12] shadow-sm"
                        : "bg-white text-[#17263a] border-[#d8d4ca] hover:border-[#c2410c]/50"
                }`}
            >
                <div className="flex items-center justify-between">
                    <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                            activePriorityFilter === "HIGH"
                                ? "text-white"
                                : "text-[#c2410c]"
                        }`}
                    >
                        {t("common.high", "High Risk")}
                    </span>
                    <AlertTriangle
                        size={14}
                        className={
                            activePriorityFilter === "HIGH"
                                ? "text-white"
                                : "text-[#c2410c]"
                        }
                    />
                </div>
                <div className="mt-2">
                    <div className="text-2xl font-black font-mono">
                        <span className={activePriorityFilter === "HIGH" ? "text-white" : "text-[#c2410c]"}>
                            {highCount}
                        </span>
                    </div>
                    <div
                        className={`text-[11px] mt-0.5 ${
                            activePriorityFilter === "HIGH"
                                ? "text-white/80"
                                : "text-[#687487]"
                        }`}
                    >
                        Field &amp; desk review priority
                    </div>
                </div>
            </button>

            {/* 3. Medium Risk */}
            <button
                type="button"
                onClick={() =>
                    onSelectPriorityFilter(activePriorityFilter === "MEDIUM" ? null : "MEDIUM")
                }
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    activePriorityFilter === "MEDIUM"
                        ? "bg-[#a56a00] text-white border-[#a56a00] shadow-sm ring-2 ring-[#a56a00]/20"
                        : "bg-white text-[#17263a] border-[#d8d4ca] hover:border-[#a56a00]/50"
                }`}
            >
                <div className="flex items-center justify-between">
                    <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                            activePriorityFilter === "MEDIUM"
                                ? "text-white"
                                : "text-[#a56a00]"
                        }`}
                    >
                        Medium Risk
                    </span>
                    <ShieldAlert
                        size={14}
                        className={
                            activePriorityFilter === "MEDIUM"
                                ? "text-white"
                                : "text-[#a56a00]"
                        }
                    />
                </div>
                <div className="mt-2">
                    <div className="text-2xl font-black font-mono">
                        <span className={activePriorityFilter === "MEDIUM" ? "text-white" : "text-[#a56a00]"}>
                            {mediumCount}
                        </span>
                    </div>
                    <div
                        className={`text-[11px] mt-0.5 ${
                            activePriorityFilter === "MEDIUM"
                                ? "text-white/80"
                                : "text-[#687487]"
                        }`}
                    >
                        Desk audit recommended
                    </div>
                </div>
            </button>

            {/* 4. Low Risk */}
            <button
                type="button"
                onClick={() =>
                    onSelectPriorityFilter(activePriorityFilter === "LOW" ? null : "LOW")
                }
                className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    activePriorityFilter === "LOW"
                        ? "bg-[#2f7d5a] text-white border-[#2f7d5a] shadow-sm ring-2 ring-[#2f7d5a]/20"
                        : "bg-white text-[#17263a] border-[#d8d4ca] hover:border-[#2f7d5a]/50"
                }`}
            >
                <div className="flex items-center justify-between">
                    <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                            activePriorityFilter === "LOW"
                                ? "text-white"
                                : "text-[#2f7d5a]"
                        }`}
                    >
                        Low Risk
                    </span>
                    <Check
                        size={14}
                        className={
                            activePriorityFilter === "LOW"
                                ? "text-white"
                                : "text-[#2f7d5a]"
                        }
                    />
                </div>
                <div className="mt-2">
                    <div className="text-2xl font-black font-mono">
                        <span className={activePriorityFilter === "LOW" ? "text-white" : "text-[#2f7d5a]"}>
                            {lowCount}
                        </span>
                    </div>
                    <div
                        className={`text-[11px] mt-0.5 ${
                            activePriorityFilter === "LOW"
                                ? "text-white/80"
                                : "text-[#687487]"
                        }`}
                    >
                        Conforms to benchmarks
                    </div>
                </div>
            </button>
        </div>
    );
};

export default ReviewSummaryStrip;
