"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "@/components/shared/Icons";
import apiClient from "@/api/client";
import { getEnrichedCaseDetail, type EnrichedCaseDetail } from "@/components/case/demoCaseDetailAdapter";
import { CaseHeader } from "@/components/case/CaseHeader";
import { CaseTabs, type CaseTabKey } from "@/components/case/CaseTabs";
import { CaseOverviewTab } from "@/components/case/CaseOverviewTab";
import { CaseAnalysisTab } from "@/components/case/CaseAnalysisTab";
import { CaseEvidenceTab } from "@/components/case/CaseEvidenceTab";
import { CaseVerificationTab } from "@/components/case/CaseVerificationTab";
import { CaseHistoryTab } from "@/components/case/CaseHistoryTab";

export default function ProjectCaseFilePage() {
    const params = useParams();
    const rawId = params?.id as string;
    const recordId = parseInt(rawId, 10);

    const [activeTab, setActiveTab] = useState<CaseTabKey>("overview");
    const [caseData, setCaseData] = useState<EnrichedCaseDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [customNotes, setCustomNotes] = useState<Array<{ text: string; timestamp: string }>>([]);

    useEffect(() => {
        if (isNaN(recordId)) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // Attempt to fetch from API, fallback to enriched demo detail adapter
        apiClient
            .getCase(recordId)
            .then((res) => {
                if (res && res.data) {
                    const enriched = getEnrichedCaseDetail(recordId);
                    if (enriched) {
                        enriched.case = res.data;
                        setCaseData(enriched);
                    } else {
                        setCaseData(getEnrichedCaseDetail(recordId));
                    }
                } else {
                    setCaseData(getEnrichedCaseDetail(recordId));
                }
            })
            .catch(() => {
                setCaseData(getEnrichedCaseDetail(recordId));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [recordId]);

    const handleAddNote = (noteText: string) => {
        const newEntry = {
            text: noteText,
            timestamp: new Date().toLocaleString("en-IN", {
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

    if (loading) {
        return (
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
        );
    }

    if (!caseData || !caseData.case) {
        return (
            <div className="py-16 text-center space-y-4 bg-white border border-[#dfe3e8] rounded-lg p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[#fff0e6] text-[#c2410c] border border-[#fed7aa] mx-auto">
                    <ShieldAlert size={24} />
                </div>
                <h2 className="text-lg font-bold text-[#172033]">Case Record Not Found</h2>
                <p className="text-xs text-[#536174] max-w-md mx-auto">
                    No project matching identifier &ldquo;{rawId}&rdquo; was found in the monitored 742-record corpus.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                    <Link
                        href="/evidence"
                        className="inline-flex items-center gap-1.5 rounded-none bg-[#174a7e] px-4 py-2 text-xs font-bold text-white hover:bg-[#123b65] transition"
                    >
                        <ArrowLeft size={13} />
                        <span>Back to Evidence Report</span>
                    </Link>
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-1.5 rounded-none bg-[#f1f3f6] border border-[#dfe3e8] px-4 py-2 text-xs font-bold text-[#536174] hover:text-[#172033] transition"
                    >
                        <span>Projects Registry</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-16">
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
    );
}
