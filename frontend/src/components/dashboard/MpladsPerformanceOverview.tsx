import React from "react";
import Link from "next/link";
import {
    Activity,
    Database,
    BarChart3,
    Check,
    Info,
    ArrowRight,
} from "@/components/shared/Icons";

interface StateFundData {
    state: string;
    allocatedCr: number;
    worksCount: number;
    riskCount: number;
    pctShare: number;
}

const TOP_STATES_ALLOCATION: StateFundData[] = [
    { state: "Uttar Pradesh", allocatedCr: 95.4, worksCount: 184, riskCount: 48, pctShare: 24.8 },
    { state: "Maharashtra", allocatedCr: 73.8, worksCount: 142, riskCount: 36, pctShare: 19.2 },
    { state: "Rajasthan", allocatedCr: 61.2, worksCount: 118, riskCount: 31, pctShare: 15.9 },
    { state: "Bihar", allocatedCr: 54.0, worksCount: 104, riskCount: 28, pctShare: 14.0 },
    { state: "Madhya Pradesh", allocatedCr: 49.8, worksCount: 96, riskCount: 24, pctShare: 13.0 },
    { state: "Karnataka & Others", allocatedCr: 50.4, worksCount: 98, riskCount: 18, pctShare: 13.1 },
];

const SECTOR_PATTERNS = [
    { sector: "Roads, Bridges & Pathways", share: 33.4, amountCr: 128.5, barColor: "bg-[#102d49]" },
    { sector: "Community Halls & Centers", share: 25.1, amountCr: 96.5, barColor: "bg-[#174a7e]" },
    { sector: "Drinking Water & Sanitation", share: 19.4, amountCr: 74.6, barColor: "bg-[#2f7d5a]" },
    { sector: "Solar Lighting & Energy", share: 13.2, amountCr: 50.8, barColor: "bg-[#a56a00]" },
    { sector: "Educational & Health Facilities", share: 8.9, amountCr: 34.2, barColor: "bg-[#9b7b32]" },
];

export const MpladsPerformanceOverview: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d8d4ca] pb-3">
                <div className="flex items-center gap-2.5">
                    <span className="h-4 w-1 bg-[#102d49] rounded-full" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                        MPLADS Performance Overview &amp; Fund Allocation Patterns
                    </h2>
                </div>
                <span className="text-xs text-[#687487]">
                    Monitored Scheme Baseline · 742 Works (₹384.6 Cr Sanctioned)
                </span>
            </div>

            {/* Scheme Performance Metrics Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-[#d8d4ca] bg-white p-4.5 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-[#536174]">
                        Average Project Value
                    </span>
                    <div className="mt-2 text-2xl font-black font-mono text-[#17263a]">
                        ₹51.8 L
                    </div>
                    <p className="mt-1 text-[11px] text-[#687487]">Mean sanctioned cost per record</p>
                </div>

                <div className="rounded-xl border border-[#d8d4ca] bg-white p-4.5 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-[#536174]">
                        Median Allocation Baseline
                    </span>
                    <div className="mt-2 text-2xl font-black font-mono text-[#17263a]">
                        ₹28.5 L
                    </div>
                    <p className="mt-1 text-[11px] text-[#687487]">50th percentile reference point</p>
                </div>

                <div className="rounded-xl border border-[#d8d4ca] bg-white p-4.5 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-[#536174]">
                        High-Value Works (&gt; ₹1 Cr)
                    </span>
                    <div className="mt-2 text-2xl font-black font-mono text-[#102d49]">
                        48 <span className="text-xs font-semibold text-[#687487]">(6.5%)</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#687487]">Major public infrastructure works</p>
                </div>

                <div className="rounded-xl border border-[#d8d4ca] bg-white p-4.5 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-[#a56a00]">
                        Scheme Triage Rate
                    </span>
                    <div className="mt-2 text-2xl font-black font-mono text-[#a56a00]">
                        24.9%
                    </div>
                    <p className="mt-1 text-[11px] text-[#687487]">185 works under active audit triage</p>
                </div>
            </div>

            {/* 2-Column Visualization Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. States by Fund Allocation / Utilization */}
                <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-[#ece7dc]">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102d49]/5 text-[#102d49]">
                                    <BarChart3 size={17} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                                        States by Fund Allocation
                                    </h3>
                                    <p className="text-xs text-[#687487]">
                                        Comparative aggregate sanctioned public allocation across top states
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#102d49] bg-[#f4f2ec] px-2 py-0.5 rounded">
                                Total: ₹384.6 Cr
                            </span>
                        </div>

                        {/* Visual Comparative Bars */}
                        <div className="mt-5 space-y-3.5">
                            {TOP_STATES_ALLOCATION.map((item) => (
                                <div key={item.state} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-[#17263a]">{item.state}</span>
                                        <span className="font-mono font-bold text-[#102d49]">
                                            ₹{item.allocatedCr.toFixed(1)} Cr{" "}
                                            <span className="text-[10px] text-[#687487] font-normal">
                                                ({item.worksCount} works · {item.riskCount} flagged)
                                            </span>
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-[#f4f2ec] overflow-hidden">
                                        <div
                                            className="h-full bg-[#102d49] rounded-full transition-all duration-500"
                                            style={{ width: `${(item.allocatedCr / 95.4) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data Limitation Notice */}
                    <div className="mt-5 pt-3.5 border-t border-[#ece7dc] text-[11px] text-[#687487] flex items-center gap-2 bg-[#f8f7f3] -mx-6 -mb-6 p-4 rounded-b-xl border-t">
                        <Info size={14} className="text-[#102d49] shrink-0" />
                        <span>
                            <strong>Data Honesty:</strong> State-wise expenditure and utilization percentages are unrecorded in current dataset. Values reflect sanctioned public allocation.
                        </span>
                    </div>
                </div>

                {/* 2. Fund Allocation & Sector Utilization Pattern */}
                <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-[#ece7dc]">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102d49]/5 text-[#102d49]">
                                    <Activity size={17} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                                        Fund Utilization Pattern
                                    </h3>
                                    <p className="text-xs text-[#687487]">
                                        Sector-wise capital allocation rhythm and category distribution
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#2f7d5a] bg-[#eaf5ef] px-2 py-0.5 rounded">
                                5 Key Sectors
                            </span>
                        </div>

                        {/* Stacked Proportional Sector Bar */}
                        <div className="mt-5">
                            <div className="h-4 w-full rounded-full bg-[#f4f2ec] overflow-hidden flex shadow-inner mb-4">
                                {SECTOR_PATTERNS.map((sec) => (
                                    <div
                                        key={sec.sector}
                                        style={{ width: `${sec.share}%` }}
                                        className={`${sec.barColor}`}
                                        title={`${sec.sector}: ${sec.share}% (₹${sec.amountCr} Cr)`}
                                    />
                                ))}
                            </div>

                            {/* Sector Breakdown List */}
                            <div className="space-y-2">
                                {SECTOR_PATTERNS.map((sec) => (
                                    <div
                                        key={sec.sector}
                                        className="flex items-center justify-between p-2 rounded bg-[#fbfaf8] border border-[#e2ddd1] text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`h-2.5 w-2.5 rounded-full ${sec.barColor}`} />
                                            <span className="font-semibold text-[#17263a]">{sec.sector}</span>
                                        </div>
                                        <div className="text-right font-mono font-bold text-[#102d49]">
                                            ₹{sec.amountCr} Cr{" "}
                                            <span className="text-[10px] text-[#687487] font-normal">
                                                ({sec.share}%)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Policy Footnote */}
                    <div className="mt-5 pt-3.5 border-t border-[#ece7dc] text-[11px] text-[#687487] flex items-center justify-between">
                        <span>Roads and Community Infrastructure account for 58.5% of total allocation</span>
                        <Link href="/projects" className="font-bold text-[#102d49] hover:underline inline-flex items-center gap-1">
                            <span>Inspect Records</span>
                            <ArrowRight size={11} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MpladsPerformanceOverview;
