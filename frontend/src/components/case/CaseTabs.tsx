"use client";

import React from "react";
import {
    FileText,
    BarChart3,
    Database,
    Shield,
    Clock,
} from "@/components/shared/Icons";

export type CaseTabKey =
    | "overview"
    | "analysis"
    | "evidence"
    | "verification"
    | "history";

interface CaseTabsProps {
    activeTab: CaseTabKey;
    onTabChange: (tab: CaseTabKey) => void;
    evidenceCount?: number;
}

interface TabDef {
    key: CaseTabKey;
    label: string;
    icon: React.FC<{ size?: number; className?: string }>;
    badge?: number | string | undefined;
}

export const CaseTabs: React.FC<CaseTabsProps> = ({
    activeTab,
    onTabChange,
    evidenceCount,
}) => {
    const tabs: TabDef[] = [
        { key: "overview", label: "Overview", icon: FileText },
        { key: "analysis", label: "Analysis & Rates", icon: BarChart3 },
        { key: "evidence", label: "Evidence Records", icon: Database, badge: evidenceCount },
        { key: "verification", label: "Verification & Actions", icon: Shield },
        { key: "history", label: "Audit & Audit History", icon: Clock },
    ];

    return (
        <div className="border-b border-[#dfe3e8] bg-white rounded-t-lg overflow-x-auto">
            <nav className="flex items-center min-w-max px-2 pt-2 gap-1" aria-label="Project Case Tabs">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => onTabChange(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px rounded-t ${
                                isActive
                                    ? "border-[#174a7e] text-[#174a7e] bg-[#e8f0f8]/50"
                                    : "border-transparent text-[#536174] hover:text-[#172033] hover:bg-[#f1f3f6]"
                            }`}
                        >
                            <Icon size={14} className={isActive ? "text-[#174a7e]" : "text-[#536174]"} />
                            <span>{tab.label}</span>
                            {tab.badge !== undefined && (
                                <span
                                    className={`px-1.5 py-0.2 rounded-none text-[10px] font-mono font-bold ${
                                        isActive
                                            ? "bg-[#174a7e] text-white"
                                            : "bg-[#f1f3f6] text-[#536174] border border-[#dfe3e8]"
                                    }`}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};
