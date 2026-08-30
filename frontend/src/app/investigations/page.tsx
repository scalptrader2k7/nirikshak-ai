"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Eye,
  Info,
  Loader2
} from "lucide-react";
import apiClient from "@/api/client";
import { InvestigationCase, Pagination } from "@/api/types";
import { RiskBadge, DetectorBadge } from "@/components/ui/RiskComponents";
import { ErrorState, EmptyState } from "@/components/ui/UIStates";

// 1. Table skeleton loader for layout stability during loading state
const TableSkeleton: React.FC = () => {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="h-12 bg-slate-50 border-b border-slate-200" />
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 flex items-center px-6 space-x-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-8" />
            <div className="h-4 bg-slate-200 rounded w-16" />
            <div className="h-4 bg-slate-200 rounded flex-1" />
            <div className="h-4 bg-slate-200 rounded w-32" />
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-4 bg-slate-200 rounded w-16" />
            <div className="h-4 bg-slate-200 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Queue Content
const InvestigationsQueueContent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // API State
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Advanced Filters toggle state
  const [showFilters, setShowFilters] = useState(false);

  // Reads filter state directly from search parameters (single source of truth)
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("page_size") || "25", 10);
  const priority = searchParams.get("priority") || "";
  const detector = searchParams.get("detector") || "";
  const severity = searchParams.get("severity") || "";
  const state = searchParams.get("state") || "";
  const constituency = searchParams.get("constituency") || "";
  const mpName = searchParams.get("mp_name") || "";
  const workType = searchParams.get("work_type") || "";
  const minScore = searchParams.get("min_score") || "";
  const maxScore = searchParams.get("max_score") || "";
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort_by") || "rank";
  const sortDirection = searchParams.get("sort_direction") || "asc"; // maps to sort_order in API

  // Local input states for typed filters (used for debouncing)
  const [localSearch, setLocalSearch] = useState(search);
  const [localState, setLocalState] = useState(state);
  const [localConstituency, setLocalConstituency] = useState(constituency);
  const [localMpName, setLocalMpName] = useState(mpName);
  const [localWorkType, setLocalWorkType] = useState(workType);
  const [localMinScore, setLocalMinScore] = useState(minScore);
  const [localMaxScore, setLocalMaxScore] = useState(maxScore);

  // Sync local inputs when URL search params change (e.g. backward/forward navigation or "Clear all")
  // Using an asynchronous microtask via Promise.resolve() to avoid setting state synchronously in an effect body
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setLocalSearch(search);
        setLocalState(state);
        setLocalConstituency(constituency);
        setLocalMpName(mpName);
        setLocalWorkType(workType);
        setLocalMinScore(minScore);
        setLocalMaxScore(maxScore);
      }
    });
    return () => {
      active = false;
    };
  }, [search, state, constituency, mpName, workType, minScore, maxScore]);

  // Utility to update URL query parameters cleanly
  const updateQueryParams = useCallback((newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });

    const searchStr = current.toString();
    const query = searchStr ? `?${searchStr}` : "";
    router.push(`${pathname}${query}`);
  }, [searchParams, router, pathname]);

  // Debounce effect to bundle all text and numeric filter changes into a single URL push after 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      const updates: Record<string, string | null> = {};
      let changed = false;

      if (localSearch !== search) {
        updates.search = localSearch;
        changed = true;
      }
      if (localState !== state) {
        updates.state = localState;
        changed = true;
      }
      if (localConstituency !== constituency) {
        updates.constituency = localConstituency;
        changed = true;
      }
      if (localMpName !== mpName) {
        updates.mp_name = localMpName;
        changed = true;
      }
      if (localWorkType !== workType) {
        updates.work_type = localWorkType;
        changed = true;
      }
      if (localMinScore !== minScore) {
        updates.min_score = localMinScore;
        changed = true;
      }
      if (localMaxScore !== maxScore) {
        updates.max_score = localMaxScore;
        changed = true;
      }

      if (changed) {
        updates.page = "1"; // Reset pagination on any filter adjustment
        updateQueryParams(updates);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [
    localSearch, localState, localConstituency, localMpName, localWorkType, localMinScore, localMaxScore,
    search, state, constituency, mpName, workType, minScore, maxScore, updateQueryParams
  ]);

  // Main data-fetching triggers via useEffect to avoid synchronous state calls
  useEffect(() => {
    let active = true;

    // Set loading state asynchronously
    Promise.resolve().then(() => {
      if (active) {
        setLoading(true);
        setError(null);
      }
    });

    const apiFilters: Record<string, any> = {
      page,
      page_size: pageSize,
      sort_by: sortBy,
      sort_order: sortDirection
    };

    if (priority) apiFilters.priority = priority;
    if (detector) apiFilters.detector = detector;
    if (severity) apiFilters.severity = severity;
    if (state) apiFilters.state = state;
    if (constituency) apiFilters.constituency = constituency;
    if (mpName) apiFilters.mp_name = mpName;
    if (workType) apiFilters.work_type = workType;
    if (minScore) apiFilters.min_score = parseFloat(minScore);
    if (maxScore) apiFilters.max_score = parseFloat(maxScore);
    if (search) apiFilters.search = search;

    apiClient.getCases(apiFilters)
      .then(res => {
        if (active) {
          setCases(res.data || []);
          setPagination(res.pagination || null);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          setError(err.message || "Unable to reach the investigation service.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    page,
    pageSize,
    priority,
    detector,
    severity,
    state,
    constituency,
    mpName,
    workType,
    minScore,
    maxScore,
    search,
    sortBy,
    sortDirection,
    retryCount
  ]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Handler for sorting headers
  const handleSort = (field: string) => {
    const nextDirection = sortBy === field && sortDirection === "asc" ? "desc" : "asc";
    updateQueryParams({
      sort_by: field,
      sort_direction: nextDirection,
      page: "1" // Always reset to page 1 on sorting adjustment
    });
  };

  // Handler for removing a single filter chip
  const handleRemoveFilter = (key: string) => {
    if (key === "search") setLocalSearch("");
    if (key === "state") setLocalState("");
    if (key === "constituency") setLocalConstituency("");
    if (key === "mp_name") setLocalMpName("");
    if (key === "work_type") setLocalWorkType("");
    if (key === "min_score") setLocalMinScore("");
    if (key === "max_score") setLocalMaxScore("");

    updateQueryParams({ [key]: null, page: "1" });
  };

  // Reset all filters back to default
  const handleClearAll = () => {
    setLocalSearch("");
    setLocalState("");
    setLocalConstituency("");
    setLocalMpName("");
    setLocalWorkType("");
    setLocalMinScore("");
    setLocalMaxScore("");
    router.push(pathname);
  };

  // Format monetary value to Indian currency
  const formatRupees = (amount?: number) => {
    if (amount === undefined || amount === null) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Navigation click fallback for entire row
  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>, recordId: number) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button") || target.closest("input")) {
      return;
    }
    router.push(`/investigations/${recordId}`);
  };

  // Count active filters (ignoring pagination parameters)
  const activeFilterKeys = Object.keys(
    Object.fromEntries(
      Array.from(searchParams.entries()).filter(
        ([key]) => !["page", "page_size", "sort_by", "sort_direction"].includes(key)
      )
    )
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Investigation Cases
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-3xl leading-relaxed">
          Review records prioritized by explainable risk indicators.
        </p>

        {/* Compact Metadata Row */}
        {!loading && pagination && (
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-2 font-medium">
            <span className="font-semibold text-slate-800">{pagination.total_records} cases matched</span>
            <span className="text-slate-300">|</span>
            <span>742 records evaluated</span>
          </div>
        )}
      </div>

      {/* Official Disclaimer Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex gap-2.5 text-xs text-slate-600 shadow-sm">
        <Info className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          Risk indicators identify records that may warrant further review. They do not establish wrongdoing or corruption.
        </p>
      </div>

      {/* Search & Filter Controls Panel */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search record ID, project, MP, constituency, location..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label="Clear search input"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {/* Show/Hide Filters Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500
                ${showFilters 
                  ? "bg-slate-100 border-slate-300 text-slate-800" 
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              aria-expanded={showFilters}
            >
              <Filter className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span>Filters</span>
              {activeFilterKeys.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full font-mono">
                  {activeFilterKeys.length}
                </span>
              )}
            </button>

            {/* Clear All button */}
            {activeFilterKeys.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable filter configuration panel */}
        {showFilters && (
          <div className="border-t border-slate-100 pt-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Priority Filter */}
              <div>
                <label htmlFor="priority-select" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Priority
                </label>
                <select
                  id="priority-select"
                  value={priority}
                  onChange={(e) => updateQueryParams({ priority: e.target.value || null, page: "1" })}
                  className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              {/* Detector Filter */}
              <div>
                <label htmlFor="detector-select" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Detector
                </label>
                <select
                  id="detector-select"
                  value={detector}
                  onChange={(e) => updateQueryParams({ detector: e.target.value || null, page: "1" })}
                  className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Detectors</option>
                  <option value="cost">Cost Anomaly</option>
                  <option value="exact_duplicate">Repeated Record</option>
                  <option value="near_duplicate">Suspicious Similarity</option>
                  <option value="pattern">Temporal Pattern</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div>
                <label htmlFor="severity-select" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Severity
                </label>
                <select
                  id="severity-select"
                  value={severity}
                  onChange={(e) => updateQueryParams({ severity: e.target.value || null, page: "1" })}
                  className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* State Filter */}
              <div>
                <label htmlFor="state-input" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  id="state-input"
                  placeholder="e.g. Karnataka"
                  value={localState}
                  onChange={(e) => setLocalState(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Constituency Filter */}
              <div>
                <label htmlFor="constituency-input" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Constituency
                </label>
                <input
                  type="text"
                  id="constituency-input"
                  placeholder="e.g. Bangalore Rural"
                  value={localConstituency}
                  onChange={(e) => setLocalConstituency(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* MP Filter */}
              <div>
                <label htmlFor="mp-input" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  MP Name
                </label>
                <input
                  type="text"
                  id="mp-input"
                  placeholder="e.g. Rajeev"
                  value={localMpName}
                  onChange={(e) => setLocalMpName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Work Type Filter */}
              <div>
                <label htmlFor="work-type-input" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Work Type
                </label>
                <input
                  type="text"
                  id="work-type-input"
                  placeholder="e.g. road"
                  value={localWorkType}
                  onChange={(e) => setLocalWorkType(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Score Range Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Investigation Score
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    min="0"
                    max="100"
                    value={localMinScore}
                    onChange={(e) => setLocalMinScore(e.target.value)}
                    className="w-1/2 p-2 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-slate-400 text-xs">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    min="0"
                    max="100"
                    value={localMaxScore}
                    onChange={(e) => setLocalMaxScore(e.target.value)}
                    className="w-1/2 p-2 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeFilterKeys.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 items-center">
            <span className="text-xs font-medium text-slate-500 mr-1">Active criteria:</span>
            {activeFilterKeys.map((key) => {
              const val = searchParams.get(key);
              if (!val) return null;

              // Format helper to display human readable key names
              const displayLabel = key
                .replace("mp_name", "MP")
                .replace("work_type", "Work")
                .replace("min_score", "Min Score")
                .replace("max_score", "Max Score");

              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                >
                  <span className="capitalize">{displayLabel}</span>
                  <span className="text-slate-400 font-normal">:</span>
                  <span className="font-bold">{val}</span>
                  <button
                    onClick={() => handleRemoveFilter(key)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none rounded-full hover:bg-slate-200 p-0.5 transition"
                    aria-label={`Remove filter for ${displayLabel}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Area: Loading / Error / Data display states */}
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span>Fetching queue records...</span>
          </div>
          <TableSkeleton />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load investigation cases."
          errorMessage="The investigation service could not be reached. Please try again."
          onRetry={handleRetry}
        />
      ) : cases.length === 0 ? (
        <EmptyState
          title="No investigation cases match the current criteria"
          description="Try adjusting the search or filters."
          onResetFilters={handleClearAll}
        />
      ) : (
        <div className="space-y-4">
          {/* A. Desktop Data Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm" role="grid" aria-label="Investigation Cases">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 select-none">
                    {/* Rank */}
                    <th className="py-3 px-4 font-semibold text-slate-700 w-16 text-center">
                      <button
                        onClick={() => handleSort("rank")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 focus:outline-none text-xs font-semibold uppercase tracking-wider text-slate-500 w-full justify-center"
                        aria-label={`Sort by rank ${sortBy === "rank" && sortDirection === "asc" ? "descending" : "ascending"}`}
                      >
                        <span>Rank</span>
                        {sortBy === "rank" ? (
                          sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5 text-blue-600" /> : <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 opacity-60" />
                        )}
                      </button>
                    </th>

                    {/* Record ID */}
                    <th className="py-3 px-4 font-semibold text-slate-700 w-24">
                      <button
                        onClick={() => handleSort("record_id")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 focus:outline-none text-xs font-semibold uppercase tracking-wider text-slate-500"
                        aria-label={`Sort by record ID ${sortBy === "record_id" && sortDirection === "asc" ? "descending" : "ascending"}`}
                      >
                        <span>ID</span>
                        {sortBy === "record_id" ? (
                          sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5 text-blue-600" /> : <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 opacity-60" />
                        )}
                      </button>
                    </th>

                    {/* Project / Work description */}
                    <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Project / Work
                    </th>

                    {/* MP Name */}
                    <th className="py-3 px-4 w-44 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      MP Name
                    </th>

                    {/* Location */}
                    <th className="py-3 px-4 w-44 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">
                      Location
                    </th>

                    {/* Amount */}
                    <th className="py-3 px-4 font-semibold text-slate-700 w-36 text-right">
                      <button
                        onClick={() => handleSort("allocation_amount")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 focus:outline-none text-xs font-semibold uppercase tracking-wider text-slate-500 w-full justify-end"
                        aria-label={`Sort by allocation amount ${sortBy === "allocation_amount" && sortDirection === "asc" ? "descending" : "ascending"}`}
                      >
                        <span>Amount</span>
                        {sortBy === "allocation_amount" ? (
                          sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5 text-blue-600" /> : <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 opacity-60" />
                        )}
                      </button>
                    </th>

                    {/* Priority Badge */}
                    <th className="py-3 px-4 w-32 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Priority
                    </th>

                    {/* Primary Detector */}
                    <th className="py-3 px-4 w-40 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">
                      Detector
                    </th>

                    {/* Score */}
                    <th className="py-3 px-4 font-semibold text-slate-700 w-24 text-center">
                      <button
                        onClick={() => handleSort("investigation_priority_score")}
                        className="inline-flex items-center gap-1.5 hover:text-slate-900 focus:outline-none text-xs font-semibold uppercase tracking-wider text-slate-500 w-full justify-center"
                        aria-label={`Sort by priority score ${sortBy === "investigation_priority_score" && sortDirection === "asc" ? "descending" : "ascending"}`}
                      >
                        <span>Score</span>
                        {sortBy === "investigation_priority_score" ? (
                          sortDirection === "asc" ? <ChevronUp className="h-3.5 w-3.5 text-blue-600" /> : <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 opacity-60" />
                        )}
                      </button>
                    </th>

                    {/* Actions column */}
                    <th className="py-3 px-4 w-28 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.map((item) => (
                    <tr
                      key={item.record_id}
                      onClick={(e) => handleRowClick(e, item.record_id)}
                      className="hover:bg-slate-50/75 transition-colors cursor-pointer group"
                      role="row"
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-500 text-xs">
                        {item.rank}
                      </td>

                      {/* Record ID */}
                      <td className="py-3 px-4 font-mono tabular-nums text-xs font-semibold text-blue-600">
                        <Link
                          href={`/investigations/${item.record_id}`}
                          className="hover:underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                        >
                          #{item.record_id}
                        </Link>
                      </td>

                      {/* Work Description */}
                      <td className="py-3 px-4">
                        <div
                          className="text-xs font-medium text-slate-900 max-w-sm xl:max-w-md truncate"
                          title={item.work || ""}
                        >
                          {item.work || "—"}
                        </div>
                      </td>

                      {/* MP Name */}
                      <td className="py-3 px-4 text-xs font-medium text-slate-700 truncate max-w-[140px]">
                        {item.mp_name || "—"}
                      </td>

                      {/* Location (State + Constituency) */}
                      <td className="py-3 px-4 text-xs text-slate-500 hidden lg:table-cell truncate max-w-[160px]">
                        {item.state ? `${item.state} (${item.constituency || "NA"})` : "—"}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-xs font-semibold text-slate-900">
                        {formatRupees(item.allocation_amount)}
                      </td>

                      {/* Priority Level */}
                      <td className="py-3 px-4">
                        <RiskBadge level={item.investigation_priority_level} showLabel={true} />
                      </td>

                      {/* Detector Label */}
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <DetectorBadge detector={item.primary_detector} />
                      </td>

                      {/* Score */}
                      <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-xs text-slate-955">
                        {item.investigation_priority_score.toFixed(0)}
                      </td>

                      {/* View Case Action Link */}
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/investigations/${item.record_id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition focus:outline-none focus:underline"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View case</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* B. Mobile Data Cards (Shown only on small screens) */}
          <div className="md:hidden space-y-4">
            {cases.map((item) => (
              <div
                key={item.record_id}
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">#{item.rank}</span>
                    <span className="text-xs font-bold text-blue-600 font-mono">ID: #{item.record_id}</span>
                  </div>
                  <RiskBadge level={item.investigation_priority_level} showLabel={true} />
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-900 line-clamp-2">
                    {item.work || "—"}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">MP Name</span>
                      <span className="text-slate-700 font-medium">{item.mp_name || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Location</span>
                      <span className="text-slate-700 truncate block">{item.state ? `${item.state} (${item.constituency || ""})` : "—"}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Budget Amount</span>
                      <span className="text-slate-900 font-mono font-semibold">{formatRupees(item.allocation_amount)}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Detector</span>
                      <span className="block mt-0.5"><DetectorBadge detector={item.primary_detector} /></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Score:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {item.investigation_priority_score.toFixed(0)}
                    </span>
                  </div>
                  <Link
                    href={`/investigations/${item.record_id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-blue-600 rounded border border-slate-200 transition focus:outline-none"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View case</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* C. Server-Side Pagination Bar */}
          {pagination && pagination.total_pages > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => updateQueryParams({ page_size: e.target.value, page: "1" })}
                  className="p-1 border border-slate-200 rounded bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                  aria-label="Items per page"
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span>cases per page</span>
              </div>

              <div className="font-mono">
                Page <span className="font-bold text-slate-800">{pagination.page}</span> of{" "}
                <span className="font-bold text-slate-800">{pagination.total_pages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQueryParams({ page: String(page - 1) })}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Prev</span>
                </button>
                <button
                  onClick={() => updateQueryParams({ page: String(page + 1) })}
                  disabled={page >= pagination.total_pages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 2. Suspense wrapper to prevent Next.js App Router build-time warnings about static de-optimization
export default function InvestigationsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-7xl mx-auto p-4">
          <div className="h-10 bg-slate-200 rounded animate-pulse w-48" />
          <div className="h-4 bg-slate-200 rounded animate-pulse w-96" />
          <TableSkeleton />
        </div>
      }
    >
      <InvestigationsQueueContent />
    </Suspense>
  );
}
