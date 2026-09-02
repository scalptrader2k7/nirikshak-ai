"use client";

import React, { useState } from "react";
import {
    Upload,
    AlertTriangle,
    FileText,
} from "@/components/shared/Icons";
import { DataIntakeWorkflow } from "./DataIntakeWorkflow";
import { ReportDataIssueForm } from "./ReportDataIssueForm";
import { GiveFeedbackForm } from "./GiveFeedbackForm";

interface DataIssuesSectionProps {
    initialSubTab?: "intake" | "issue";
    initialIssueForm?: "data-issue" | "feedback";
}

export const DataIssuesSection: React.FC<DataIssuesSectionProps> = ({
    initialSubTab = "intake",
    initialIssueForm = "data-issue",
}) => {
    const [subTab, setSubTab] = useState<"intake" | "issue">(initialSubTab);
    const [issueFormType, setIssueFormType] = useState<"data-issue" | "feedback">(initialIssueForm);

    return (
        <div className="space-y-6">
            {/* Level 2 Sub-Navigation: Data Intake vs Report an Issue */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dfe3e8] pb-3">
                <div className="inline-flex rounded-none border border-[#dfe3e8] bg-[#f1f3f6] p-1 gap-1 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setSubTab("intake")}
                        className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold transition rounded-none cursor-pointer ${
                            subTab === "intake"
                                ? "bg-[#174a7e] text-white shadow-xs"
                                : "text-[#536174] hover:text-[#172033] hover:bg-white/60"
                        }`}
                    >
                        <Upload size={13} />
                        <span>Data Intake</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setSubTab("issue")}
                        className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold transition rounded-none cursor-pointer ${
                            subTab === "issue"
                                ? "bg-[#174a7e] text-white shadow-xs"
                                : "text-[#536174] hover:text-[#172033] hover:bg-white/60"
                        }`}
                    >
                        <AlertTriangle size={13} />
                        <span>Report an Issue</span>
                    </button>
                </div>

                {/* Level 3 Sub-Navigation only when Report an Issue is active */}
                {subTab === "issue" && (
                    <div className="inline-flex rounded-none border border-[#dfe3e8] bg-white p-1 gap-1 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setIssueFormType("data-issue")}
                            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold transition rounded-none cursor-pointer ${
                                issueFormType === "data-issue"
                                    ? "bg-[#174a7e] text-white"
                                    : "text-[#536174] hover:text-[#172033] hover:bg-[#f1f3f6]"
                            }`}
                        >
                            <span>Report Data Issue</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIssueFormType("feedback")}
                            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold transition rounded-none cursor-pointer ${
                                issueFormType === "feedback"
                                    ? "bg-[#174a7e] text-white"
                                    : "text-[#536174] hover:text-[#172033] hover:bg-[#f1f3f6]"
                            }`}
                        >
                            <span>Give Feedback</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Sub-tab Content */}
            {subTab === "intake" && <DataIntakeWorkflow />}

            {subTab === "issue" && (
                <div>
                    {issueFormType === "data-issue" ? (
                        <ReportDataIssueForm />
                    ) : (
                        <GiveFeedbackForm />
                    )}
                </div>
            )}
        </div>
    );
};
