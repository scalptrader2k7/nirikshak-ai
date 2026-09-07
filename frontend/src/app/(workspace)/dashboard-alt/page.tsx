"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Activity,
    ShieldAlert,
    Database,
    FileText,
    FolderSearch,
    AlertTriangle,
    Info,
    ArrowRight,
    Check,
} from "@/components/shared/Icons";
import type { StatisticsResponse } from "@/api/types";

// Baseline Alternative Dashboard directly implementing All_Screen_Build_Prompts_1.md §3 specifications
export default function DashboardAltPage() {
    const stats: StatisticsResponse = {
        total_records: 742,
        investigation_cases: 185,
        priority_distribution: {
            CRITICAL: 0,
            HIGH: 10,
            MEDIUM: 175,
            LOW: 557,
        },
        detector_distribution: {
            cost: 68,
            exact_duplicate: 34,
            near_duplicate: 89,
            pattern: 42,
        },
        score: {
            min: 12.4,
            max: 88.7,
            mean: 34.2,
            median: 28.5,
        },
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                        MPLADS Oversight Dashboard
                    </h1>
                    <p className="text-xs text-text-secondary mt-1">
                        Executive summary &amp; anomaly detection triage matrix
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#e8f0f8] text-[#174a7e] border border-[#174a7e]/20">
                        Prompt Specification Baseline
                    </span>
                </div>
            </div>

            {/* 1. Six Exact KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Total Projects */}
                <div className="rounded-lg border border-border bg-surface p-4 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-text-secondary">
                        Total Projects
                    </span>
                    <div className="mt-2 text-2xl font-black font-mono text-text-primary">
                        {stats.total_records}
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted">742 Monitored Works</p>
                </div>

                {/* Total Sanctioned Amount */}
                <div className="rounded-lg border border-border bg-surface p-4 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-text-secondary">
                        Sanctioned Amount
                    </span>
                    <div className="mt-2 text-2xl font-black font-mono text-text-primary">
                        ₹384.6 Cr
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted">Cumulative allocation</p>
                </div>

                {/* Total Expenditure (Explicit Data Gap) */}
                <div className="rounded-lg border border-dashed border-[#c8ced6] bg-[#f8fafc] p-4 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-text-muted">
                        Expenditure
                    </span>
                    <div className="mt-2 text-xs font-semibold text-[#536071] bg-[#eaeff5] px-2 py-1 rounded inline-block">
                        Not tracked in dataset
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted">Field disbursement pending</p>
                </div>

                {/* Utilisation % (Explicit Data Gap) */}
                <div className="rounded-lg border border-dashed border-[#c8ced6] bg-[#f8fafc] p-4 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-text-muted">
                        Utilisation %
                    </span>
                    <div className="mt-2 text-xs font-semibold text-[#536071] bg-[#eaeff5] px-2 py-1 rounded inline-block">
                        Not tracked in dataset
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted">Requires expenditure data</p>
                </div>

                {/* Projects at Risk */}
                <div className="rounded-lg border border-border bg-surface p-4 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-[#a56a00]">
                        Projects at Risk
                    </span>
                    <div className="mt-2 text-2xl font-black font-mono text-[#a56a00]">
                        185
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted">Medium + High priority</p>
                </div>

                {/* Critical Anomalies (Real 0) */}
                <div className="rounded-lg border border-border bg-surface p-4 shadow-xs">
                    <span className="text-[11px] font-bold uppercase text-[#b91c1c]">
                        Critical Anomalies
                    </span>
                    <div className="mt-2 text-2xl font-black font-mono text-text-primary">
                        0
                    </div>
                    <p className="mt-1 text-[10px] text-text-muted">No critical overrides</p>
                </div>
            </div>

            {/* 2. Grid Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution */}
                <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
                    <h2 className="text-sm font-bold text-text-primary mb-3">
                        Risk Level Distribution
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs p-2 rounded bg-[#eaf5ef] text-[#2f7d5a] font-bold">
                            <span>Low Risk (557 cases)</span>
                            <span>75.1%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs p-2 rounded bg-[#fff4df] text-[#a56a00] font-bold">
                            <span>Medium Risk (175 cases)</span>
                            <span>23.6%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs p-2 rounded bg-[#fff0e6] text-[#c2410c] font-bold">
                            <span>High Risk (10 cases)</span>
                            <span>1.3%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs p-2 rounded bg-[#fbe9e9] text-[#b91c1c] font-bold">
                            <span>Critical Risk (0 cases)</span>
                            <span>0.0%</span>
                        </div>
                    </div>
                </div>

                {/* Anomaly Detectors */}
                <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
                    <h2 className="text-sm font-bold text-text-primary mb-3">
                        Anomaly Signal Categories
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded border border-border bg-surface-subtle">
                            <span className="text-xs font-bold text-[#c2410c]">Cost Outliers</span>
                            <div className="text-xl font-mono font-black mt-1">68</div>
                            <span className="text-[10px] text-text-muted">9.2% of dataset</span>
                        </div>
                        <div className="p-3 rounded border border-border bg-surface-subtle">
                            <span className="text-xs font-bold text-[#b91c1c]">Exact Duplicates</span>
                            <div className="text-xl font-mono font-black mt-1">34</div>
                            <span className="text-[10px] text-text-muted">4.6% of dataset</span>
                        </div>
                        <div className="p-3 rounded border border-border bg-surface-subtle">
                            <span className="text-xs font-bold text-[#a56a00]">Near-Duplicates</span>
                            <div className="text-xl font-mono font-black mt-1">89</div>
                            <span className="text-[10px] text-text-muted">12.0% of dataset</span>
                        </div>
                        <div className="p-3 rounded border border-border bg-surface-subtle">
                            <span className="text-xs font-bold text-[#174a7e]">Pattern Anomalies</span>
                            <div className="text-xl font-mono font-black mt-1">42</div>
                            <span className="text-[10px] text-text-muted">5.7% of dataset</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Delayed Projects Panel (Honest Data Gap) & Recent Review Activity (Mock) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Delayed Projects */}
                <div className="rounded-lg border border-dashed border-[#c8ced6] bg-[#f8fafc] p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-bold text-text-muted">
                            Delayed Projects Breakdown
                        </h2>
                        <span className="text-[10px] font-bold text-[#536071] bg-[#eaeff5] px-2 py-0.5 rounded">
                            Not tracked in dataset
                        </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-2">
                        Physical progress milestone dates and delay calculations are absent from the baseline 742-record MoSPI dataset. This panel will activate upon field inspection CSV uploads.
                    </p>
                </div>

                {/* Recent Review Activity (Explicit MOCK label) */}
                <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-text-primary">
                            Recent Review Activity
                        </h2>
                        <span className="text-[10px] font-bold text-[#748092] bg-surface-muted px-2 py-0.5 rounded">
                            Demo Mock
                        </span>
                    </div>
                    <div className="space-y-2 text-xs text-text-secondary">
                        <div className="flex items-center justify-between p-2 rounded bg-surface-subtle">
                            <span>Audit Officer assigned physical inspection for REC-01042</span>
                            <span className="text-[10px] text-text-muted">10m ago</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-surface-subtle">
                            <span>Document voucher requested for Pune Public Lighting REC-01089</span>
                            <span className="text-[10px] text-text-muted">1h ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
