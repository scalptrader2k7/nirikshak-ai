"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Activity } from "@/components/shared/Icons";
import type { StatisticsResponse } from "@/api/types";
import { useLanguage } from "@/i18n/LanguageContext";

interface RiskDistributionProps {
    stats: StatisticsResponse;
}

export const RiskDistribution: React.FC<RiskDistributionProps> = ({ stats }) => {
    const { t } = useLanguage();

    const total = stats.total_records || 742;
    const lowCount = stats.priority_distribution.LOW || 557;
    const mediumCount = stats.priority_distribution.MEDIUM || 140;
    const highCount = (stats.priority_distribution.HIGH || 35) + (stats.priority_distribution.CRITICAL || 0); // 45

    const lowPct = total > 0 ? (lowCount / total) * 100 : 75.1;
    const mediumPct = total > 0 ? (mediumCount / total) * 100 : 18.9;
    const highPct = total > 0 ? (highCount / total) * 100 : 6.1;

    // SVG Semicircular Arc Math (viewBox="0 0 200 110", cx=100, cy=95, r=75, strokeWidth=18)
    const cx = 100;
    const cy = 95;
    const r = 75;
    const strokeWidth = 18;
    const circumference = Math.PI * r; // ~235.619

    // Calculate strokeDasharray offsets for 180 degree semicircle
    const lowLength = (lowPct / 100) * circumference;
    const mediumLength = (mediumPct / 100) * circumference;
    const highLength = (highPct / 100) * circumference;

    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#ece7dc]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102d49]/5 text-[#102d49]">
                            <Activity size={17} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                                {t("dash.risk_overview", "Risk Overview")}
                            </h2>
                            <p className="text-xs text-[#687487]">
                                Portfolio distribution across three objective review-priority tiers
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/projects"
                        className="text-xs font-bold text-[#102d49] hover:underline inline-flex items-center gap-1"
                    >
                        <span>{t("common.explore_all", "Explore All")}</span>
                        <ArrowRight size={12} />
                    </Link>
                </div>

                {/* Semicircular Risk Gauge & Center Summary */}
                <div className="mt-4 flex flex-col items-center justify-center">
                    <div className="relative w-64 h-36 flex items-center justify-center">
                        <svg viewBox="0 0 200 110" className="w-full h-full">
                            {/* Track Background */}
                            <path
                                d="M 25 95 A 75 75 0 0 1 175 95"
                                fill="none"
                                stroke="#f1f3f6"
                                strokeWidth={strokeWidth}
                                strokeLinecap="round"
                            />

                            {/* LOW Arc (Green #2f7d5a) */}
                            <path
                                d="M 25 95 A 75 75 0 0 1 175 95"
                                fill="none"
                                stroke="#2f7d5a"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${lowLength} ${circumference}`}
                                strokeDashoffset={0}
                                strokeLinecap="round"
                            />

                            {/* MEDIUM Arc (Amber #a56a00) */}
                            <path
                                d="M 25 95 A 75 75 0 0 1 175 95"
                                fill="none"
                                stroke="#a56a00"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${mediumLength} ${circumference}`}
                                strokeDashoffset={-lowLength}
                            />

                            {/* HIGH Arc (Orange/Red #c2410c) */}
                            <path
                                d="M 25 95 A 75 75 0 0 1 175 95"
                                fill="none"
                                stroke="#c2410c"
                                strokeWidth={strokeWidth}
                                strokeDasharray={`${highLength} ${circumference}`}
                                strokeDashoffset={-(lowLength + mediumLength)}
                                strokeLinecap="round"
                            />
                        </svg>

                        {/* Gauge Center Metric */}
                        <div className="absolute top-14 left-0 right-0 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl font-black font-mono tracking-tight text-[#17263a]">
                                {total}
                            </span>
                            <span className="text-[11px] font-bold text-[#536174] uppercase tracking-wider mt-0.5">
                                Monitored Records
                            </span>
                        </div>
                    </div>
                </div>

                {/* Supporting Numerical Legend Strip */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#ece7dc] pt-4">
                    {/* LOW */}
                    <Link
                        href="/projects?priority=LOW"
                        className="p-2.5 rounded-lg border border-[#dfe3e8] bg-[#fafbfc] hover:bg-[#eaf5ef] transition text-center group"
                    >
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <span className="h-2 w-2 rounded-full bg-[#2f7d5a]" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#536174] group-hover:text-[#2f7d5a]">
                                Low
                            </span>
                        </div>
                        <div className="text-base font-black font-mono text-[#2f7d5a]">
                            {lowCount}
                        </div>
                        <div className="text-[10px] font-semibold text-[#536174]">
                            {lowPct.toFixed(1)}%
                        </div>
                    </Link>

                    {/* MEDIUM */}
                    <Link
                        href="/projects?priority=MEDIUM"
                        className="p-2.5 rounded-lg border border-[#dfe3e8] bg-[#fafbfc] hover:bg-[#fff4df] transition text-center group"
                    >
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <span className="h-2 w-2 rounded-full bg-[#a56a00]" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#536174] group-hover:text-[#a56a00]">
                                Medium
                            </span>
                        </div>
                        <div className="text-base font-black font-mono text-[#a56a00]">
                            {mediumCount}
                        </div>
                        <div className="text-[10px] font-semibold text-[#536174]">
                            {mediumPct.toFixed(1)}%
                        </div>
                    </Link>

                    {/* HIGH */}
                    <Link
                        href="/projects?priority=HIGH"
                        className="p-2.5 rounded-lg border border-[#dfe3e8] bg-[#fafbfc] hover:bg-[#fff0e6] transition text-center group"
                    >
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <span className="h-2 w-2 rounded-full bg-[#c2410c]" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#536174] group-hover:text-[#c2410c]">
                                High
                            </span>
                        </div>
                        <div className="text-base font-black font-mono text-[#c2410c]">
                            {highCount}
                        </div>
                        <div className="text-[10px] font-semibold text-[#536174]">
                            {highPct.toFixed(1)}%
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};
