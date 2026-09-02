"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    FileText,
    Database,
    ClipboardCheck,
} from "@/components/shared/Icons";
import { ReportsSection } from "@/components/reports/ReportsSection";
import { DataIssuesSection } from "@/components/reports/DataIssuesSection";
import { SubmissionsSection } from "@/components/reports/SubmissionsSection";

import { useLanguage } from "@/i18n/LanguageContext";

type ReportsTabKey = "reports" | "data-issues" | "submissions";

function ReportsAndDataContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const router = useRouter();

    const tabParam = searchParams.get("tab") as ReportsTabKey | null;
    const subParam = searchParams.get("sub") as "intake" | "issue" | null;
    const formParam = searchParams.get("form") as "data-issue" | "feedback" | null;

    const [activeTab, setActiveTab] = useState<ReportsTabKey>(
        tabParam === "data-issues" || tabParam === "submissions" ? tabParam : "reports"
    );

    useEffect(() => {
        if (tabParam && (tabParam === "reports" || tabParam === "data-issues" || tabParam === "submissions")) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const handleTabChange = (newTab: ReportsTabKey) => {
        setActiveTab(newTab);
        router.push(`/reports?tab=${newTab}`, { scroll: false });
    };

    return (
        <div className="space-y-6 pb-16">
            {/* Header Area: Sibling Headings & Workspace Navigation Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#dfe3e8] pb-4">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                        {activeTab === "reports" && t("reports.title", "Reports & Documentation")}
                        {activeTab === "data-issues" && t("reports.tab_data_issues", "Data & Issues")}
                        {activeTab === "submissions" && t("reports.tab_submissions", "Submissions Log")}
                    </h1>
                    <p className="text-xs text-[#536174]">
                        {activeTab === "reports" && t("reports.desc", "Manage formal investigation dossiers, inspect verification briefs, export audit summaries, and print documentation.")}
                        {activeTab === "data-issues" && "Ingest multi-format scheme datasets and submit data issue reports or platform feedback."}
                        {activeTab === "submissions" && "Track the processing status, resolution timeline, and audit state of previous submissions."}
                    </p>
                </div>

                {/* Level 1 Sibling Navigation Controls */}
                <div className="inline-flex rounded-none border border-[#dfe3e8] bg-[#f1f3f6] p-1 gap-1 self-start md:self-auto shrink-0">
                    <button
                        type="button"
                        onClick={() => handleTabChange("reports")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold transition rounded-none cursor-pointer ${
                            activeTab === "reports"
                                ? "bg-[#174a7e] text-white shadow-xs"
                                : "text-[#536174] hover:text-[#172033] hover:bg-white/60"
                        }`}
                    >
                        <FileText size={13} />
                        <span>{t("reports.tab_reports", "Reports")}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange("data-issues")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold transition rounded-none cursor-pointer ${
                            activeTab === "data-issues"
                                ? "bg-[#174a7e] text-white shadow-xs"
                                : "text-[#536174] hover:text-[#172033] hover:bg-white/60"
                        }`}
                    >
                        <Database size={13} />
                        <span>{t("reports.tab_data_issues", "Data & Issues")}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleTabChange("submissions")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold transition rounded-none cursor-pointer ${
                            activeTab === "submissions"
                                ? "bg-[#174a7e] text-white shadow-xs"
                                : "text-[#536174] hover:text-[#172033] hover:bg-white/60"
                        }`}
                    >
                        <ClipboardCheck size={13} />
                        <span>{t("reports.tab_submissions", "Submissions")}</span>
                    </button>
                </div>
            </div>

            {/* Main Section Content */}
            {activeTab === "reports" && <ReportsSection />}

            {activeTab === "data-issues" && (
                <DataIssuesSection
                    initialSubTab={subParam === "issue" ? "issue" : "intake"}
                    initialIssueForm={formParam === "feedback" ? "feedback" : "data-issue"}
                />
            )}

            {activeTab === "submissions" && <SubmissionsSection />}
        </div>
    );
}

export default function ReportsAndDataPage() {
    return (
        <Suspense fallback={<div className="py-12 text-center text-xs text-[#536174]">Loading reports workspace...</div>}>
            <ReportsAndDataContent />
        </Suspense>
    );
}
