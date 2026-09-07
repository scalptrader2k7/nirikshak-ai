"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "@/components/shared/Icons";
import type { InvestigationCase, PriorityLevel } from "@/api/types";

interface CaseHeaderProps {
    project: InvestigationCase;
}

function getRiskBadge(level: PriorityLevel) {
    switch (level) {
        case "HIGH":
        case "CRITICAL": // Safe mapping strictly for display without displaying "Critical"
            return {
                label: "High Risk",
                classes: "bg-[#fff0e6] text-[#c2410c] border-[#fed7aa]",
            };
        case "MEDIUM":
            return {
                label: "Medium Risk",
                classes: "bg-[#fff4df] text-[#a56a00] border-[#fde68a]",
            };
        case "LOW":
        default:
            return {
                label: "Low Risk",
                classes: "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]",
            };
    }
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({ project }) => {
    const riskBadge = getRiskBadge(project.investigation_priority_level);
    const formattedId = `REC-${String(project.record_id).padStart(5, "0")}`;

    return (
        <div className="space-y-4">
            {/* Breadcrumb & Return to Registry */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-[#536174]">
                    <Link href="/dashboard" className="hover:text-[#174a7e] hover:underline transition">
                        Dashboard
                    </Link>
                    <span>/</span>
                    <Link href="/projects" className="hover:text-[#174a7e] hover:underline transition">
                        Projects
                    </Link>
                    <span>/</span>
                    <span className="font-bold text-[#172033] font-mono">
                        {formattedId}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/evidence"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#174a7e] hover:text-[#123b65] hover:underline transition"
                    >
                        <ArrowLeft size={13} />
                        <span>Back to Evidence Report</span>
                    </Link>
                    <span className="text-[#dfe3e8]">|</span>
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#536174] hover:text-[#172033] hover:underline transition"
                    >
                        <span>Projects Registry</span>
                    </Link>
                </div>
            </div>

            {/* Case Identity Card */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#dfe3e8] pb-4">
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-black text-[#174a7e] text-base">
                                {formattedId}
                            </span>
                            {/* Outlined Rectangular Risk Badge */}
                            <span
                                className={`px-2.5 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider border ${riskBadge.classes}`}
                            >
                                {riskBadge.label}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-[#172033] leading-tight">
                            {project.work || project.title}
                        </h1>
                    </div>

                    {/* Case Status Summary */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="rounded-none border border-[#dfe3e8] bg-[#fafbfc] px-3.5 py-2 text-right">
                            <span className="text-[10px] font-bold text-[#536174] uppercase block tracking-wider">
                                Investigation State
                            </span>
                            <span className="text-xs font-black text-[#174a7e]">
                                ACTIVE SCRUTINY
                            </span>
                        </div>
                    </div>
                </div>

                {/* Structured Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                        <span className="text-[10px] font-bold text-[#536174] block uppercase tracking-wider">
                            State &amp; Constituency
                        </span>
                        <span className="font-bold text-[#172033] mt-0.5 block truncate" title={`${project.constituency}, ${project.state}`}>
                            {project.constituency}, {project.state}
                        </span>
                    </div>

                    <div className="p-3 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                        <span className="text-[10px] font-bold text-[#536174] block uppercase tracking-wider">
                            MP Representative
                        </span>
                        <span className="font-bold text-[#172033] mt-0.5 block truncate" title={project.mp_name}>
                            {project.mp_name || "—"}
                        </span>
                    </div>

                    <div className="p-3 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                        <span className="text-[10px] font-bold text-[#536174] block uppercase tracking-wider">
                            Work Category
                        </span>
                        <span className="font-bold text-[#172033] mt-0.5 block truncate" title={project.work_type}>
                            {project.work_type || "Public Works"}
                        </span>
                    </div>

                    <div className="p-3 rounded-none bg-[#fafbfc] border border-[#dfe3e8]">
                        <span className="text-[10px] font-bold text-[#536174] block uppercase tracking-wider">
                            Sanctioned Allocation
                        </span>
                        <span className="font-mono font-black text-sm text-[#174a7e] mt-0.5 block">
                            {project.allocation_amount
                                ? `₹${(project.allocation_amount / 100000).toFixed(2)} L`
                                : "₹—"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
