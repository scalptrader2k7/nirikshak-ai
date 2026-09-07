import React from "react";
import Link from "next/link";
import { FolderSearch, ArrowRight, Layers } from "@/components/shared/Icons";

interface GeoWorkTypePanelProps {
    totalRecords?: number;
}

const STATE_DATA = [
    { state: "Uttar Pradesh", count: 84, pct: 11.3, riskCount: 22, flagPct: "26.2%" },
    { state: "Maharashtra", count: 76, pct: 10.2, riskCount: 19, flagPct: "25.0%" },
    { state: "West Bengal", count: 64, pct: 8.6, riskCount: 16, flagPct: "25.0%" },
    { state: "Bihar", count: 60, pct: 8.1, riskCount: 15, flagPct: "25.0%" },
    { state: "Tamil Nadu", count: 56, pct: 7.5, riskCount: 14, flagPct: "25.0%" },
    { state: "Madhya Pradesh", count: 52, pct: 7.0, riskCount: 13, flagPct: "25.0%" },
    { state: "Other 22 States & UTs", count: 350, pct: 47.3, riskCount: 86, flagPct: "24.6%" },
];

const WORK_TYPES = [
    { type: "Roads & Pathways", count: 186, pct: 25.1, sanctionedCr: 88.4, riskCount: 48 },
    { type: "Community Infrastructure", count: 142, pct: 19.1, sanctionedCr: 72.8, riskCount: 36 },
    { type: "Water Supply & Sanitation", count: 124, pct: 16.7, sanctionedCr: 58.2, riskCount: 32 },
    { type: "Educational Facilities", count: 96, pct: 12.9, sanctionedCr: 45.6, riskCount: 24 },
    { type: "Public Lighting & Solar", count: 78, pct: 10.5, sanctionedCr: 38.2, riskCount: 18 },
    { type: "Health & Dispensaries", count: 62, pct: 8.4, sanctionedCr: 44.2, riskCount: 15 },
    { type: "Irrigation & Water Conservation", count: 54, pct: 7.3, sanctionedCr: 37.2, riskCount: 12 },
];

export const GeoWorkTypePanel: React.FC<GeoWorkTypePanelProps> = ({
    totalRecords = 742,
}) => {
    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs flex flex-col justify-between h-full space-y-5">
            <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#ece7dc]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102d49]/5 text-[#102d49]">
                            <FolderSearch size={17} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                                Geographic &amp; Sector Intelligence
                            </h2>
                            <p className="text-xs text-[#687487]">
                                Review signal concentration across states and public work categories
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/projects"
                        className="text-xs font-bold text-[#102d49] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
                    >
                        <span>Filter in Projects</span>
                        <ArrowRight size={12} />
                    </Link>
                </div>

                {/* 2-Column Subgrid */}
                <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: State Signal Concentration */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#536174]">
                                Geographic Concentration
                            </h3>
                            <span className="text-[10px] text-[#687487] font-semibold">
                                28 States &amp; UTs
                            </span>
                        </div>

                        <div className="space-y-2">
                            {STATE_DATA.map((item) => {
                                const isOther = item.state.includes("Other");
                                const linkHref = isOther
                                    ? "/projects"
                                    : `/projects?state=${encodeURIComponent(item.state)}`;

                                return (
                                    <Link
                                        key={item.state}
                                        href={linkHref}
                                        className="group flex items-center justify-between p-2.5 rounded-lg bg-[#fbfaf8] border border-[#e2ddd1] hover:border-[#102d49]/40 hover:bg-white transition text-xs"
                                    >
                                        <div>
                                            <span className="font-semibold text-[#17263a] group-hover:text-[#102d49]">
                                                {item.state}
                                            </span>
                                            <span className="text-[10px] text-[#a56a00] font-bold ml-2.5 bg-[#fff4df] px-1.5 py-0.5 rounded">
                                                {item.riskCount} flagged
                                            </span>
                                        </div>
                                        <div className="text-right font-mono font-bold text-[#536174] flex items-center gap-2">
                                            <span>
                                                {item.count}{" "}
                                                <span className="text-[10px] text-[#8e897e]">
                                                    ({item.pct}%)
                                                </span>
                                            </span>
                                            <ArrowRight
                                                size={11}
                                                className="opacity-0 group-hover:opacity-100 text-[#102d49] transition"
                                            />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Sector Category Composition */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#536174]">
                                Work Category Breakdown
                            </h3>
                            <span className="text-[10px] text-[#687487] font-semibold">
                                7 Sectors
                            </span>
                        </div>

                        <div className="space-y-2">
                            {WORK_TYPES.map((item) => (
                                <Link
                                    key={item.type}
                                    href={`/projects?work_type=${encodeURIComponent(item.type)}`}
                                    className="group flex items-center justify-between p-2.5 rounded-lg bg-[#fbfaf8] border border-[#e2ddd1] hover:border-[#102d49]/40 hover:bg-white transition text-xs"
                                >
                                    <div className="truncate mr-2">
                                        <span className="font-semibold text-[#17263a] group-hover:text-[#102d49] truncate block">
                                            {item.type}
                                        </span>
                                        <span className="text-[10px] text-[#536174]">
                                            ₹{item.sanctionedCr} Cr · {item.riskCount} review signals
                                        </span>
                                    </div>
                                    <div className="text-right font-mono font-bold text-[#536174] shrink-0 flex items-center gap-2">
                                        <span>
                                            {item.count}{" "}
                                            <span className="text-[10px] text-[#8e897e]">
                                                ({item.pct}%)
                                            </span>
                                        </span>
                                        <ArrowRight
                                            size={11}
                                            className="opacity-0 group-hover:opacity-100 text-[#102d49] transition"
                                        />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeoWorkTypePanel;
