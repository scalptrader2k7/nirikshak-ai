import React, { useState, useMemo } from "react";
import { DEMO_STATES_DATA, type StateMpladsRecord } from "@/api/demoMpladsData";
import { BarChart3, Info, ArrowRight } from "@/components/shared/Icons";

interface StateAllocationExpenditureChartProps {
    onSelectState?: (stateName: string) => void;
    selectedState?: string | null;
}

export const StateAllocationExpenditureChart: React.FC<StateAllocationExpenditureChartProps> = ({
    onSelectState,
    selectedState: externalSelectedState,
}) => {
    const [stateFilter, setStateFilter] = useState<string>("ALL");
    const [tierFilter, setTierFilter] = useState<string>("ALL");
    const [hoveredState, setHoveredState] = useState<StateMpladsRecord | null>(null);

    // Dynamic filtering of comparative data
    const filteredStates = useMemo(() => {
        let list = [...DEMO_STATES_DATA];

        if (stateFilter !== "ALL") {
            list = list.filter((s) => s.state === stateFilter);
        } else if (externalSelectedState) {
            list = list.filter((s) => s.state === externalSelectedState);
        }

        if (tierFilter !== "ALL") {
            list = list.filter((s) => s.utilizationTier === tierFilter);
        }

        return list.slice(0, 8); // Top 8 visible for clean, readable layout
    }, [stateFilter, externalSelectedState, tierFilter]);

    const totalAllocated = useMemo(() => {
        return filteredStates.reduce((acc, s) => acc + s.allocatedCr, 0).toFixed(1);
    }, [filteredStates]);

    const totalExpended = useMemo(() => {
        return filteredStates.reduce((acc, s) => acc + s.expenditureCr, 0).toFixed(1);
    }, [filteredStates]);

    const handleReset = () => {
        setStateFilter("ALL");
        setTierFilter("ALL");
        if (onSelectState) onSelectState("");
    };

    const hasFilters = stateFilter !== "ALL" || tierFilter !== "ALL" || !!externalSelectedState;

    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs space-y-6">
            {/* Header & Demonstration Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ece7dc] pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102d49]/5 text-[#102d49]">
                        <BarChart3 size={17} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                                State-wise Allocation vs Expenditure
                            </h2>
                            <span className="text-[10px] font-bold text-[#9b7b32] bg-[#fdf9ee] border border-[#d8b45c]/40 px-2 py-0.5 rounded">
                                Demonstration View
                            </span>
                        </div>
                        <p className="text-xs text-[#687487]">
                            Direct paired-bar fiscal comparison of total sanctioned capital against verified public disbursements
                        </p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-xs bg-[#102d49]" />
                        <span className="text-[#17263a]">Sanctioned Allocation (₹ Cr)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-xs bg-[#2f7d5a]" />
                        <span className="text-[#17263a]">Actual Expenditure (₹ Cr)</span>
                    </div>
                </div>
            </div>

            {/* Filter Bar Controls */}
            <div className="rounded-lg border border-[#e2ddd1] bg-[#fbfaf8] p-3.5 flex flex-wrap items-center gap-3">
                {/* State Dropdown Filter */}
                <div className="flex items-center gap-2">
                    <label htmlFor="comp-state-filter" className="text-xs font-bold text-[#536174]">
                        State:
                    </label>
                    <select
                        id="comp-state-filter"
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="h-8 rounded-md border border-[#d8d4ca] bg-white px-2.5 text-xs font-semibold text-[#17263a] focus:border-[#102d49] outline-none cursor-pointer"
                    >
                        <option value="ALL">All States ({DEMO_STATES_DATA.length} Available)</option>
                        {DEMO_STATES_DATA.map((s) => (
                            <option key={s.state} value={s.state}>
                                {s.state}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Utilization Tier Dropdown Filter */}
                <div className="flex items-center gap-2">
                    <label htmlFor="comp-tier-filter" className="text-xs font-bold text-[#536174]">
                        Utilization Category:
                    </label>
                    <select
                        id="comp-tier-filter"
                        value={tierFilter}
                        onChange={(e) => setTierFilter(e.target.value)}
                        className="h-8 rounded-md border border-[#d8d4ca] bg-white px-2.5 text-xs font-semibold text-[#17263a] focus:border-[#102d49] outline-none cursor-pointer"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="HIGH">High Utilizers (85%+)</option>
                        <option value="GOOD">Good Utilizers (70-84%)</option>
                        <option value="MODERATE">Moderate Utilizers (50-69%)</option>
                        <option value="LOW">Low Utilizers (&lt;50%)</option>
                    </select>
                </div>

                {/* Active Filter Metrics & Reset */}
                <div className="flex items-center gap-3 ml-auto text-xs font-mono">
                    <span className="text-[#536174]">
                        Total Sanctioned: <strong className="text-[#102d49]">₹{totalAllocated} Cr</strong>
                    </span>
                    <span className="text-[#536174]">
                        Expended: <strong className="text-[#2f7d5a]">₹{totalExpended} Cr</strong>
                    </span>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-xs font-bold text-[#b91c1c] hover:underline cursor-pointer ml-2"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Actual Grouped Bar Chart */}
            <div className="relative pt-4 pb-2">
                <div className="relative h-64 w-full flex items-end gap-3 sm:gap-6 px-10 border-b border-l border-[#d8d4ca]">
                    {/* Y-Axis Grid Lines (0 to 100 Cr) */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between text-[10px] font-mono text-[#8e897e] -left-10">
                        <div className="flex items-center w-full">
                            <span className="w-9 text-right pr-1">₹100 Cr</span>
                            <div className="h-px w-full bg-[#ece7dc] border-t border-dashed border-[#d8d4ca]" />
                        </div>
                        <div className="flex items-center w-full">
                            <span className="w-9 text-right pr-1">₹75 Cr</span>
                            <div className="h-px w-full bg-[#ece7dc] border-t border-dashed border-[#d8d4ca]" />
                        </div>
                        <div className="flex items-center w-full">
                            <span className="w-9 text-right pr-1">₹50 Cr</span>
                            <div className="h-px w-full bg-[#ece7dc] border-t border-dashed border-[#d8d4ca]" />
                        </div>
                        <div className="flex items-center w-full">
                            <span className="w-9 text-right pr-1">₹25 Cr</span>
                            <div className="h-px w-full bg-[#ece7dc] border-t border-dashed border-[#d8d4ca]" />
                        </div>
                        <div className="flex items-center w-full">
                            <span className="w-9 text-right pr-1">₹0 Cr</span>
                            <div className="h-px w-full bg-[#d8d4ca]" />
                        </div>
                    </div>

                    {/* Grouped Bars */}
                    {filteredStates.map((item) => {
                        const isHovered = hoveredState?.state === item.state;
                        const maxVal = 100; // 100 Cr max baseline
                        const allocHeightPct = Math.min((item.allocatedCr / maxVal) * 100, 100);
                        const expHeightPct = Math.min((item.expenditureCr / maxVal) * 100, 100);

                        return (
                            <div
                                key={item.state}
                                onMouseEnter={() => setHoveredState(item)}
                                onMouseLeave={() => setHoveredState(null)}
                                className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                            >
                                {/* Tooltip */}
                                {isHovered && (
                                    <div className="absolute -top-16 z-20 whitespace-nowrap rounded-lg bg-[#102d49] text-white px-3 py-1.5 text-[11px] shadow-lg pointer-events-none">
                                        <div className="font-bold flex items-center gap-1.5">
                                            <span>{item.state}</span>
                                            <span className="text-[#d8b45c] font-mono">({item.utilizationPct}% Utilized)</span>
                                        </div>
                                        <div className="text-[10px] text-[#e2ddd1] font-mono">
                                            Sanctioned: ₹{item.allocatedCr} Cr · Expended: ₹{item.expenditureCr} Cr
                                        </div>
                                    </div>
                                )}

                                {/* Paired Bars Container */}
                                <div className="flex items-end gap-1 w-full max-w-[52px] justify-center">
                                    {/* Sanctioned Bar */}
                                    <div
                                        style={{ height: `${allocHeightPct}%` }}
                                        className="w-1/2 rounded-t-xs bg-[#102d49] transition-all duration-300 hover:brightness-110"
                                        title={`${item.state} Sanctioned: ₹${item.allocatedCr} Cr`}
                                    />
                                    {/* Expended Bar */}
                                    <div
                                        style={{ height: `${expHeightPct}%` }}
                                        className="w-1/2 rounded-t-xs bg-[#2f7d5a] transition-all duration-300 hover:brightness-110"
                                        title={`${item.state} Expended: ₹${item.expenditureCr} Cr`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* X-Axis State Labels */}
                <div className="flex items-start gap-3 sm:gap-6 px-10 pt-2">
                    {filteredStates.map((item) => (
                        <div
                            key={item.state}
                            className="flex-1 text-center truncate text-[10px] font-semibold text-[#536174]"
                            title={item.state}
                        >
                            {item.state}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footnote */}
            <div className="pt-3 border-t border-[#ece7dc] flex items-center justify-between text-[11px] text-[#687487]">
                <span>Grouped paired bars compare sanctioned allocations with validated disbursements.</span>
                <span className="font-mono text-[10px] text-[#2f7d5a] font-bold">Data Filtered Live</span>
            </div>
        </div>
    );
};

export default StateAllocationExpenditureChart;
