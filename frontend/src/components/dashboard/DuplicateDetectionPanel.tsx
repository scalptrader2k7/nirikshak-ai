import React from "react";
import Link from "next/link";
import { FolderSearch, FileText, ArrowRight } from "@/components/shared/Icons";

interface DuplicateDetectionPanelProps {
    exactCount?: number;
    nearCount?: number;
}

export const DuplicateDetectionPanel: React.FC<DuplicateDetectionPanelProps> = ({
    exactCount = 34,
    nearCount = 89,
}) => {
    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#ece7dc]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fbe9e9] text-[#b91c1c]">
                            <FileText size={17} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                                Duplicate &amp; Near-Duplicate Works
                            </h2>
                            <p className="text-xs text-[#687487]">
                                Textual, geographical, and budget line redundancy signals
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#b91c1c] bg-[#fbe9e9] px-2 py-0.5 rounded">
                            {exactCount} Exact
                        </span>
                        <span className="text-[10px] font-bold text-[#a56a00] bg-[#fff4df] px-2 py-0.5 rounded">
                            {nearCount} Near
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-5 space-y-3">
                    <div className="p-3.5 rounded-lg border border-[#e2ddd1] bg-[#fbfaf8]">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#17263a]">
                                Potential exact duplicate signal
                            </span>
                            <span className="text-[10px] font-bold text-[#b91c1c] bg-[#fbe9e9] px-2 py-0.5 rounded">
                                100% Parameter Match
                            </span>
                        </div>
                        <p className="text-[11px] text-[#687487] mt-1.5 leading-relaxed">
                            REC-01089 (Pune Solar Street Lighting) matches identical title, ward, and ₹18.00 L sanction approved in FY 2023-24 under REC-00941.
                        </p>
                        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#ece7dc] text-[11px]">
                            <span className="text-[#687487] font-mono">Paired with REC-00941</span>
                            <Link href="/projects/1089" className="font-bold text-[#102d49] hover:underline inline-flex items-center gap-1">
                                <span>Inspect Case</span>
                                <ArrowRight size={11} />
                            </Link>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-[#e2ddd1] bg-[#fbfaf8]">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#17263a]">
                                Near-duplicate description cluster
                            </span>
                            <span className="text-[10px] font-bold text-[#a56a00] bg-[#fff4df] px-2 py-0.5 rounded">
                                91% Semantic Overlap
                            </span>
                        </div>
                        <p className="text-[11px] text-[#687487] mt-1.5 leading-relaxed">
                            REC-01154 (Indore Drinking Water Tube Well) shows high textual overlap with 2 adjacent village pipeline sanctions.
                        </p>
                        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#ece7dc] text-[11px]">
                            <span className="text-[#687487] font-mono">Cluster size: 3 works</span>
                            <Link href="/projects/1154" className="font-bold text-[#102d49] hover:underline inline-flex items-center gap-1">
                                <span>Inspect Case</span>
                                <ArrowRight size={11} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Explanatory Footnote */}
            <div className="mt-5 pt-3.5 border-t border-[#ece7dc] text-[11px] text-[#687487] flex items-center gap-2 bg-[#f8f7f3] -mx-6 -mb-6 p-4 rounded-b-xl border-t">
                <span className="h-1.5 w-1.5 rounded-full bg-[#102d49] shrink-0" />
                <span className="leading-tight">
                    Duplicate signals warrant verification of geographic GPS coordinates and work order numbers to rule out recurring administrative entries.
                </span>
            </div>
        </div>
    );
};

export default DuplicateDetectionPanel;
