import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "@/components/shared/Icons";
import type { Pagination } from "@/api/types";

interface ProjectPaginationProps {
    pagination: Pagination;
    onPageChange: (newPage: number) => void;
    onPageSizeChange: (newPageSize: number) => void;
}

export const ProjectPagination: React.FC<ProjectPaginationProps> = ({
    pagination,
    onPageChange,
    onPageSizeChange,
}) => {
    const { page, page_size, total_records, total_pages } = pagination;

    if (total_records === 0) return null;

    const startRecord = (page - 1) * page_size + 1;
    const endRecord = Math.min(page * page_size, total_records);

    // Generate smart visible page range
    const getVisiblePages = () => {
        const pages: (number | string)[] = [];
        if (total_pages <= 7) {
            for (let i = 1; i <= total_pages; i++) pages.push(i);
        } else {
            if (page <= 4) {
                pages.push(1, 2, 3, 4, 5, "...", total_pages);
            } else if (page >= total_pages - 3) {
                pages.push(1, "...", total_pages - 4, total_pages - 3, total_pages - 2, total_pages - 1, total_pages);
            } else {
                pages.push(1, "...", page - 1, page, page + 1, "...", total_pages);
            }
        }
        return pages;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            {/* Record range indicator & Page size selector */}
            <div className="flex items-center gap-3">
                <span className="text-[#536174]">
                    Showing <strong className="text-[#17263a] font-mono">{startRecord}</strong> to{" "}
                    <strong className="text-[#17263a] font-mono">{endRecord}</strong> of{" "}
                    <strong className="text-[#17263a] font-mono">{total_records}</strong> projects
                </span>

                <div className="flex items-center gap-1.5 pl-3 border-l border-[#d8d4ca]">
                    <span className="text-[11px] text-[#687487]">Per page:</span>
                    <select
                        value={page_size}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="h-8 rounded-md border border-[#d8d4ca] bg-[#fbfaf8] px-2 text-xs font-semibold text-[#17263a] focus:border-[#102d49] outline-none cursor-pointer"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {/* Page Navigation Buttons */}
            <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(1)}
                    disabled={page <= 1}
                    className="p-1.5 rounded-md border border-[#d8d4ca] bg-[#fbfaf8] text-[#536174] hover:bg-[#ece8dc] hover:text-[#102d49] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                    aria-label="First page"
                >
                    <ChevronsLeft size={14} />
                </button>

                {/* Previous Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-1.5 rounded-md border border-[#d8d4ca] bg-[#fbfaf8] text-[#536174] hover:bg-[#ece8dc] hover:text-[#102d49] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                    aria-label="Previous page"
                >
                    <ChevronLeft size={14} />
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1 px-1">
                    {visiblePages.map((p, idx) => {
                        if (typeof p === "string") {
                            return (
                                <span key={`ellipsis-${idx}`} className="px-1 text-[#8e897e] font-bold">
                                    ...
                                </span>
                            );
                        }
                        const isCurrent = p === page;
                        return (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPageChange(p)}
                                className={`min-w-[32px] h-8 px-2 rounded-md text-xs font-mono font-bold transition cursor-pointer ${isCurrent
                                        ? "bg-[#102d49] text-white shadow-xs"
                                        : "border border-[#d8d4ca] bg-[#fbfaf8] text-[#536174] hover:bg-[#ece8dc] hover:text-[#102d49]"
                                    }`}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>

                {/* Next Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= total_pages}
                    className="p-1.5 rounded-md border border-[#d8d4ca] bg-[#fbfaf8] text-[#536174] hover:bg-[#ece8dc] hover:text-[#102d49] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                    aria-label="Next page"
                >
                    <ChevronRight size={14} />
                </button>

                {/* Last Page */}
                <button
                    type="button"
                    onClick={() => onPageChange(total_pages)}
                    disabled={page >= total_pages}
                    className="p-1.5 rounded-md border border-[#d8d4ca] bg-[#fbfaf8] text-[#536174] hover:bg-[#ece8dc] hover:text-[#102d49] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                    aria-label="Last page"
                >
                    <ChevronsRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default ProjectPagination;
