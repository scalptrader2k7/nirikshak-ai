import React, { useState } from "react";
import { Activity } from "@/components/shared/Icons";

interface TierMetric {
    id: string;
    label: string;
    range: string;
    percentage: number;
    stateCount: number;
    colorBg: string;
    colorHex: string;
}

const TIER_DATA: TierMetric[] = [
    {
        id: "HIGH",
        label: "High Utilizers",
        range: "85%+",
        percentage: 18.2,
        stateCount: 4,
        colorBg: "bg-[#174a7e]",
        colorHex: "#174a7e",
    },
    {
        id: "GOOD",
        label: "Good Utilizers",
        range: "70–84%",
        percentage: 27.3,
        stateCount: 6,
        colorBg: "bg-[#2f7d5a]",
        colorHex: "#2f7d5a",
    },
    {
        id: "MODERATE",
        label: "Moderate Utilizers",
        range: "50–69%",
        percentage: 31.8,
        stateCount: 7,
        colorBg: "bg-[#a56a00]",
        colorHex: "#a56a00",
    },
    {
        id: "LOW",
        label: "Low Utilizers",
        range: "<50%",
        percentage: 22.7,
        stateCount: 5,
        colorBg: "bg-[#c2410c]",
        colorHex: "#c2410c",
    },
];

export const FundUtilizationPatternChart: React.FC = () => {
    const [hoveredTier, setHoveredTier] = useState<TierMetric | null>(null);

    const maxScale = 60; // 0% to 60% Scale

    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-5 shadow-xs flex flex-col justify-between h-[390px]">
            <div>
                {/* Clean Header: Title Only */}
                <div className="flex items-center justify-between border-b border-[#ece7dc] pb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#102d49]/5 text-[#102d49]">
                            <Activity size={15} />
                        </div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                            Fund Utilization Pattern
                        </h2>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-[#536174] bg-[#fbfaf8] border border-[#e2ddd1] px-2 py-0.5 rounded">
                        22 States Analyzed
                    </span>
                </div>

                {/* Vertical Bar Chart (0% to 60% Scale) */}
                <div className="relative pt-4 pb-2 mt-1">
                    <div className="relative h-48 w-full px-6">
                        {/* Y-Axis Grid Lines & Tick Labels (0% to 60%) */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-[10px] font-mono text-[#8e897e] left-0 right-0">
                            <div className="flex items-center w-full">
                                <span className="w-7 text-left">60%</span>
                                <div className="h-px w-full ml-1 bg-[#ece7dc] border-t border-dashed border-[#d8d4ca]" />
                            </div>
                            <div className="flex items-center w-full">
                                <span className="w-7 text-left">45%</span>
                                <div className="h-px w-full ml-1 bg-[#ece7dc] border-t border-dashed border-[#d8d4ca]" />
                            </div>
                            <div className="flex items-center w-full">
                                <span className="w-7 text-left">30%</span>
                                <div className="h-px w-full ml-1 bg-[#ece7dc] border-t border-dashed border-[#d8d4ca]" />
                            </div>
                            <div className="flex items-center w-full">
                                <span className="w-7 text-left">15%</span>
                                <div className="h-px w-full ml-1 bg-[#ece7dc] border-t border-dashed border-[#d8d4ca]" />
                            </div>
                            <div className="flex items-center w-full">
                                <span className="w-7 text-left">0%</span>
                                <div className="h-px w-full ml-1 bg-[#d8d4ca]" />
                            </div>
                        </div>

                        {/* Slim Vertical Bars Container Cleanly Anchored on X-Axis Baseline */}
                        <div className="relative h-full w-full flex items-end justify-around px-2 sm:px-6">
                            {TIER_DATA.map((tier) => {
                                const isHovered = hoveredTier?.id === tier.id;
                                const barHeightPct = (tier.percentage / maxScale) * 100;

                                return (
                                    <div
                                        key={tier.id}
                                        onMouseEnter={() => setHoveredTier(tier)}
                                        onMouseLeave={() => setHoveredTier(null)}
                                        className="relative flex flex-col items-center justify-end h-full group cursor-pointer"
                                    >
                                        {/* Tooltip on Hover */}
                                        {isHovered && (
                                            <div className="absolute -top-14 z-30 whitespace-nowrap rounded-lg bg-[#102d49] text-white px-2.5 py-1 text-[10px] shadow-lg pointer-events-none">
                                                <div className="font-bold flex items-center gap-1">
                                                    <span>{tier.label}</span>
                                                    <span className="text-[#d8b45c] font-mono">{tier.percentage}%</span>
                                                </div>
                                                <div className="text-[9px] text-[#e2ddd1]">
                                                    {tier.stateCount} States · {tier.range}
                                                </div>
                                            </div>
                                        )}

                                        {/* Value Label above Bar */}
                                        <span className="text-[10px] font-mono font-bold text-[#17263a] mb-1">
                                            {tier.percentage}%
                                        </span>

                                        {/* Slim Bar (max-w-[32px]) */}
                                        <div
                                            style={{ height: `${barHeightPct}%` }}
                                            className={`w-7 sm:w-8 max-w-[32px] rounded-t-xs transition-all duration-200 ${tier.colorBg} ${isHovered ? "brightness-110 ring-2 ring-[#d8b45c]" : ""
                                                }`}
                                        />

                                        {/* State count label */}
                                        <div className="mt-1.5 text-center text-[10px] font-semibold text-[#536174] whitespace-nowrap">
                                            {tier.stateCount} States
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Matching Color Key Legend Directly Beneath Chart */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#ece7dc]">
                {TIER_DATA.map((tier) => (
                    <div
                        key={tier.id}
                        className="p-1.5 rounded-md bg-[#fbfaf8] border border-[#e2ddd1] text-[10px] flex items-center gap-1.5"
                    >
                        <span className={`h-2.5 w-2.5 rounded-full ${tier.colorBg} shrink-0`} />
                        <div className="truncate">
                            <span className="font-bold text-[#17263a] block leading-tight truncate">
                                {tier.label}
                            </span>
                            <span className="text-[#687487] font-mono text-[9px]">{tier.range}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FundUtilizationPatternChart;
