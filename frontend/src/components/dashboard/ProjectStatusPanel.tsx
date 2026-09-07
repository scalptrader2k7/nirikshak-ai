import React from "react";
import Link from "next/link";
import { Database, Check, Info, Upload } from "@/components/shared/Icons";

export const ProjectStatusPanel: React.FC = () => {
    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs flex flex-col justify-between h-full">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#ece7dc]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102d49]/5 text-[#102d49]">
                            <Database size={17} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                                Project Status &amp; Data Coverage
                            </h2>
                            <p className="text-xs text-[#687487]">
                                Transparent accounting of monitored fields vs unrecorded milestones
                            </p>
                        </div>
                    </div>

                    <span className="text-[10px] font-bold text-[#2f7d5a] bg-[#eaf5ef] px-2 py-0.5 rounded">
                        100% Contract Fidelity
                    </span>
                </div>

                {/* Coverage Matrix */}
                <div className="mt-5 space-y-2.5">
                    {/* Tracked Fields */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#d8d4ca]/60 bg-[#fbfaf8] text-xs">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eaf5ef] text-[#2f7d5a]">
                                <Check size={12} />
                            </span>
                            <div>
                                <p className="font-bold text-[#17263a]">Sanction Records &amp; Allocations</p>
                                <p className="text-[10px] text-[#687487]">742 verified project entries</p>
                            </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#2f7d5a]">Complete</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#d8d4ca]/60 bg-[#fbfaf8] text-xs">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eaf5ef] text-[#2f7d5a]">
                                <Check size={12} />
                            </span>
                            <div>
                                <p className="font-bold text-[#17263a]">MP &amp; Geographic Location Mapping</p>
                                <p className="text-[10px] text-[#687487]">Constituency, state &amp; district</p>
                            </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#2f7d5a]">Complete</span>
                    </div>

                    {/* Untracked Milestone Fields (Explicit Data Honesty) */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-dashed border-[#c5c0b4] bg-[#f8f7f3] text-xs">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ebe7dc] text-[#687487]">
                                <Info size={12} />
                            </span>
                            <div>
                                <p className="font-bold text-[#536174]">Physical Progress Percentage</p>
                                <p className="text-[10px] text-[#687487]">Execution progress is not tracked in current dataset</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#536174] bg-[#ebe7dc] px-1.5 py-0.5 rounded">Not Tracked</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-dashed border-[#c5c0b4] bg-[#f8f7f3] text-xs">
                        <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ebe7dc] text-[#687487]">
                                <Info size={12} />
                            </span>
                            <div>
                                <p className="font-bold text-[#536174]">Project Delay Days &amp; Milestones</p>
                                <p className="text-[10px] text-[#687487]">Delay days are not tracked in current dataset</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#536174] bg-[#ebe7dc] px-1.5 py-0.5 rounded">Not Tracked</span>
                    </div>
                </div>
            </div>

            {/* Bottom Callout */}
            <div className="mt-5 pt-3.5 border-t border-[#ece7dc] flex items-center justify-between text-xs text-[#687487]">
                <span className="text-[11px]">Field inspection CSV imports can activate progress tracking</span>
                <Link
                    href="/upload"
                    className="font-bold text-[#102d49] hover:underline inline-flex items-center gap-1 shrink-0"
                >
                    <Upload size={12} />
                    <span>Upload CSV</span>
                </Link>
            </div>
        </div>
    );
};

export default ProjectStatusPanel;
