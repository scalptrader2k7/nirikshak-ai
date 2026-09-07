"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    ShieldAlert,
    ArrowLeft,
} from "@/components/shared/Icons";
import apiClient from "@/api/client";
import { DEMO_PROJECTS_CORPUS } from "@/api/demoProjectsData";
import { getEnrichedCaseDetail, type EnrichedCaseDetail } from "@/components/case/demoCaseDetailAdapter";
import { CaseHeader } from "@/components/case/CaseHeader";
import { CaseTabs, type CaseTabKey } from "@/components/case/CaseTabs";
import { CaseOverviewTab } from "@/components/case/CaseOverviewTab";
import { CaseAnalysisTab } from "@/components/case/CaseAnalysisTab";
import { CaseEvidenceTab } from "@/components/case/CaseEvidenceTab";
import { CaseVerificationTab } from "@/components/case/CaseVerificationTab";
import { CaseHistoryTab } from "@/components/case/CaseHistoryTab";

interface ProjectInvestigationViewProps {
    initialRecordId?: number;
    onBackToEvidenceReport?: () => void;
}

export const ProjectInvestigationView: React.FC<ProjectInvestigationViewProps> = ({
    initialRecordId = 1,
    onBackToEvidenceReport,
}) => {
    const [selectedRecordId, setSelectedRecordId] = useState<number>(initialRecordId);
    const [activeTab, setActiveTab] = useState<CaseTabKey>("overview");
    const [caseData, setCaseData] = useState<EnrichedCaseDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [customNotes, setCustomNotes] = useState<Array<{ text: string; timestamp: string }>>([]);
    const [searchIdInput, setSearchIdInput] = useState<string>("");

    // Quick selection cases (e.g. top flagged cases)
    const priorityCases = DEMO_PROJECTS_CORPUS.slice(0, 15);

    useEffect(() => {
        if (initialRecordId && initialRecordId !== selectedRecordId) {
            setSelectedRecordId(initialRecordId);
        }
    }, [initialRecordId]);

    useEffect(() => {
        setLoading(true);
        // Attempt to fetch from API, fallback to demo detail adapter
        apiClient
            .getCase(selectedRecordId)
            .then((res) => {
                if (res && res.data) {
                    const enriched = getEnrichedCaseDetail(selectedRecordId);
                    if (enriched) {
                        enriched.case = res.data;
                        setCaseData(enriched);
                    } else {
                        setCaseData(getEnrichedCaseDetail(selectedRecordId));
                    }
                } else {
                    setCaseData(getEnrichedCaseDetail(selectedRecordId));
                }
            })
            .catch(() => {
                setCaseData(getEnrichedCaseDetail(selectedRecordId));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [selectedRecordId]);

    const handleAddNote = (noteText: string) => {
        const newEntry = {
            text: noteText,
            timestamp:
                new Date().toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                }) + " IST",
        };
        setCustomNotes((prev) => [newEntry, ...prev]);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(searchIdInput.replace(/\D/g, ""), 10);
        if (!isNaN(num) && num > 0) {
            setSelectedRecordId(num);
            setSearchIdInput("");
        }
    };

    return (
        <div className="space-y-5">
            {/* Top Toolbar: Back Navigation & Case Quick-Picker */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                    {onBackToEvidenceReport && (
                        <button
                            type="button"
                            onClick={onBackToEvidenceReport}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#174a7e] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition cursor-pointer"
                        >
                            <ArrowLeft size={13} />
                            <span>Back to Evidence Report</span>
                        </button>
                    )}

                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[#172033] uppercase tracking-wider text-[11px]">
                            Select Project Case:
                        </span>
                        <select
                            value={selectedRecordId}
                            onChange={(e) => setSelectedRecordId(parseInt(e.target.value, 10))}
                            className="text-xs font-bold py-1.5 pl-3 pr-8 border border-[#dfe3e8] bg-[#fafbfc] text-[#174a7e] rounded-none focus:outline-none focus:ring-1 focus:ring-[#174a7e] cursor-pointer"
                        >
                            {priorityCases.map((p) => (
                                <option key={p.record_id} value={p.record_id}>
                                    REC-{String(p.record_id).padStart(5, "0")} · {p.work_type} ({p.constituency})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Direct ID Lookup Form */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5">
                    <input
                        type="text"
                        value={searchIdInput}
                        onChange={(e) => setSearchIdInput(e.target.value)}
                        placeholder="Jump to Record ID (e.g. 101)..."
                        className="text-xs px-3 py-1.5 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e] w-48"
                    />
                    <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[#174a7e] hover:bg-[#123b65] rounded-none transition cursor-pointer"
                    >
                        Load Case
                    </button>
                </form>
            </div>

            {/* Case File Loading State */}
            {loading && (
                <div className="space-y-6 animate-pulse py-6">
                    <div className="h-5 w-48 bg-[#dfe3e8] rounded-none" />
                    <div className="h-32 bg-white border border-[#dfe3e8] rounded-lg p-6 space-y-4">
                        <div className="h-6 w-72 bg-[#dfe3e8] rounded-none" />
                        <div className="h-4 w-96 bg-[#f1f3f6] rounded-none" />
                    </div>
                    <div className="h-12 bg-white border border-[#dfe3e8] rounded-lg" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-80 bg-white border border-[#dfe3e8] rounded-lg" />
                        <div className="h-80 bg-white border border-[#dfe3e8] rounded-lg" />
                    </div>
                </div>
            )}

            {/* Case Not Found State */}
            {!loading && (!caseData || !caseData.case) && (
                <div className="py-16 text-center space-y-4 bg-white border border-[#dfe3e8] rounded-lg p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[#fff0e6] text-[#c2410c] border border-[#fed7aa] mx-auto">
                        <ShieldAlert size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-[#172033]">Case Record Not Found</h2>
                    <p className="text-xs text-[#536174] max-w-md mx-auto">
                        No project matching identifier &ldquo;REC-{String(selectedRecordId).padStart(5, "0")}&rdquo; was found in the monitored 742-record corpus.
                    </p>
                    <button
                        type="button"
                        onClick={() => setSelectedRecordId(1)}
                        className="inline-flex items-center gap-1.5 rounded-none bg-[#174a7e] px-4 py-2 text-xs font-bold text-white hover:bg-[#123b65] transition cursor-pointer"
                    >
                        <ArrowLeft size={13} />
                        <span>Load Sample Case REC-00001</span>
                    </button>
                </div>
            )}

            {/* Full Case File Workspace */}
            {!loading && caseData && caseData.case && (
                <div className="space-y-6">
                    {/* 1. Case Header & Identity */}
                    <CaseHeader project={caseData.case} />

                    {/* 2. Progressive Disclosure Tab Navigation */}
                    <div className="space-y-0">
                        <CaseTabs
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            evidenceCount={caseData.evidence_ledger.length}
                        />

                        {/* Tab 1: Overview */}
                        {activeTab === "overview" && (
                            <CaseOverviewTab
                                data={caseData}
                                onNavigateTab={(tab) => setActiveTab(tab)}
                            />
                        )}

                        {/* Tab 2: Analysis & Rates */}
                        {activeTab === "analysis" && (
                            <CaseAnalysisTab data={caseData} />
                        )}

                        {/* Tab 3: Evidence Records */}
                        {activeTab === "evidence" && (
                            <CaseEvidenceTab data={caseData} />
                        )}

                        {/* Tab 4: Verification & Actions */}
                        {activeTab === "verification" && (
                            <CaseVerificationTab
                                data={caseData}
                            />
                        )}

                        {/* Tab 5: Audit & Audit History */}
                        {activeTab === "history" && (
                            <CaseHistoryTab
                                data={caseData}
                                customNotes={customNotes}
                                onAddNote={handleAddNote}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
