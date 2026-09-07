"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText,
    Printer,
    Download,
    ExternalLink,
    X,
    Check,
    AlertTriangle,
    Shield,
    RotateCcw,
} from "@/components/shared/Icons";
import {
    demoReportsStore,
    type FormalReportItem,
} from "./demoReportsStore";

export const ReportsSection: React.FC = () => {
    const [reports, setReports] = useState<FormalReportItem[]>([]);
    const [selectedReport, setSelectedReport] = useState<FormalReportItem | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("ALL");
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [exportNotice, setExportNotice] = useState<string | null>(null);

    useEffect(() => {
        setReports(demoReportsStore.getFormalReports());
        const unsubscribe = demoReportsStore.subscribe(() => {
            setReports(demoReportsStore.getFormalReports());
        });
        return unsubscribe;
    }, []);

    const filteredReports = reports.filter((r) => {
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchId = r.id.toLowerCase().includes(q) || r.report_number.toLowerCase().includes(q);
            const matchTitle = r.title.toLowerCase().includes(q);
            const matchProject = (r.project_title || "").toLowerCase().includes(q);
            const matchState = (r.state || "").toLowerCase().includes(q);
            const matchConst = (r.constituency || "").toLowerCase().includes(q);
            const matchAuthor = r.author.toLowerCase().includes(q);
            if (!matchId && !matchTitle && !matchProject && !matchState && !matchConst && !matchAuthor) {
                return false;
            }
        }
        if (selectedType !== "ALL" && r.report_type !== selectedType) return false;
        if (selectedStatus !== "ALL" && r.status !== selectedStatus) return false;
        return true;
    });

    const handlePrint = () => {
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    const handleExportJson = (report: FormalReportItem) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${report.report_number}_Export.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        setExportNotice(`Exported ${report.report_number} as JSON.`);
        setTimeout(() => setExportNotice(null), 3500);
    };

    const handleExportPdfSim = (report: FormalReportItem) => {
        // Trigger browser print dialog styled for document export
        if (typeof window !== "undefined") {
            window.print();
        }
    };

    const handleReset = () => {
        setSearchQuery("");
        setSelectedType("ALL");
        setSelectedStatus("ALL");
    };

    return (
        <div className="space-y-6">
            {/* Context & Description Banner */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#172033]">
                        <FileText size={18} className="text-[#174a7e]" />
                        <h2 className="text-sm font-bold uppercase tracking-wider">
                            Formal Investigation Reports &amp; Verification Briefs
                        </h2>
                    </div>
                    <p className="text-xs text-[#536174]">
                        Manage, archive, inspect, and export formal administrative oversight records prepared under MoSPI guidelines.
                    </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                    <span className="text-[11px] font-mono font-bold text-[#536174] bg-[#f1f3f6] border border-[#dfe3e8] px-3 py-1.5 rounded-none">
                        {reports.length} Official Dossiers Logged
                    </span>
                </div>
            </div>

            {/* Notification Alert */}
            {exportNotice && (
                <div className="p-3 bg-[#eaf5ef] border border-[#bbf7d0] text-xs text-[#2f7d5a] font-bold flex items-center gap-2">
                    <Check size={14} />
                    <span>{exportNotice}</span>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-4 shadow-xs space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    {/* Search */}
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                            Search Document Dossiers
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by Report ID, Project Title, Location, or Officer..."
                            className="w-full text-xs px-3 py-2 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        />
                    </div>

                    {/* Report Type */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                            Report Type
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full text-xs p-2 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        >
                            <option value="ALL">All Report Types</option>
                            <option value="Verification Brief">Verification Brief</option>
                            <option value="Investigation Dossier">Investigation Dossier</option>
                            <option value="District Audit Summary">District Audit Summary</option>
                        </select>
                    </div>

                    {/* Status & Reset */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                                Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full text-xs p-2 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="Certified">Certified</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>

                        <div className="space-y-1 flex flex-col justify-end">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full p-2 text-xs font-bold text-[#174a7e] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <RotateCcw size={12} />
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dense Reports Table with #174a7e Header */}
            <div className="overflow-x-auto border border-[#dfe3e8] rounded-none bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-[#174a7e] text-white">
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider w-36 whitespace-nowrap">
                                Report ID
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider min-w-[260px]">
                                Document Title &amp; Type
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                                Related Project / Scope
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
                                Generated Date
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
                                Status
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider text-right whitespace-nowrap">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dfe3e8] bg-white">
                        {filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-xs text-[#536174]">
                                    No formal reports found matching the specified search criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredReports.map((report) => {
                                const statusBadge =
                                    report.status === "Certified"
                                        ? "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]"
                                        : report.status === "Under Review"
                                        ? "bg-[#fff4df] text-[#a56a00] border-[#fde68a]"
                                        : "bg-[#f1f3f6] text-[#536174] border-[#dfe3e8]";

                                return (
                                    <tr key={report.id} className="hover:bg-[#fafbfc] transition">
                                        <td className="py-2.5 px-3 font-mono font-bold text-[#174a7e] whitespace-nowrap">
                                            {report.report_number}
                                        </td>
                                        <td className="py-2.5 px-3 min-w-[260px]">
                                            <span className="font-bold text-[#172033] block">
                                                {report.title}
                                            </span>
                                            <span className="text-[10px] text-[#536174] block mt-0.5">
                                                {report.report_type} · By {report.author}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 max-w-xs">
                                            {report.project_title ? (
                                                <>
                                                    <span className="font-bold text-[#172033] block truncate" title={report.project_title}>
                                                        REC-{String(report.project_id).padStart(5, "0")} · {report.project_title}
                                                    </span>
                                                    <span className="text-[10px] text-[#536174]">
                                                        {report.constituency}, {report.state}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-[#172033] font-medium">
                                                    {report.constituency}, {report.state}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-[#536174] whitespace-nowrap text-[11px]">
                                            {report.generated_date}
                                        </td>
                                        <td className="py-2.5 px-3 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}
                                            >
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedReport(report)}
                                                className="px-3 py-1 text-[11px] font-bold text-[#174a7e] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition cursor-pointer"
                                            >
                                                View Document
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Document Detail Modal / Drawer */}
            {selectedReport && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto"
                    onClick={() => setSelectedReport(null)}
                >
                    <div
                        className="bg-white border border-[#dfe3e8] shadow-xl max-w-3xl w-full p-6 space-y-5 rounded-none my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-[#dfe3e8] pb-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-[#174a7e]">
                                        {selectedReport.report_number}
                                    </span>
                                    <span className="px-2 py-0.2 text-[10px] font-bold border border-[#dfe3e8] bg-[#f1f3f6] text-[#536174]">
                                        {selectedReport.report_type}
                                    </span>
                                    <span className="px-2 py-0.2 text-[10px] font-bold border border-[#bbf7d0] bg-[#eaf5ef] text-[#2f7d5a]">
                                        {selectedReport.status}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-[#172033]">
                                    {selectedReport.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedReport(null)}
                                className="text-[#536174] hover:text-[#172033] p-1 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Document Content Box */}
                        <div className="p-4 bg-[#fafbfc] border border-[#dfe3e8] space-y-4 text-xs">
                            {/* Metadata Matrix */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-[#dfe3e8] pb-3 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold text-[#536174] uppercase block">Location</span>
                                    <span className="font-semibold text-[#172033] mt-0.5 block">{selectedReport.constituency}, {selectedReport.state}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-[#536174] uppercase block">Representative</span>
                                    <span className="font-semibold text-[#172033] mt-0.5 block">{selectedReport.mp_name || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-[#536174] uppercase block">Sanctioned Amount</span>
                                    <span className="font-mono font-bold text-[#174a7e] mt-0.5 block">
                                        {selectedReport.sanctioned_amount ? `₹${(selectedReport.sanctioned_amount / 100000).toFixed(2)} Lakhs` : "—"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-[#536174] uppercase block">Sign-off Authority</span>
                                    <span className="font-semibold text-[#172033] mt-0.5 block">{selectedReport.author}</span>
                                </div>
                            </div>

                            {/* Executive Summary */}
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                                    1. Executive Summary &amp; Review Finding
                                </span>
                                <p className="text-[#172033] leading-relaxed p-3 bg-white border border-[#dfe3e8]">
                                    {selectedReport.summary}
                                </p>
                            </div>

                            {/* Observed Signals */}
                            {selectedReport.observed_signals && selectedReport.observed_signals.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                                        2. Observed Discrepancies &amp; Rate Indications
                                    </span>
                                    <div className="space-y-1">
                                        {selectedReport.observed_signals.map((sig, idx) => (
                                            <div key={idx} className="p-2 bg-[#fff0e6]/40 border border-[#fed7aa] text-[#172033] flex items-start gap-1.5">
                                                <AlertTriangle size={13} className="text-[#c2410c] shrink-0 mt-0.5" />
                                                <span>{sig}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                                    3. Required Follow-up Actions &amp; Directives
                                </span>
                                <div className="space-y-1">
                                    {selectedReport.recommendations.map((rec, idx) => (
                                        <div key={idx} className="p-2 bg-[#eaf5ef]/40 border border-[#bbf7d0] text-[#172033] flex items-start gap-1.5">
                                            <Check size={13} className="text-[#2f7d5a] shrink-0 mt-0.5" />
                                            <span>{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Governance Disclaimer */}
                            <div className="p-2.5 bg-[#f1f3f6] border border-[#dfe3e8] text-[10px] text-[#536174] italic">
                                <strong>Official Oversight Record:</strong> This verification brief is prepared for administrative review and audit tracking under Ministry of Statistics and Programme Implementation guidelines.
                            </div>
                        </div>

                        {/* Modal Action Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#dfe3e8]">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="px-3.5 py-1.5 text-xs font-bold text-[#172033] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Printer size={13} />
                                    <span>Print Formal Brief</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExportJson(selectedReport)}
                                    className="px-3.5 py-1.5 text-xs font-bold text-[#174a7e] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Download size={13} />
                                    <span>Export JSON</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                {selectedReport.project_id && (
                                    <Link
                                        href={`/evidence?mode=case&caseId=${selectedReport.project_id}`}
                                        className="px-4 py-2 text-xs font-bold text-white bg-[#174a7e] hover:bg-[#123b65] transition inline-flex items-center gap-1.5"
                                    >
                                        <span>Open in Case File</span>
                                        <ExternalLink size={13} />
                                    </Link>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setSelectedReport(null)}
                                    className="px-3 py-1.5 text-xs font-bold text-[#536174] hover:text-[#172033] cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
