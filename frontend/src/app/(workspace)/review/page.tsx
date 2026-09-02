"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ShieldAlert,
    FolderSearch,
    Upload,
    RefreshCw,
} from "@/components/shared/Icons";
import type { Filters, PriorityLevel, CaseListResponse } from "@/api/types";
import apiClient from "@/api/client";
import { queryDemoProjects } from "@/api/demoProjectsData";
import { ReviewSummaryStrip } from "@/components/review/ReviewSummaryStrip";
import { ReviewSearchAndFilters } from "@/components/review/ReviewSearchAndFilters";
import { ReviewTable } from "@/components/review/ReviewTable";
import { ProjectPagination } from "@/components/project/ProjectPagination";
import { useLanguage } from "@/i18n/LanguageContext";

function ReviewQueueContent() {
    const searchParams = useSearchParams();

    // Parse initial URL query parameters
    const initialPriority = (searchParams.get("priority")?.toUpperCase() as PriorityLevel) || null;
    const initialSearch = searchParams.get("search") || null;
    const initialReviewStatus = searchParams.get("review_status") || null;
    const initialReviewTrigger = searchParams.get("review_trigger") || null;

    // Master filter and pagination state
    const [filters, setFilters] = useState<Filters>({
        search: initialSearch,
        priority: initialPriority,
        review_status: initialReviewStatus,
        review_trigger: initialReviewTrigger,
        mp_name: null,
        constituency: null,
        state: null,
        page: 1,
        page_size: 25,
        sort_by: "rank",
        sort_order: "asc",
    });

    // Update filters if URL parameters change
    useEffect(() => {
        const p = (searchParams.get("priority")?.toUpperCase() as PriorityLevel) || null;
        const q = searchParams.get("search") || null;
        const rs = searchParams.get("review_status") || null;
        const rt = searchParams.get("review_trigger") || null;

        setFilters((prev) => ({
            ...prev,
            priority: p !== null ? p : prev.priority ?? null,
            search: q !== null ? q : prev.search ?? null,
            review_status: rs !== null ? rs : prev.review_status ?? null,
            review_trigger: rt !== null ? rt : prev.review_trigger ?? null,
            page: 1,
        }));
    }, [searchParams]);

    const [caseData, setCaseData] = useState<CaseListResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    // Fetch review cases from API, with fallback to local corpus
    const fetchReviewCases = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await apiClient.getCases(filters);
            if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
                setCaseData(res);
            } else {
                const localRes = queryDemoProjects(filters);
                setCaseData(localRes);
            }
        } catch {
            const localRes = queryDemoProjects(filters);
            setCaseData(localRes);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchReviewCases();
    }, [fetchReviewCases, refreshTrigger]);

    // Sorting handler
    const handleSortChange = (
        field: "rank" | "allocation_amount" | "record_id"
    ) => {
        setFilters((prev) => {
            const isSameField = prev.sort_by === field;
            const newOrder = isSameField && prev.sort_order === "asc" ? "desc" : "asc";
            return {
                ...prev,
                sort_by: field,
                sort_order: newOrder,
                page: 1,
            };
        });
    };

    // Priority filter toggle from summary strip
    const handlePriorityFilter = (priority: PriorityLevel | null) => {
        setFilters((prev) => ({
            ...prev,
            priority: priority,
            page: 1,
        }));
    };

    // Pagination handlers
    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setFilters((prev) => ({ ...prev, page_size: newPageSize, page: 1 }));
    };

    const totalRecords = 742;
    const filteredCount = caseData?.pagination.total_records ?? 742;

    const { t } = useLanguage();

    return (
        <div className="space-y-6 pb-12">
            {/* ─────────────────────────────────────────────────────────────
          1. INSTITUTIONAL PAGE HEADER
      ───────────────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#d8d4ca] pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#687487]">
                            NIRIKSHAK AI · REVIEW QUEUE
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#17263a]">
                        {t("review.title", "Review Queue")}
                    </h1>

                    <p className="mt-1 max-w-3xl text-xs sm:text-sm text-[#536174] leading-relaxed">
                        {t("review.desc", "Ranked human-review workload. Manage prioritized public works cases requiring official desk review, verify anomaly triggers, and inspect evidence reports.")}
                    </p>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
          2. FOUR SUMMARY METRIC BOXES (Moved from Projects to Review Queue)
      ───────────────────────────────────────────────────────────── */}
            <ReviewSummaryStrip
                totalCount={totalRecords}
                filteredCount={filteredCount}
                activePriorityFilter={filters.priority || null}
                onSelectPriorityFilter={handlePriorityFilter}
                highCount={45}
                mediumCount={140}
                lowCount={557}
            />

            {/* ─────────────────────────────────────────────────────────────
          3. REVIEW QUEUE SEARCH & FILTERS PANEL (Clean, No Active Filter Chips)
      ───────────────────────────────────────────────────────────── */}
            <ReviewSearchAndFilters
                filters={filters}
                onFiltersChange={setFilters}
                totalRecords={totalRecords}
                filteredCount={filteredCount}
            />

            {/* ─────────────────────────────────────────────────────────────
          4. REVIEW QUEUE TABLE (Rank, Risk Rating + Score, Trigger, Actions)
      ───────────────────────────────────────────────────────────── */}
            <ReviewTable
                projects={caseData?.data || []}
                loading={loading}
                error={error}
                onRetry={fetchReviewCases}
                filters={filters}
                onSortChange={handleSortChange}
                onResetFilters={() =>
                    setFilters({
                        page: 1,
                        page_size: 25,
                        sort_by: "rank",
                        sort_order: "asc",
                    })
                }
            />

            {/* ─────────────────────────────────────────────────────────────
          5. PAGINATION CONTROLS
      ───────────────────────────────────────────────────────────── */}
            {caseData?.pagination && (
                <ProjectPagination
                    pagination={caseData.pagination}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            {/* ─────────────────────────────────────────────────────────────
          6. HUMAN-IN-THE-LOOP INVESTIGATION GOVERNANCE
      ───────────────────────────────────────────────────────────── */}
            <div className="rounded-xl border border-[#d8d4ca] bg-[#fbfaf8] p-4 text-xs text-[#687487] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#102d49] text-[#d8b45c] text-[10px] font-bold">
                        i
                    </span>
                    <span>
                        <strong>Investigative Governance:</strong> Statistical anomaly indicators guide audit priority. Findings require physical evidence and official verification.
                    </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-[#8e897e]">
                    <span>SIH Problem Statement 102</span>
                    <span>·</span>
                    <span>MPLADS Review Workload</span>
                </div>
            </div>
        </div>
    );
}

export default function ReviewQueuePage() {
    return (
        <Suspense
            fallback={
                <div className="space-y-6 py-8 animate-pulse">
                    <div className="h-6 w-48 bg-[#e2ddd1] rounded" />
                    <div className="h-24 bg-white border border-[#d8d4ca] rounded-xl" />
                    <div className="h-96 bg-white border border-[#d8d4ca] rounded-xl" />
                </div>
            }
        >
            <ReviewQueueContent />
        </Suspense>
    );
}
