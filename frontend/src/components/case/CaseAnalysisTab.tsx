"use client";

import React from "react";
import {
    BarChart3,
} from "@/components/shared/Icons";
import type { EnrichedCaseDetail } from "./demoCaseDetailAdapter";

interface CaseAnalysisTabProps {
    data: EnrichedCaseDetail;
}

export const CaseAnalysisTab: React.FC<CaseAnalysisTabProps> = ({ data }) => {
    const { peer_benchmark, rate_audit_items, is_demo_scenario } = data;

    return (
        <div className="space-y-6 pt-4">
            {/* Section 6: Peer Benchmark Analysis */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dfe3e8] pb-3">
                    <div className="flex items-center gap-2 text-[#172033]">
                        <BarChart3 size={17} className="text-[#174a7e]" />
                        <h2 className="text-sm font-bold uppercase tracking-wider">
                            Peer Benchmark &amp; Comparative Context
                        </h2>
                    </div>
                    <span className="text-[11px] font-mono text-[#536174]">
                        Scope: {peer_benchmark.peer_scope} ({peer_benchmark.peer_count} peer works)
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                        <span className="text-[10px] font-bold text-[#536174] uppercase block tracking-wider">
                            Project Allocation
                        </span>
                        <span className="font-mono font-black text-base text-[#174a7e] mt-1 block">
                            ₹{((peer_benchmark.project_amount || 0) / 100000).toFixed(2)} L
                        </span>
                        <span className="text-[10px] text-[#536174] mt-1 block">
                            Recorded Sanction
                        </span>
                    </div>

                    <div className="p-3.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                        <span className="text-[10px] font-bold text-[#536174] uppercase block tracking-wider">
                            District Peer Median
                        </span>
                        <span className="font-mono font-black text-base text-[#172033] mt-1 block">
                            ₹{((peer_benchmark.peer_median || 0) / 100000).toFixed(2)} L
                        </span>
                        <span className="text-[10px] text-[#536174] mt-1 block">
                            Mean: ₹{((peer_benchmark.peer_mean || 0) / 100000).toFixed(2)} L
                        </span>
                    </div>

                    <div className="p-3.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                        <span className="text-[10px] font-bold text-[#536174] uppercase block tracking-wider">
                            Amount Deviation
                        </span>
                        <span
                            className={`font-mono font-black text-base mt-1 block ${
                                peer_benchmark.amount_deviation_percent > 30
                                    ? "text-[#c2410c]"
                                    : peer_benchmark.amount_deviation_percent > 10
                                    ? "text-[#a56a00]"
                                    : "text-[#2f7d5a]"
                            }`}
                        >
                            {peer_benchmark.amount_deviation_percent > 0 ? "+" : ""}
                            {peer_benchmark.amount_deviation_percent}%
                        </span>
                        <span className="text-[10px] text-[#536174] mt-1 block">
                            vs peer group median
                        </span>
                    </div>

                    <div className="p-3.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                        <span className="text-[10px] font-bold text-[#536174] uppercase block tracking-wider">
                            Ratio to Median
                        </span>
                        <span className="font-mono font-black text-base text-[#172033] mt-1 block">
                            {peer_benchmark.amount_ratio_to_median}x
                        </span>
                        <span className="text-[10px] text-[#536174] mt-1 block">
                            Relative scale factor
                        </span>
                    </div>
                </div>

                {/* Calculation Methodology Disclosure */}
                <div className="p-3 rounded-none bg-[#f1f3f6] border border-[#dfe3e8] text-[11px] text-[#536174] space-y-1">
                    <span className="font-bold text-[#172033] block">
                        Transparent Calculation Methodology:
                    </span>
                    <p className="font-mono text-[10px]">
                        Deviation (%) = ((Recorded Allocation − Peer Median) / Peer Median) × 100
                    </p>
                    <p className="italic">
                        * A high deviation indicates that recorded project cost is materially above the available peer range. It warrants contextual verification against technical specifications rather than assuming wrongdoing.
                    </p>
                </div>
            </div>

            {/* Section 5: Invoice / Rate Audit Table */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dfe3e8] pb-3">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-[#172033]">
                            <h3 className="text-sm font-bold uppercase tracking-wider">
                                Line-Item Rate Audit
                            </h3>
                            {is_demo_scenario && (
                                <span className="text-[11px] font-mono text-[#536174]">
                                    (Benchmark Audit Comparison)
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-[#536174]">
                            Compares reported itemized unit rates against prevailing District Schedule of Rates (DSR) baselines.
                        </p>
                    </div>
                </div>

                {/* Dense Government-Style Table with #174a7e Header */}
                <div className="overflow-x-auto border border-[#dfe3e8] rounded-none">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-[#174a7e] text-white">
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Item Description
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider text-right">
                                    Quantity
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider text-right">
                                    Reported Rate
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider text-right">
                                    Reference Rate (DSR)
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider text-right">
                                    Deviation
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                    Verification Notes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dfe3e8] bg-white">
                            {rate_audit_items.map((item) => {
                                const statusBadge =
                                    item.status === "Verified"
                                        ? "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]"
                                        : item.status === "Deviation Observed"
                                        ? "bg-[#fff0e6] text-[#c2410c] border-[#fed7aa]"
                                        : "bg-[#f1f3f6] text-[#536174] border-[#dfe3e8]";

                                return (
                                    <tr key={item.id} className="hover:bg-[#fafbfc] transition">
                                        <td className="py-2.5 px-3 font-medium text-[#172033] max-w-xs">
                                            {item.item_description}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono text-[#536174]">
                                            {item.quantity} {item.unit}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#172033]">
                                            ₹{item.reported_rate.toLocaleString()}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono text-[#536174]">
                                            {item.reference_rate ? `₹${item.reference_rate.toLocaleString()}` : "—"}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                                            {item.deviation_percent !== null ? (
                                                <span
                                                    className={
                                                        item.deviation_percent > 20
                                                            ? "text-[#c2410c]"
                                                            : item.deviation_percent > 5
                                                            ? "text-[#a56a00]"
                                                            : "text-[#2f7d5a]"
                                                    }
                                                >
                                                    {item.deviation_percent > 0 ? "+" : ""}
                                                    {item.deviation_percent}%
                                                </span>
                                            ) : (
                                                <span className="text-[#536174]">—</span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3">
                                            <span
                                                className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-[#536174] text-[11px] leading-tight">
                                            {item.notes}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <p className="text-[11px] text-[#536174] italic">
                    * Entire table rows are strictly non-clickable. Reference rates are sourced from standard district schedule benchmarks.
                </p>
            </div>
        </div>
    );
};
