import React, { useState, useEffect } from "react";
import {
    FolderSearch,
    X,
    Filter,
    RotateCcw,
    ChevronDown,
} from "@/components/shared/Icons";
import type { Filters, PriorityLevel } from "@/api/types";
import { getFilterMetadataOptions } from "@/api/demoProjectsData";

interface ReviewSearchAndFiltersProps {
    filters: Filters;
    onFiltersChange: (newFilters: Filters) => void;
    totalRecords: number;
    filteredCount: number;
}

export const ReviewSearchAndFilters: React.FC<ReviewSearchAndFiltersProps> = ({
    filters,
    onFiltersChange,
    totalRecords,
    filteredCount,
}) => {
    const [searchInput, setSearchInput] = useState(filters.search || "");
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const metadata = getFilterMetadataOptions();

    // Sync input when filters.search changes externally
    useEffect(() => {
        setSearchInput(filters.search || "");
    }, [filters.search]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== (filters.search || "")) {
                onFiltersChange({
                    ...filters,
                    search: searchInput.trim() ? searchInput.trim() : null,
                    page: 1,
                });
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [searchInput, filters, onFiltersChange]);

    const handleClearSearch = () => {
        setSearchInput("");
        onFiltersChange({ ...filters, search: null, page: 1 });
    };

    const handleFilterChange = (key: keyof Filters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value === "ALL" || value === "" ? null : value,
            page: 1,
        });
    };

    const handleResetAll = () => {
        setSearchInput("");
        onFiltersChange({
            page: 1,
            page_size: filters.page_size || 25,
            sort_by: "rank",
            sort_order: "asc",
        });
    };

    // Calculate active filter count for badge
    let activeFilterCount = 0;
    if (filters.mp_name) activeFilterCount++;
    if (filters.constituency) activeFilterCount++;
    if (filters.priority) activeFilterCount++;
    if (filters.review_status) activeFilterCount++;
    if (filters.review_trigger) activeFilterCount++;

    return (
        <div className="space-y-4">
            {/* ─────────────────────────────────────────────────────────────
          1. SEARCH BAR, DEDICATED FILTERS & RESET CONTROLS
      ───────────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Box */}
                <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#687487]">
                        <FolderSearch size={16} />
                    </div>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search MP, constituency or project..."
                        className="w-full rounded-xl border border-[#d8d4ca] bg-white py-3 pl-10 pr-10 text-sm font-medium text-[#17263a] placeholder-[#8e897e] transition focus:border-[#102d49] focus:outline-none focus:ring-1 focus:ring-[#102d49] shadow-xs"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#687487] hover:text-[#17263a] cursor-pointer"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                {/* Filters Toggle Button */}
                <button
                    type="button"
                    onClick={() => setIsAdvancedOpen((prev) => !prev)}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition shadow-xs cursor-pointer shrink-0 ${
                        isAdvancedOpen || activeFilterCount > 0
                            ? "border-[#102d49] bg-[#102d49] text-white"
                            : "border-[#d8d4ca] bg-white text-[#17263a] hover:bg-[#f8f7f3]"
                    }`}
                >
                    <Filter size={14} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#d8b45c] px-1 text-[10px] font-black text-[#102d49]">
                            {activeFilterCount}
                        </span>
                    )}
                    <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${
                            isAdvancedOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {/* Reset Button */}
                <button
                    type="button"
                    onClick={handleResetAll}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-3 text-xs font-bold transition shadow-xs cursor-pointer shrink-0 ${
                        activeFilterCount > 0 || searchInput
                            ? "border-[#d8d4ca] bg-white text-[#b91c1c] hover:bg-[#fbe9e9]/50 hover:border-[#b91c1c]/40"
                            : "border-[#d8d4ca] bg-white text-[#687487] hover:bg-[#f8f7f3]"
                    }`}
                    title="Reset all filters and search"
                >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                </button>
            </div>

            {/* ─────────────────────────────────────────────────────────────
          2. EXPANDABLE FILTER PANEL (Review Queue Fields)
      ───────────────────────────────────────────────────────────── */}
            {isAdvancedOpen && (
                <div className="rounded-xl border border-[#d8d4ca] bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                        {/* 1. Risk Level (High / Medium / Low) */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687487] mb-1.5">
                                Risk Rating
                            </label>
                            <select
                                value={filters.priority || "ALL"}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "priority",
                                        e.target.value === "ALL" ? null : (e.target.value as PriorityLevel)
                                    )
                                }
                                className="w-full rounded-lg border border-[#d8d4ca] bg-[#fbfaf8] px-3 py-2 text-xs font-semibold text-[#17263a] focus:border-[#102d49] focus:bg-white focus:outline-none transition cursor-pointer"
                            >
                                <option value="ALL">All Risk Levels</option>
                                <option value="HIGH">High Risk</option>
                                <option value="MEDIUM">Medium Risk</option>
                                <option value="LOW">Low Risk</option>
                            </select>
                        </div>

                        {/* 2. Review Status */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687487] mb-1.5">
                                Review Status
                            </label>
                            <select
                                value={filters.review_status || "ALL"}
                                onChange={(e) => handleFilterChange("review_status", e.target.value)}
                                className="w-full rounded-lg border border-[#d8d4ca] bg-[#fbfaf8] px-3 py-2 text-xs font-semibold text-[#17263a] focus:border-[#102d49] focus:bg-white focus:outline-none transition cursor-pointer"
                            >
                                <option value="ALL">All Review Statuses</option>
                                <option value="Awaiting Review">Awaiting Review</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Verification Required">Verification Required</option>
                                <option value="Reviewed">Reviewed</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>

                        {/* 3. Review Trigger */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687487] mb-1.5">
                                Review Trigger
                            </label>
                            <select
                                value={filters.review_trigger || "ALL"}
                                onChange={(e) => handleFilterChange("review_trigger", e.target.value)}
                                className="w-full rounded-lg border border-[#d8d4ca] bg-[#fbfaf8] px-3 py-2 text-xs font-semibold text-[#17263a] focus:border-[#102d49] focus:bg-white focus:outline-none transition cursor-pointer"
                            >
                                <option value="ALL">All Review Triggers</option>
                                <option value="Cost deviation">Cost deviation</option>
                                <option value="Duplicate record">Duplicate record</option>
                                <option value="Near-duplicate record">Near-duplicate record</option>
                                <option value="Pattern deviation">Pattern deviation</option>
                            </select>
                        </div>

                        {/* 4. Hon'ble MP */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687487] mb-1.5">
                                Member of Parliament
                            </label>
                            <select
                                value={filters.mp_name || "ALL"}
                                onChange={(e) => handleFilterChange("mp_name", e.target.value)}
                                className="w-full rounded-lg border border-[#d8d4ca] bg-[#fbfaf8] px-3 py-2 text-xs font-semibold text-[#17263a] focus:border-[#102d49] focus:bg-white focus:outline-none transition cursor-pointer"
                            >
                                <option value="ALL">All Representatives</option>
                                {metadata.mps.map((mp) => (
                                    <option key={mp} value={mp}>
                                        {mp}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 5. Constituency */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687487] mb-1.5">
                                Constituency
                            </label>
                            <select
                                value={filters.constituency || "ALL"}
                                onChange={(e) => handleFilterChange("constituency", e.target.value)}
                                className="w-full rounded-lg border border-[#d8d4ca] bg-[#fbfaf8] px-3 py-2 text-xs font-semibold text-[#17263a] focus:border-[#102d49] focus:bg-white focus:outline-none transition cursor-pointer"
                            >
                                <option value="ALL">All Constituencies</option>
                                {metadata.constituencies.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filter Panel Footer */}
                    <div className="mt-4 pt-3.5 border-t border-[#ece7dc] flex items-center justify-between text-xs">
                        <span className="text-[#687487]">
                            Filter criteria updates the review queue in real-time.
                        </span>
                        <button
                            type="button"
                            onClick={handleResetAll}
                            className="font-bold text-[#102d49] hover:underline cursor-pointer"
                        >
                            Reset Filter Panel
                        </button>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
          3. CLEAN CASE COUNT SUMMARY (NO ACTIVE FILTER CHIPS)
      ───────────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between pt-1">
                <div className="text-xs font-bold text-[#17263a] font-mono">
                    {filteredCount === totalRecords ? (
                        <span>{totalRecords} review workload cases</span>
                    ) : (
                        <span>
                            {filteredCount} of {totalRecords} cases match review filter
                        </span>
                    )}
                </div>

                {filteredCount < totalRecords && (
                    <button
                        type="button"
                        onClick={handleResetAll}
                        className="text-xs font-bold text-[#102d49] hover:underline cursor-pointer"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
};

export default ReviewSearchAndFilters;
