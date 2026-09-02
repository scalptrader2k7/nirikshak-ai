import React, { useState } from "react";
import Link from "next/link";
import { BarChart3, Info, ArrowRight, RefreshCw } from "@/components/shared/Icons";

interface StateAllocationItem {
    state: string;
    sanctionedCr: number;
    worksCount: number;
    riskCount: number;
    workTypes: string[];
}

const RAW_STATE_DATA: StateAllocationItem[] = [
    {
        state: "Uttar Pradesh",
        sanctionedCr: 95.4,
        worksCount: 184,
        riskCount: 48,
        workTypes: ["Roads & Pathways", "Community Infrastructure", "Water Supply & Sanitation", "Educational Facilities"],
    },
    {
        state: "Maharashtra",
        sanctionedCr: 73.8,
        worksCount: 142,
        riskCount: 36,
        workTypes: ["Roads & Pathways", "Public Lighting", "Community Infrastructure"],
    },
    {
        state: "Rajasthan",
        sanctionedCr: 61.2,
        worksCount: 118,
        riskCount: 31,
        workTypes: ["Community Infrastructure", "Water Supply & Sanitation", "Roads & Pathways"],
    },
    {
        state: "Bihar",
        sanctionedCr: 54.0,
        worksCount: 104,
        riskCount: 28,
        workTypes: ["Educational Facilities", "Roads & Pathways", "Water Supply & Sanitation"],
    },
    {
        state: "Madhya Pradesh",
        sanctionedCr: 49.8,
        worksCount: 96,
        riskCount: 24,
        workTypes: ["Water Supply & Sanitation", "Community Infrastructure", "Roads & Pathways"],
    },
    {
        state: "Karnataka",
        sanctionedCr: 50.4,
        worksCount: 98,
        riskCount: 18,
        workTypes: ["Water Supply & Sanitation", "Public Lighting", "Roads & Pathways"],
    },
];

export const StateAllocationVsExpenditure: React.FC = () => {
    const [selectedState, setSelectedState] = useState<string>("ALL");
    const [selectedWorkType, setSelectedWorkType] = useState<string>("ALL");
    const [selectedPriority, setSelectedPriority] = useState<string>("ALL");

    // Filter logic
    const filteredData = RAW_STATE_DATA.filter((item) => {
        if (selectedState !== "ALL" && item.state !== selectedState) return false;
        if (selectedWorkType !== "ALL" && !item.workTypes.includes(selectedWorkType)) return false;
        return true;
    });

    const totalFilteredSanctioned = filteredData.reduce((acc, curr) => acc + curr.sanctionedCr, 0);
    const totalFilteredWorks = filteredData.reduce((acc, curr) => acc + curr.worksCount, 0);
    const totalFilteredRisk = filteredData.reduce((acc, curr) => acc + curr.riskCount, 0);

    const handleReset = () => {
        setSelectedState("ALL");
        setSelectedWorkType("ALL");
        setSelectedPriority("ALL");
    };

    const hasActiveFilters = selectedState !== "ALL" || selectedWorkType !== "ALL" || selectedPriority !== "ALL";

    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ece7dc] pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102d49]/5 text-[#102d49]">
                        <BarChart3 size={17} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                            State-wise Allocation vs Expenditure
                        </h2>
                        <p className="text-xs text-[#687487]">
                            Multi-dimensional comparative analysis with dynamic state and sector filters
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-[#536174]">Filtered Total:</span>
                    <strong className="text-[#102d49]">₹{totalFilteredSanctioned.toFixed(1)} Cr</strong>
                    <span className="text-[#687487]">({totalFilteredWorks} Works)</span>
                </div>
            </div>

            {/* Filter Bar Controls */}
            <div className="rounded-lg border border-[#e2ddd1] bg-[#fbfaf8] p-3.5 flex flex-wrap items-center gap-3">
                {/* State Filter */}
                <div className="flex items-center gap-2">
                    <label htmlFor="state-filter" className="text-xs font-bold text-[#536174]">
                        State:
                    </label>
                    <select
                        id="state-filter"
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="h-8 rounded-md border border-[#d8d4ca] bg-white px-2.5 text-xs font-semibold text-[#17263a] focus:border-[#102d49] outline-none cursor-pointer"
                    >
                        <option value="ALL">All States (6 Major Regions)</option>
                        {RAW_STATE_DATA.map((s) => (
                            <option key={s.state} value={s.state}>
                                {s.state}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Work Type Filter */}
                <div className="flex items-center gap-2">
                    <label htmlFor="work-filter" className="text-xs font-bold text-[#536174]">
                        Sector:
                    </label>
                    <select
                        id="work-filter"
                        value={selectedWorkType}
                        onChange={(e) => setSelectedWorkType(e.target.value)}
                        className="h-8 rounded-md border border-[#d8d4ca] bg-white px-2.5 text-xs font-semibold text-[#17263a] focus:border-[#102d49] outline-none cursor-pointer"
                    >
                        <option value="ALL">All Work Categories</option>
                        <option value="Roads & Pathways">Roads &amp; Pathways</option>
                        <option value="Community Infrastructure">Community Infrastructure</option>
                        <option value="Water Supply & Sanitation">Water Supply &amp; Sanitation</option>
                        <option value="Public Lighting">Public Lighting</option>
                        <option value="Educational Facilities">Educational Facilities</option>
                    </select>
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-2">
                    <label htmlFor="priority-filter" className="text-xs font-bold text-[#536174]">
                        Priority Tier:
                    </label>
                    <select
                        id="priority-filter"
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="h-8 rounded-md border border-[#d8d4ca] bg-white px-2.5 text-xs font-semibold text-[#17263a] focus:border-[#102d49] outline-none cursor-pointer"
                    >
                        <option value="ALL">All Priority Levels</option>
                        <option value="HIGH">High Priority (Field Verification)</option>
                        <option value="MEDIUM">Medium Priority (Desk Review)</option>
                        <option value="LOW">Low Priority (Standard Monitoring)</option>
                    </select>
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs font-bold text-[#b91c1c] hover:underline cursor-pointer ml-auto"
                    >
                        Reset filters
                    </button>
                )}
            </div>

            {/* Visual Comparative Bars Matrix */}
            <div className="space-y-4">
                {filteredData.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#687487] border border-dashed border-[#d8d4ca] rounded-lg bg-[#fbfaf8]">
                        No state records match the selected filter combination.
                    </div>
                ) : (
                    filteredData.map((item) => {
                        const maxVal = 95.4;
                        const allocationPct = (item.sanctionedCr / maxVal) * 100;

                        return (
                            <div key={item.state} className="p-3.5 rounded-lg border border-[#e2ddd1] bg-[#fbfaf8] space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[#17263a] text-sm">{item.state}</span>
                                        <span className="text-[10px] font-bold text-[#a56a00] bg-[#fff4df] px-2 py-0.5 rounded">
                                            {item.riskCount} flagged for review
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-mono">
                                        <span className="text-[#102d49] font-bold">
                                            Sanctioned: ₹{item.sanctionedCr.toFixed(1)} Cr
                                        </span>
                                        <span className="text-[#687487]">
                                            Exp: <span className="italic font-sans text-[11px] text-[#8e897e]">Not Tracked</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Dual Bar Comparison: Real Sanctioned vs Honest Unavailable Expenditure */}
                                <div className="space-y-1">
                                    {/* Sanctioned Allocation Bar (Real) */}
                                    <div className="h-3 w-full bg-[#ebe8df] rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-[#102d49] rounded-full transition-all duration-500"
                                            style={{ width: `${allocationPct}%` }}
                                            title={`${item.state} Sanctioned: ₹${item.sanctionedCr} Cr`}
                                        />
                                    </div>

                                    {/* Expenditure Bar (Data Limitation) */}
                                    <div className="h-2 w-full bg-[#f0eee6] rounded-full overflow-hidden flex border border-dashed border-[#d8d4ca]">
                                        <div
                                            className="h-full bg-[#c5c0b4] w-0"
                                            title="Expenditure unrecorded in current dataset"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-[#687487]">
                                    <span>{item.worksCount} Monitored Public Works</span>
                                    <Link
                                        href={`/projects?state=${encodeURIComponent(item.state)}`}
                                        className="font-bold text-[#102d49] hover:underline inline-flex items-center gap-1"
                                    >
                                        <span>View {item.state} Case Registry</span>
                                        <ArrowRight size={10} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Data Integrity Footnote */}
            <div className="pt-3 border-t border-[#ece7dc] flex items-center gap-2 text-[11px] text-[#687487]">
                <Info size={14} className="text-[#102d49] shrink-0" />
                <span>
                    <strong>Data Integrity Disclosure:</strong> Actual state-wise disbursements and utilization rates are unrecorded in the baseline MoSPI dataset. Comparative analysis reflects sanctioned allocations across audited constituencies.
                </span>
            </div>
        </div>
    );
};

export default StateAllocationVsExpenditure;
