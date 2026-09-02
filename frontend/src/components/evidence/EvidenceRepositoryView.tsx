"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
    Search,
    RotateCcw,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    X,
} from "@/components/shared/Icons";
import {
    getEvidenceRepositoryData,
    type EvidenceRepositoryItem,
} from "./demoEvidenceRepository";

interface EvidenceRepositoryViewProps {
    onOpenCase?: (projectId: number) => void;
}

export const EvidenceRepositoryView: React.FC<EvidenceRepositoryViewProps> = ({
    onOpenCase,
}) => {
    const allItems = useMemo(() => getEvidenceRepositoryData(), []);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("ALL");
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedState, setSelectedState] = useState("ALL");
    const [selectedWorkType, setSelectedWorkType] = useState("ALL");
    const [selectedRisk, setSelectedRisk] = useState("ALL");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    // Preview Drawer Modal
    const [previewItem, setPreviewItem] = useState<EvidenceRepositoryItem | null>(null);

    // Dynamic Filter Options
    const stateOptions = useMemo(() => {
        return Array.from(new Set(allItems.map((i) => i.state).filter(Boolean))).sort();
    }, [allItems]);

    const workTypeOptions = useMemo(() => {
        return Array.from(new Set(allItems.map((i) => i.work_type).filter(Boolean))).sort();
    }, [allItems]);

    const typeOptions = [
        "Site Photograph",
        "Measurement Book",
        "Rate Schedule (DSR)",
        "Contractor Invoice",
        "Intake Anomaly Record",
        "Duplicate Signature",
        "Administrative Sanction",
    ];

    const statusOptions = [
        "Verified",
        "Pending",
        "Requires Verification",
        "Not Reviewed",
    ];

    // Filter logic
    const filteredItems = useMemo(() => {
        return allItems.filter((item) => {
            // Search Query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchId = item.id.toLowerCase().includes(q);
                const matchProject = item.project_title.toLowerCase().includes(q);
                const matchProjectId = `rec-${item.project_id}`.toLowerCase().includes(q) || String(item.project_id).includes(q);
                const matchMp = item.mp_name.toLowerCase().includes(q);
                const matchConst = item.constituency.toLowerCase().includes(q);
                const matchState = item.state.toLowerCase().includes(q);
                const matchDoc = item.document_ref.toLowerCase().includes(q);
                const matchVendor = item.vendor_name.toLowerCase().includes(q);
                const matchSource = item.source.toLowerCase().includes(q);
                const matchType = item.evidence_type.toLowerCase().includes(q);

                if (!matchId && !matchProject && !matchProjectId && !matchMp && !matchConst && !matchState && !matchDoc && !matchVendor && !matchSource && !matchType) {
                    return false;
                }
            }

            // Evidence Type
            if (selectedType !== "ALL" && item.evidence_type !== selectedType) {
                return false;
            }

            // Verification Status
            if (selectedStatus !== "ALL" && item.verification_status !== selectedStatus) {
                return false;
            }

            // State
            if (selectedState !== "ALL" && item.state !== selectedState) {
                return false;
            }

            // Work Type
            if (selectedWorkType !== "ALL" && item.work_type !== selectedWorkType) {
                return false;
            }

            // Risk Level (Low / Medium / High only)
            if (selectedRisk !== "ALL") {
                if (selectedRisk === "HIGH" && item.risk_level !== "HIGH" && item.risk_level !== "CRITICAL") return false;
                if (selectedRisk === "MEDIUM" && item.risk_level !== "MEDIUM") return false;
                if (selectedRisk === "LOW" && item.risk_level !== "LOW") return false;
            }

            return true;
        });
    }, [
        allItems,
        searchQuery,
        selectedType,
        selectedStatus,
        selectedState,
        selectedWorkType,
        selectedRisk,
    ]);

    const totalRecords = filteredItems.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredItems.slice(start, start + pageSize);
    }, [filteredItems, currentPage, pageSize]);

    const handleReset = () => {
        setSearchQuery("");
        setSelectedType("ALL");
        setSelectedStatus("ALL");
        setSelectedState("ALL");
        setSelectedWorkType("ALL");
        setSelectedRisk("ALL");
        setCurrentPage(1);
    };

    return (
        <div className="space-y-5">
            {/* Search & Filter Controls (No active chips rule) */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-4 shadow-xs space-y-3">
                {/* Search Bar */}
                <div className="relative">
                    <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#536174]"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search evidence ID, project title, invoice, vendor, MP, constituency, or document ref..."
                        className="w-full text-xs pl-10 pr-4 py-2.5 border border-[#dfe3e8] rounded-none focus:outline-none focus:ring-1 focus:ring-[#174a7e] bg-[#fafbfc] text-[#172033]"
                    />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                    {/* Evidence Type */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                            Evidence Type
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full text-xs p-2 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        >
                            <option value="ALL">All Types</option>
                            {typeOptions.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Verification Status */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                            Verification Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full text-xs p-2 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        >
                            <option value="ALL">All Statuses</option>
                            {statusOptions.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* State */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                            State
                        </label>
                        <select
                            value={selectedState}
                            onChange={(e) => {
                                setSelectedState(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full text-xs p-2 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        >
                            <option value="ALL">All States</option>
                            {stateOptions.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Work Category */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                            Work Category
                        </label>
                        <select
                            value={selectedWorkType}
                            onChange={(e) => {
                                setSelectedWorkType(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full text-xs p-2 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        >
                            <option value="ALL">All Categories</option>
                            {workTypeOptions.map((w) => (
                                <option key={w} value={w}>
                                    {w}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Project Risk Level */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                            Project Risk
                        </label>
                        <select
                            value={selectedRisk}
                            onChange={(e) => {
                                setSelectedRisk(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full text-xs p-2 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        >
                            <option value="ALL">All Risk Levels</option>
                            <option value="HIGH">High Risk</option>
                            <option value="MEDIUM">Medium Risk</option>
                            <option value="LOW">Low Risk</option>
                        </select>
                    </div>

                    {/* Reset Button */}
                    <div className="space-y-1 flex flex-col justify-end">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="w-full p-2 text-xs font-bold text-[#174a7e] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <RotateCcw size={13} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count Summary */}
            <div className="flex items-center justify-between text-xs text-[#536174]">
                <span>
                    Showing{" "}
                    <strong className="text-[#172033]">
                        {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                    </strong>{" "}
                    to{" "}
                    <strong className="text-[#172033]">
                        {Math.min(currentPage * pageSize, totalRecords)}
                    </strong>{" "}
                    of <strong className="text-[#172033]">{totalRecords}</strong> matching evidence records
                </span>
                <span className="text-[11px] italic">
                    * Viewing evidence is read-only. Official verification is conducted inside the Case File.
                </span>
            </div>

            {/* Dense Government-Style Table with #174a7e Header */}
            <div className="overflow-x-auto border border-[#dfe3e8] rounded-none bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-[#174a7e] text-white">
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider w-36 whitespace-nowrap">
                                Evidence ID
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider min-w-[280px]">
                                Evidence Record &amp; Type
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                Associated Project
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
                                Location &amp; MP
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
                                Verification
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider text-right whitespace-nowrap">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dfe3e8] bg-white">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-xs text-[#536174]">
                                    No evidence records found matching the specified query and filter criteria.
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((item) => {
                                const statusBadge =
                                    item.verification_status === "Verified"
                                        ? "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]"
                                        : item.verification_status === "Requires Verification"
                                        ? "bg-[#fff0e6] text-[#c2410c] border-[#fed7aa]"
                                        : "bg-[#fff4df] text-[#a56a00] border-[#fde68a]";

                                return (
                                    <tr key={item.id} className="hover:bg-[#fafbfc] transition">
                                        <td className="py-2.5 px-3 font-mono font-bold text-[#174a7e] whitespace-nowrap w-36">
                                            {item.id}
                                        </td>
                                        <td className="py-2.5 px-3 min-w-[280px]">
                                            <span className="font-bold text-[#172033] block leading-snug">
                                                {item.title}
                                            </span>
                                            <span className="text-[10px] text-[#536174] block mt-0.5">
                                                {item.evidence_type} · Ref: <span className="font-mono">{item.document_ref}</span>
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 max-w-xs">
                                            <span className="font-bold text-[#172033] block truncate" title={item.project_title}>
                                                REC-{String(item.project_id).padStart(5, "0")} · {item.project_title}
                                            </span>
                                            <span className="text-[10px] text-[#536174]">
                                                {item.work_type} (₹{((item.sanctioned_amount || 0) / 100000).toFixed(2)}L)
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 whitespace-nowrap">
                                            <span className="text-[#172033] font-medium block">
                                                {item.constituency}, {item.state}
                                            </span>
                                            <span className="text-[10px] text-[#536174]">
                                                {item.mp_name}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}
                                            >
                                                {item.verification_status}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewItem(item)}
                                                className="px-3 py-1 text-[11px] font-bold text-[#174a7e] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition cursor-pointer"
                                            >
                                                View Evidence
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-3 border-t border-[#dfe3e8] flex items-center justify-between text-xs bg-[#fafbfc]">
                        <span className="text-[#536174]">
                            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="px-3 py-1 border border-[#dfe3e8] bg-white text-[#172033] disabled:opacity-40 hover:bg-[#f1f3f6] font-bold cursor-pointer"
                            >
                                <ChevronLeft size={13} className="inline" /> Prev
                            </button>
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="px-3 py-1 border border-[#dfe3e8] bg-white text-[#172033] disabled:opacity-40 hover:bg-[#f1f3f6] font-bold cursor-pointer"
                            >
                                Next <ChevronRight size={13} className="inline" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Read-Only Evidence Preview & Traceability Drawer */}
            {previewItem && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs"
                    onClick={() => setPreviewItem(null)}
                >
                    <div
                        className="bg-white border border-[#dfe3e8] shadow-lg max-w-xl w-full p-6 space-y-4 rounded-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-[#dfe3e8] pb-3">
                            <div className="space-y-1">
                                <span className="font-mono text-xs font-bold text-[#174a7e] block">
                                    {previewItem.id}
                                </span>
                                <h3 className="text-base font-bold text-[#172033]">
                                    {previewItem.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewItem(null)}
                                className="text-[#536174] hover:text-[#172033] p-1 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-2.5 bg-[#fafbfc] border border-[#dfe3e8]">
                                <span className="text-[10px] font-bold text-[#536174] uppercase block">
                                    Evidence Type
                                </span>
                                <span className="font-bold text-[#172033] mt-0.5 block">
                                    {previewItem.evidence_type}
                                </span>
                            </div>
                            <div className="p-2.5 bg-[#fafbfc] border border-[#dfe3e8]">
                                <span className="text-[10px] font-bold text-[#536174] uppercase block">
                                    Verification State
                                </span>
                                <span className="font-bold text-[#172033] mt-0.5 block">
                                    {previewItem.verification_status}
                                </span>
                            </div>
                            <div className="p-2.5 bg-[#fafbfc] border border-[#dfe3e8]">
                                <span className="text-[10px] font-bold text-[#536174] uppercase block">
                                    Source Feed
                                </span>
                                <span className="font-bold text-[#172033] mt-0.5 block truncate">
                                    {previewItem.source}
                                </span>
                            </div>
                            <div className="p-2.5 bg-[#fafbfc] border border-[#dfe3e8]">
                                <span className="text-[10px] font-bold text-[#536174] uppercase block">
                                    Document Ref
                                </span>
                                <span className="font-mono font-bold text-[#172033] mt-0.5 block">
                                    {previewItem.document_ref}
                                </span>
                            </div>
                        </div>

                        <div className="p-3 bg-[#fafbfc] border border-[#dfe3e8] space-y-1.5 text-xs">
                            <span className="text-[10px] font-bold text-[#536174] uppercase block">
                                Cross-Case Traceability &amp; Context
                            </span>
                            <p className="text-[#172033] leading-relaxed">
                                {previewItem.traceability_notes}
                            </p>
                            <p className="text-[11px] text-[#536174] pt-1">
                                Linked Project: <strong>REC-{String(previewItem.project_id).padStart(5, "0")}</strong> ({previewItem.project_title})
                            </p>
                        </div>

                        <div className="p-2.5 bg-[#f1f3f6] border border-[#dfe3e8] text-[10px] text-[#536174] italic">
                            * Viewing evidence metadata does not certify the record. To perform official verification, open the associated Case File.
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#dfe3e8]">
                            <button
                                type="button"
                                onClick={() => setPreviewItem(null)}
                                className="px-3.5 py-1.5 text-xs font-bold text-[#536174] hover:text-[#172033] cursor-pointer"
                            >
                                Close Preview
                            </button>
                            {onOpenCase ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const pid = previewItem.project_id;
                                        setPreviewItem(null);
                                        onOpenCase(pid);
                                    }}
                                    className="px-4 py-2 text-xs font-bold text-white bg-[#174a7e] hover:bg-[#123b65] transition inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span>View Full Case</span>
                                    <ExternalLink size={13} />
                                </button>
                            ) : (
                                <Link
                                    href={`/projects/${previewItem.project_id}`}
                                    className="px-4 py-2 text-xs font-bold text-white bg-[#174a7e] hover:bg-[#123b65] transition inline-flex items-center gap-1.5"
                                >
                                    <span>View Full Case</span>
                                    <ExternalLink size={13} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
