import React from "react";
import { X } from "@/components/shared/Icons";

export type DashboardTab =
    | "all"
    | "risk"
    | "performance"
    | "geo"
    | "coverage";

interface DashboardSearchAndTabsProps {
    activeTab: DashboardTab;
    onTabChange: (tab: DashboardTab) => void;
    totalRecords?: number;
    selectedState?: string | null;
    onClearStateFilter?: () => void;
}

const TABS: { id: DashboardTab; label: string }[] = [
    { id: "all", label: "Executive Overview" },
    { id: "risk", label: "Investigation Intelligence" },
    { id: "performance", label: "Fund Performance" },
    { id: "geo", label: "Geographic & Sectors" },
    { id: "coverage", label: "Data Coverage" },
];

export const DashboardSearchAndTabs: React.FC<DashboardSearchAndTabsProps> = ({
    activeTab,
    onTabChange,
    selectedState,
    onClearStateFilter,
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d8d4ca] pb-0">
            {/* Perspective Tabs */}
            <nav className="flex items-center gap-1 -mb-px overflow-x-auto" aria-label="Dashboard Perspectives">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition cursor-pointer flex items-center gap-2 ${
                                isActive
                                    ? "border-[#102d49] text-[#102d49] bg-white rounded-t-lg"
                                    : "border-transparent text-[#687487] hover:text-[#17263a] hover:border-[#d8d4ca]"
                            }`}
                        >
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Active Geographic Filter Pill (if selected from charts) */}
            {selectedState && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#e8f0f8] border border-[#c8ced6] text-xs font-semibold text-[#102d49] mb-1 sm:mb-0">
                    <span>State Filter: <strong>{selectedState}</strong></span>
                    <button
                        type="button"
                        onClick={onClearStateFilter}
                        className="p-0.5 hover:bg-white rounded transition text-[#102d49] cursor-pointer"
                        title="Clear State Filter"
                    >
                        <X size={13} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DashboardSearchAndTabs;
