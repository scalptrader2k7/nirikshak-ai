import React from "react";
import Link from "next/link";
import { Activity, ArrowRight, Info } from "@/components/shared/Icons";

interface CostAnomalyPanelProps {
    costCount?: number;
}

export const CostAnomalyPanel: React.FC<CostAnomalyPanelProps> = ({
    costCount = 68,
}) => {
    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#ece7dc]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff0e6] text-[#c2410c]">
                            <Activity size={17} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                                Financial &amp; Cost Anomaly Signals
                            </h2>
                            <p className="text-xs text-[#687487]">
                                Allocations exhibiting statistical divergence from peer group benchmarks
                            </p>
                        </div>
                    </div>

                    <span className="text-xs font-mono font-black text-[#c2410c] bg-[#fff0e6] px-2 py-0.5 rounded">
                        {costCount} Flagged Works
                    </span>
                </div>

                {/* Content */}
                <div className="mt-5 space-y-3">
                    <div className="p-3.5 rounded-lg border border-[#e2ddd1] bg-[#fbfaf8]">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#17263a]">
                                Cost variation requiring review
                            </span>
                            <span className="text-[10px] font-bold text-[#c2410c] bg-[#fff0e6] px-2 py-0.5 rounded">
                                +140% Deviation
                            </span>
                        </div>
                        <p className="text-[11px] text-[#687487] mt-1.5 leading-relaxed">
                            REC-01042 (Varanasi CC Road) allocation of ₹25.00 L significantly exceeds the district median benchmark of ₹8.90 L for equivalent category works.
                        </p>
                        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#ece7dc] text-[11px]">
                            <span className="text-[#687487] font-mono">Peer baseline: ₹8.90 L</span>
                            <Link href="/projects/1042" className="font-bold text-[#102d49] hover:underline inline-flex items-center gap-1">
                                <span>Inspect Case</span>
                                <ArrowRight size={11} />
                            </Link>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-[#e2ddd1] bg-[#fbfaf8]">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#17263a]">
                                Unit rate disparity signal
                            </span>
                            <span className="text-[10px] font-bold text-[#c2410c] bg-[#fff0e6] px-2 py-0.5 rounded">
                                +95% Deviation
                            </span>
                        </div>
                        <p className="text-[11px] text-[#687487] mt-1.5 leading-relaxed">
                            REC-01201 (Patna School Boundary Wall) unit cost estimate exceeds the state standard schedule of rates by 1.95x.
                        </p>
                        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#ece7dc] text-[11px]">
                            <span className="text-[#687487] font-mono">Peer baseline: ₹6.15 L</span>
                            <Link href="/projects/1201" className="font-bold text-[#102d49] hover:underline inline-flex items-center gap-1">
                                <span>Inspect Case</span>
                                <ArrowRight size={11} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Limitation Disclosure */}
            <div className="mt-5 pt-3.5 border-t border-[#ece7dc] text-[11px] text-[#687487] flex items-center gap-2 bg-[#f8f7f3] -mx-6 -mb-6 p-4 rounded-b-xl border-t">
                <Info size={14} className="text-[#102d49] shrink-0" />
                <span className="leading-tight">
                    <strong>Data Honesty:</strong> Expenditure comparison is not available in the current dataset. Cost variations reflect sanctioned allocation versus peer medians.
                </span>
            </div>
        </div>
    );
};

export default CostAnomalyPanel;
