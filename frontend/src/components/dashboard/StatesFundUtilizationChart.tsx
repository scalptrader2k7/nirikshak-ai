import React, { useState, useMemo } from "react";
import {
    DEMO_STATES_DATA,
    filterStatesByTier,
    type UtilizationTier,
    type StateMpladsRecord,
} from "@/api/demoMpladsData";
import { BarChart3 } from "@/components/shared/Icons";

interface StatesFundUtilizationChartProps {
    onSelectState?: (stateName: string) => void;
    selectedState?: string | null;
}

type ViewMode = "utilization" | "allocation";
type FilterOption = "ALL" | "TOP10" | "HIGH" | "GOOD" | "MODERATE" | "LOW";

export const StatesFundUtilizationChart: React.FC<StatesFundUtilizationChartProps> = ({
    onSelectState,
    selectedState,
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>("utilization");
    const [filterOption, setFilterOption] = useState<FilterOption>("TOP10");
    const [hoveredState, setHoveredState] = useState<StateMpladsRecord | null>(null);

    // Dynamically filter states
    const displayedStates = useMemo(() => {
        return filterStatesByTier(filterOption);
    }, [filterOption]);

    const maxCurrency = 100; // Scale ₹0 to ₹100 Cr for dual axis

    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-5 shadow-xs flex flex-col justify-between h-[390px]">
            <div>
                {/* Header: Clean Title + Controls (View Toggle & Filter Dropdown) */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ece7dc] pb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#102d49]/5 text-[#102d49]">
                            <BarChart3 size={15} />
                        </div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                            States by Fund Utilization
                        </h2>
                    </div>

                    {/* Controls: Tab Toggle [ Utilization View | Allocation View ] + Filter Dropdown */}
                    <div className="flex items-center gap-2">
                        {/* View Toggle Tabs */}
                        <div className="flex items-center rounded-lg border border-[#e2ddd1] bg-[#fbfaf8] p-0.5">
                            <button
                                type="button"
                                onClick={() => setViewMode("utilization")}
                                className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${viewMode === "utilization"
                                        ? "bg-[#102d49] text-white shadow-xs"
                                        : "text-[#536174] hover:text-[#17263a]"
                                    }`}
                            >
                                Utilization View
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("allocation")}
                                className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${viewMode === "allocation"
                                        ? "bg-[#2f7d5a] text-white shadow-xs"
                                        : "text-[#536174] hover:text-[#17263a]"
                                    }`}
                            >
                                Allocation View
                            </button>
                        </div>

                        {/* Single Filter Dropdown Menu */}
                        <select
                            value={filterOption}
                            onChange={(e) => setFilterOption(e.target.value as FilterOption)}
                            className="h-7.5 rounded-lg border border-[#d8d4ca] bg-[#fbfaf8] px-2.5 text-xs font-semibold text-[#17263a] focus:border-[#102d49] outline-none cursor-pointer"
                        >
                            <option value="ALL">All States ({DEMO_STATES_DATA.length})</option>
                            <option value="TOP10">Top 10 States</option>
                            <option value="HIGH">High Utilization (85%+)</option>
                            <option value="GOOD">Good Utilization (70–84%)</option>
                            <option value="MODERATE">Moderate Utilization (50–69%)</option>
                            <option value="LOW">Low Utilization (&lt;50%)</option>
                        </select>
                    </div>
                </div>

                {/* Series Legend */}
                <div className="flex items-center justify-end gap-3 text-[10px] font-bold text-[#536174] pt-2">
                    {viewMode === "utilization" ? (
                        <>
                            <div className="flex items-center gap-1">
                                <span className="h-2.5 w-2.5 rounded-xs bg-[#174a7e]" />
                                <span>Utilization % (Bars)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-3 border-t-2 border-dashed border-[#102d49]" />
                                <span>Allocated (₹Cr)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-3 border-t-2 border-[#2f7d5a]" />
                                <span>Spent (₹Cr)</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-xs bg-[#2f7d5a]" />
                            <span>Sanctioned Allocation (₹ Cr)</span>
                        </div>
                    )}
                </div>

                {/* Dual-Axis SVG & HTML Chart Area */}
                <div className="relative pt-3 pb-8 mt-1">
                    <div className="relative h-48 w-full px-8">
                        {/* Y-Axis Grid Lines & Labels */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-[10px] font-mono text-[#8e897e] left-0 right-0">
                            <div className="flex items-center w-full justify-between">
                                <span className="w-7 text-left text-[#17263a] font-bold">
                                    {viewMode === "utilization" ? "100%" : "₹100Cr"}
                                </span>
                                <div className="h-px w-full mx-1.5 bg-[#ece7dc] border-t border-dashed border-[#d8d4ca]" />
                                <span className="w-9 text-right text-[#536174]">
                                    {viewMode === "utilization" ? "₹100Cr" : "100%"}
                                </span>
                            </div>
                            <div className="flex items-center w-full justify-between">
                                <span className="w-7 text-left text-[#17263a] font-bold">
                                    {viewMode === "utilization" ? "75%" : "₹75Cr"}
                                </span>
                                <div className="h-px w-full mx-1.5 bg-[#ece7dc] border-t border-dashed border-[#d8d4ca]" />
                                <span className="w-9 text-right text-[#536174]">
                                    {viewMode === "utilization" ? "₹75Cr" : "75%"}
                                </span>
                            </div>
                            <div className="flex items-center w-full justify-between">
                                <span className="w-7 text-left text-[#17263a] font-bold">
                                    {viewMode === "utilization" ? "50%" : "₹50Cr"}
                                </span>
                                <div className="h-px w-full mx-1.5 bg-[#ece7dc] border-t border-dashed border-[#d8d4ca]" />
                                <span className="w-9 text-right text-[#536174]">
                                    {viewMode === "utilization" ? "₹50Cr" : "50%"}
                                </span>
                            </div>
                            <div className="flex items-center w-full justify-between">
                                <span className="w-7 text-left text-[#17263a] font-bold">
                                    {viewMode === "utilization" ? "25%" : "₹25Cr"}
                                </span>
                                <div className="h-px w-full mx-1.5 bg-[#ece7dc] border-t border-dashed border-[#d8d4ca]" />
                                <span className="w-9 text-right text-[#536174]">
                                    {viewMode === "utilization" ? "₹25Cr" : "25%"}
                                </span>
                            </div>
                            <div className="flex items-center w-full justify-between">
                                <span className="w-7 text-left text-[#17263a] font-bold">
                                    {viewMode === "utilization" ? "0%" : "₹0Cr"}
                                </span>
                                <div className="h-px w-full mx-1.5 bg-[#d8d4ca]" />
                                <span className="w-9 text-right text-[#536174]">
                                    {viewMode === "utilization" ? "₹0Cr" : "0%"}
                                </span>
                            </div>
                        </div>

                        {/* Relative Bars & Line Layer */}
                        <div className="relative h-full w-full flex items-end justify-between">
                            {/* Overlay Line Series (Allocated vs Spent) - Rendered ONLY in Utilization View, without dots */}
                            {viewMode === "utilization" && (
                                <svg className="absolute inset-0 h-full w-full pointer-events-none z-10 overflow-visible">
                                    {/* Dashed line for Allocated (₹Cr) */}
                                    <polyline
                                        fill="none"
                                        stroke="#102d49"
                                        strokeWidth="1.75"
                                        strokeDasharray="4 4"
                                        points={displayedStates
                                            .map((s, idx) => {
                                                const total = displayedStates.length;
                                                const x = ((idx + 0.5) / total) * 100;
                                                const y = 100 - (s.allocatedCr / maxCurrency) * 100;
                                                return `${x}%,${y}%`;
                                            })
                                            .join(" ")}
                                    />

                                    {/* Solid line for Spent (₹Cr) */}
                                    <polyline
                                        fill="none"
                                        stroke="#2f7d5a"
                                        strokeWidth="2"
                                        points={displayedStates
                                            .map((s, idx) => {
                                                const total = displayedStates.length;
                                                const x = ((idx + 0.5) / total) * 100;
                                                const y = 100 - (s.expenditureCr / maxCurrency) * 100;
                                                return `${x}%,${y}%`;
                                            })
                                            .join(" ")}
                                    />
                                </svg>
                            )}

                            {/* Clean Vertical Bars Anchored at 0% Baseline */}
                            {displayedStates.map((item) => {
                                const isSelected = selectedState === item.state;
                                const isHovered = hoveredState?.state === item.state;

                                const barHeightPct =
                                    viewMode === "utilization"
                                        ? item.utilizationPct
                                        : Math.min((item.allocatedCr / maxCurrency) * 100, 100);

                                // Original NIRIKSHAK color hierarchy
                                let barColor = "bg-[#174a7e]";
                                if (viewMode === "utilization") {
                                    if (item.utilizationTier === "GOOD") barColor = "bg-[#2f7d5a]";
                                    else if (item.utilizationTier === "MODERATE") barColor = "bg-[#a56a00]";
                                    else if (item.utilizationTier === "LOW") barColor = "bg-[#c2410c]";
                                } else {
                                    barColor = "bg-[#2f7d5a]";
                                }

                                if (isSelected) barColor = "bg-[#d8b45c]";

                                return (
                                    <div
                                        key={item.state}
                                        onMouseEnter={() => setHoveredState(item)}
                                        onMouseLeave={() => setHoveredState(null)}
                                        onClick={() => onSelectState && onSelectState(item.state)}
                                        className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer px-0.5"
                                    >
                                        {/* Hover Tooltip */}
                                        {isHovered && (
                                            <div className="absolute -top-14 z-30 whitespace-nowrap rounded-lg bg-[#102d49] text-white px-2.5 py-1 text-[10px] shadow-lg pointer-events-none">
                                                <div className="font-bold flex items-center gap-1">
                                                    <span>{item.state}</span>
                                                    <span className="text-[#d8b45c] font-mono">{item.utilizationPct}%</span>
                                                </div>
                                                <div className="text-[9px] text-[#e2ddd1] font-mono">
                                                    Alloc: ₹{item.allocatedCr} Cr · Spent: ₹{item.expenditureCr} Cr
                                                </div>
                                            </div>
                                        )}

                                        {/* The Clean Vertical Bar */}
                                        <div
                                            style={{ height: `${barHeightPct}%` }}
                                            className={`w-full max-w-[24px] rounded-t-xs transition-all duration-200 ${barColor} ${isSelected ? "ring-2 ring-[#d8b45c]" : ""
                                                } ${isHovered ? "brightness-110" : ""}`}
                                        />

                                        {/* Diagonally Rotated X-Axis Labels (-45 deg with proper alignment) */}
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
                                            <span
                                                className={`inline-block transform -rotate-45 origin-top-left text-[9px] font-semibold transition whitespace-nowrap ${isSelected
                                                        ? "text-[#102d49] font-black underline"
                                                        : "text-[#536174] group-hover:text-[#102d49]"
                                                    }`}
                                            >
                                                {item.state}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatesFundUtilizationChart;
