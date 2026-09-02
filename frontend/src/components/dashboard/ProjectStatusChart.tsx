import React, { useState } from "react";
import { Check, ShieldAlert, Activity, Clock, Info } from "@/components/shared/Icons";

interface ProjectStatusChartProps {
    onSelectStatus?: (status: string | null) => void;
    activeStatusFilter?: string | null;
}

interface StatusItem {
    id: string;
    label: string;
    count: number;
    pct: number;
    description: string;
    color: string;
    badgeBg: string;
    badgeText: string;
    icon: typeof Check;
}

const STATUS_ITEMS: StatusItem[] = [
    {
        id: "COMPLETED",
        label: "Completed & Verified",
        count: 412,
        pct: 55.5,
        description: "Physical works completed with completion certificate on file",
        color: "bg-[#2f7d5a]",
        badgeBg: "bg-[#eaf5ef]",
        badgeText: "text-[#2f7d5a]",
        icon: Check,
    },
    {
        id: "ONGOING",
        label: "Active Field Execution",
        count: 145,
        pct: 19.5,
        description: "Works currently underway within standard timeline",
        color: "bg-[#102d49]",
        badgeBg: "bg-[#e8f0f8]",
        badgeText: "text-[#102d49]",
        icon: Activity,
    },
    {
        id: "FLAGGED",
        label: "Under Anomaly Triage",
        count: 185,
        pct: 24.9,
        description: "Records prioritized for desk audit and physical field review",
        color: "bg-[#a56a00]",
        badgeBg: "bg-[#fff4df]",
        badgeText: "text-[#a56a00]",
        icon: ShieldAlert,
    },
];

export const ProjectStatusChart: React.FC<ProjectStatusChartProps> = ({
    onSelectStatus,
    activeStatusFilter,
}) => {
    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ece7dc] pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102d49]/5 text-[#102d49]">
                        <Clock size={17} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                            Project Status &amp; Milestone Distribution
                        </h2>
                        <p className="text-xs text-[#687487]">
                            Portfolio execution health across 742 sanctioned public works
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#536174]">Total Tracked:</span>
                    <strong className="text-xs font-mono font-black text-[#17263a]">742 Works</strong>
                    {activeStatusFilter && (
                        <button
                            type="button"
                            onClick={() => onSelectStatus && onSelectStatus(null)}
                            className="text-xs font-bold text-[#b91c1c] hover:underline cursor-pointer ml-2"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Segmented Distribution Chart Bar */}
            <div className="space-y-2">
                <div className="h-4 w-full rounded-full bg-[#f4f2ec] overflow-hidden flex shadow-inner">
                    {STATUS_ITEMS.map((item) => (
                        <div
                            key={item.id}
                            style={{ width: `${item.pct}%` }}
                            className={`${item.color} transition-all duration-300`}
                            title={`${item.label}: ${item.count} (${item.pct}%)`}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#687487]">
                    <span>55.5% Completed &amp; Verified</span>
                    <span>19.5% Active Execution</span>
                    <span>24.9% Under Triage</span>
                </div>
            </div>

            {/* Interactive Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {STATUS_ITEMS.map((item) => {
                    const isSelected = activeStatusFilter === item.id;
                    const IconComponent = item.icon;

                    return (
                        <div
                            key={item.id}
                            onClick={() => onSelectStatus && onSelectStatus(isSelected ? null : item.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                                    ? "border-[#102d49] bg-[#fbfaf8] ring-2 ring-[#102d49]/10 shadow-xs"
                                    : "border-[#e2ddd1] bg-[#fbfaf8] hover:border-[#102d49]/40 hover:bg-white"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-md ${item.badgeBg} ${item.badgeText}`}>
                                        <IconComponent size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-[#17263a]">{item.label}</span>
                                </div>
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${item.badgeBg} ${item.badgeText}`}>
                                    {item.pct}%
                                </span>
                            </div>

                            <div className="text-xl font-black font-mono text-[#17263a] mb-1">
                                {item.count} <span className="text-xs font-normal text-[#687487]">works</span>
                            </div>

                            <p className="text-[11px] text-[#687487] leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Governance Note */}
            <div className="pt-3 border-t border-[#ece7dc] flex items-center gap-2 text-[11px] text-[#687487]">
                <Info size={14} className="text-[#102d49] shrink-0" />
                <span>
                    Project status reflects official administrative records combined with NIRIKSHAK anomaly risk tags.
                </span>
            </div>
        </div>
    );
};

export default ProjectStatusChart;
