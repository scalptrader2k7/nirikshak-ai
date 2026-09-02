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

interface ProjectSearchAndFiltersProps {
    filters: Filters;
    onFiltersChange: (newFilters: Filters) => void;
    totalRecords: number;
    filteredCount: number;
}

export const ProjectSearchAndFilters: React.FC<ProjectSearchAndFiltersProps> = ({
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
            sort_by: "allocation_amount",
            sort_order: "desc",
        });
    };

    // Calculate active filter count for badge
    let activeFilterCount = 0;
    if (filters.state) activeFilterCount++;
    if (filters.constituency) activeFilterCount++;
    if (filters.work_type) activeFilterCount++;
    if (filters.priority) activeFilterCount++;
    if (filters.sanction_status || filters.status) activeFilterCount++;

    return (
        <div className="space-y-4">
            {/* ─────────────────────────────────────────────────────────────
          1. PROMINENT SEARCH BAR, DEDICATED FILTERS & RESET CONTROLS
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
                        placeholder="Search project, ID, MP or constituency..."
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
          2. EXPANDABLE FILTER PANEL (Corresponding to Table Columns)
      ───────────────────────────────────────────────────────────── */}
            {isAdvancedOpen && (
                <div className="rounded-xl border border-[#d8d4ca] bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                        {/* 1. Work Type */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687487] mb-1.5">
                                Work Type
                            </label>
                            <select
                                value={filters.work_type || "ALL"}
                                onChange={(e) => handleFilterChange("work_type", e.target.value)}
                                className="w-full rounded-lg border border-[#d8d4ca] bg-[#fbfaf8] px-3 py-2 text-xs font-semibold text-[#17263a] focus:border-[#102d49] focus:bg-white focus:outline-none transition cursor-pointer"
                            >
                                <option value="ALL">All Work Types</option>
                                {metadata.workTypes.map((wt) => (
                                    <option key={wt} value={wt}>
                                        {wt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. State */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687487] mb-1.5">
                                State
                            </label>
                            <select
                                value={filters.state || "ALL"}
                                onChange={(e) => handleFilterChange("state", e.target.value)}
                                className="w-full rounded-lg border border-[#d8d4ca] bg-[#fbfaf8] px-3 py-2 text-xs font-semibold text-[#17263a] focus:border-[#102d49] focus:bg-white focus:outline-none transition cursor-pointer"
                            >
                                <option value="ALL">All States</option>
                                {metadata.states.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Constituency */}
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

                        {/* 4. Risk (Low / Medium / High - No Critical) */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687487] mb-1.5">
                                Risk
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

                        {/* 5. Status (Sanctioned / Unsanctioned) */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#687487] mb-1.5">
                                Status
                            </label>
                            <select
                                value={filters.sanction_status || filters.status || "ALL"}
                                onChange={(e) => handleFilterChange("sanction_status", e.target.value)}
                                className="w-full rounded-lg border border-[#d8d4ca] bg-[#fbfaf8] px-3 py-2 text-xs font-semibold text-[#17263a] focus:border-[#102d49] focus:bg-white focus:outline-none transition cursor-pointer"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="Sanctioned">Sanctioned</option>
                                <option value="Unsanctioned">Unsanctioned</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Panel Footer with 1-click Reset */}
                    <div className="mt-4 pt-3.5 border-t border-[#ece7dc] flex items-center justify-between text-xs">
                        <span className="text-[#687487]">
                            Filter criteria updates table dynamically in real-time.
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
          3. CLEAN PROJECT COUNT SUMMARY (NO ACTIVE FILTER CHIPS)
      ───────────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between pt-1">
                <div className="text-xs font-bold text-[#17263a] font-mono">
                    {filteredCount === totalRecords ? (
                        <span>{totalRecords} projects</span>
                    ) : (
                        <span>
                            {filteredCount} of {totalRecords} projects match criteria
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

export default ProjectSearchAndFilters;
