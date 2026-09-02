"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    FileText,
    Shield,
} from "@/components/shared/Icons";
import { ProjectInvestigationView } from "@/components/investigation/ProjectInvestigationView";
import { EvidenceRepositoryView } from "@/components/evidence/EvidenceRepositoryView";

import { useLanguage } from "@/i18n/LanguageContext";

type WorkspaceMode = "report" | "case";

function EvidenceInvestigationContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const modeParam = searchParams.get("mode") as WorkspaceMode | null;
    const caseIdParam = searchParams.get("caseId") || searchParams.get("id");
    const initialCaseId = caseIdParam ? parseInt(caseIdParam.replace(/\D/g, ""), 10) : 1;

    // Default mode is strictly "report" (Evidence Report)
    const [mode, setMode] = useState<WorkspaceMode>(
        modeParam === "case" ? "case" : "report"
    );
    const [selectedCaseId, setSelectedCaseId] = useState<number>(
        isNaN(initialCaseId) || initialCaseId <= 0 ? 1 : initialCaseId
    );

    const handleOpenCase = (projectId: number) => {
        setSelectedCaseId(projectId);
        setMode("case");
    };

    const handleBackToReport = () => {
        setMode("report");
    };

    return (
        <div className="space-y-6 pb-16">
            {/* Header Area: Sibling Headings & Internal Workspace Navigation Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#dfe3e8] pb-4">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                        {mode === "report"
                            ? "Evidence Report & Filed Cases"
                            : "Project Case"}
                    </h1>
                    <p className="text-xs text-[#536174]">
                        {mode === "report"
                            ? "Search, discover, and trace documentary evidence and intake signals across all monitored scheme works."
                            : "Detailed scrutiny and verification workspace for an individual monitored project/case."}
                    </p>
                </div>

                {/* Sized Internal Navigation Controls */}
                <div className="inline-flex rounded-none border border-[#dfe3e8] bg-[#f1f3f6] p-1 gap-1 self-start md:self-auto shrink-0">
                    <button
                        type="button"
                        onClick={() => setMode("report")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold transition rounded-none cursor-pointer ${
                            mode === "report"
                                ? "bg-[#174a7e] text-white shadow-xs"
                                : "text-[#536174] hover:text-[#172033] hover:bg-white/60"
                        }`}
                    >
                        <FileText size={13} />
                        <span>Evidence Report</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode("case")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold transition rounded-none cursor-pointer ${
                            mode === "case"
                                ? "bg-[#174a7e] text-white shadow-xs"
                                : "text-[#536174] hover:text-[#172033] hover:bg-white/60"
                        }`}
                    >
                        <Shield size={13} />
                        <span>Project Case</span>
                    </button>
                </div>
            </div>

            {/* Mode-Specific Content */}
            {mode === "report" ? (
                <EvidenceRepositoryView onOpenCase={handleOpenCase} />
            ) : (
                <ProjectInvestigationView
                    initialRecordId={selectedCaseId}
                    onBackToEvidenceReport={handleBackToReport}
                />
            )}
        </div>
    );
}

export default function EvidenceInvestigationPage() {
    return (
        <Suspense fallback={<div className="py-12 text-center text-xs text-[#536174]">Loading workspace...</div>}>
            <EvidenceInvestigationContent />
        </Suspense>
    );
}
