import React from "react";
import Link from "next/link";
import {
    ShieldAlert,
    FolderSearch,
    FileText,
    Activity,
    ArrowRight,
} from "@/components/shared/Icons";
import type { DetectorName, StatisticsResponse } from "@/api/types";

interface DetectorMixProps {
    stats: StatisticsResponse;
}

interface DetectorItem {
    id: DetectorName;
    name: string;
    description: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    accentColor: string;
    bgSoft: string;
}

const DETECTORS: DetectorItem[] = [
    {
        id: "cost",
        name: "Cost Anomaly Engine",
        description: "Unusual project amount compared with relevant reference values.",
        icon: Activity,
        accentColor: "text-[#c2410c]",
        bgSoft: "bg-[#fff0e6]",
    },
    {
        id: "exact_duplicate",
        name: "Exact Duplicate Detector",
        description: "Records matching another work closely enough to warrant review.",
        icon: FileText,
        accentColor: "text-[#b91c1c]",
        bgSoft: "bg-[#fbe9e9]",
    },
    {
        id: "near_duplicate",
        name: "Near Duplicate Engine",
        description: "Similar records identified through matching signals.",
        icon: FolderSearch,
        accentColor: "text-[#a56a00]",
        bgSoft: "bg-[#fff4df]",
    },
    {
        id: "pattern",
        name: "Pattern Anomaly Engine",
        description: "Other structured anomaly patterns identified by the detection system.",
        icon: ShieldAlert,
        accentColor: "text-[#102d49]",
        bgSoft: "bg-[#e8f0f8]",
    },
];

export const DetectorMix: React.FC<DetectorMixProps> = ({ stats }) => {
    const total = stats.total_records || 742;
    const dist = stats.detector_distribution;

    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#ece7dc]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102d49]/5 text-[#102d49]">
                            <ShieldAlert size={17} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                                Anomaly Detector Mix
                            </h2>
                            <p className="text-xs text-[#687487]">
                                Multi-detector signals triggering structured human review
                            </p>
                        </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#536174] bg-[#f4f2ec] px-2 py-0.5 rounded">
                        4 Active Detectors
                    </span>
                </div>

                {/* Detector Cards Grid */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DETECTORS.map((d) => {
                        const count = dist[d.id] || 0;
                        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
                        const Icon = d.icon;

                        return (
                            <Link
                                key={d.id}
                                href={`/projects?detector=${d.id}`}
                                className="group p-3.5 rounded-lg border border-[#e2ddd1] bg-[#fbfaf8] hover:border-[#102d49]/40 hover:bg-white transition flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`p-1.5 rounded-md ${d.bgSoft} ${d.accentColor}`}>
                                                <Icon size={14} />
                                            </span>
                                            <span className="text-xs font-bold text-[#17263a] group-hover:text-[#102d49] transition">
                                                {d.name}
                                            </span>
                                        </div>

                                        <span className="text-xs font-mono font-black text-[#17263a]">
                                            {count}
                                        </span>
                                    </div>

                                    <p className="mt-2.5 text-[11px] leading-relaxed text-[#687487] line-clamp-2">
                                        {d.description}
                                    </p>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-[#ece7dc] flex items-center justify-between text-[10px]">
                                    <span className="text-[#687487] font-medium">
                                        {pct}% of dataset flagged
                                    </span>
                                    <span className="text-[#102d49] font-semibold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                        Filter <ArrowRight size={11} />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Footnote */}
            <div className="mt-5 pt-4 border-t border-[#ece7dc] text-[11px] text-[#687487] flex items-center gap-2 leading-tight">
                <span className="h-1.5 w-1.5 rounded-full bg-[#102d49] shrink-0" />
                <span>
                    Detector signals indicate inconsistencies for review. No detector proves fraud.
                </span>
            </div>
        </div>
    );
};

export default DetectorMix;
