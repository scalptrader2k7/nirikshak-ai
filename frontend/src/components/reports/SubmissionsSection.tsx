"use client";

import React, { useState, useEffect } from "react";
import {
    ClipboardCheck,
    Search,
    RotateCcw,
    X,
    FileText,
    ExternalLink,
} from "@/components/shared/Icons";
import {
    demoReportsStore,
    type SubmissionItem,
} from "./demoReportsStore";

export const SubmissionsSection: React.FC = () => {
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("ALL");
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

    useEffect(() => {
        setSubmissions(demoReportsStore.getSubmissions());
        const unsubscribe = demoReportsStore.subscribe(() => {
            setSubmissions(demoReportsStore.getSubmissions());
        });
        return unsubscribe;
    }, []);

    const filteredSubmissions = submissions.filter((s) => {
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchId = s.id.toLowerCase().includes(q);
            const matchSubject = s.subject.toLowerCase().includes(q);
            const matchType = s.submission_type.toLowerCase().includes(q);
            const matchSubmitter = s.submitter.toLowerCase().includes(q);
            if (!matchId && !matchSubject && !matchType && !matchSubmitter) {
                return false;
            }
        }
        if (selectedType !== "ALL" && s.submission_type !== selectedType) return false;
        if (selectedStatus !== "ALL" && s.status !== selectedStatus) return false;
        return true;
    });

    const handleReset = () => {
        setSearchQuery("");
        setSelectedType("ALL");
        setSelectedStatus("ALL");
    };

    return (
        <div className="space-y-6">
            {/* Header / Intro */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[#172033]">
                        <ClipboardCheck size={18} className="text-[#174a7e]" />
                        <h2 className="text-sm font-bold uppercase tracking-wider">
                            Submission Tracking &amp; Ingestion Logs
                        </h2>
                    </div>
                    <p className="text-xs text-[#536174]">
                        Track the processing status, resolution timeline, and review state of all previous data intakes, issue reports, and feedback.
                    </p>
                </div>

                <span className="text-[11px] font-mono font-bold text-[#536174] bg-[#f1f3f6] border border-[#dfe3e8] px-3 py-1.5 rounded-none self-start md:self-auto">
                    {submissions.length} Total Submissions Recorded
                </span>
            </div>

            {/* Filter & Search Bar (NO Active Filter Chips) */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-4 shadow-xs space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    {/* Search */}
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                            Search Submissions
                        </label>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#536174]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by Submission ID, subject, or project reference..."
                                className="w-full text-xs pl-9 pr-3 py-2 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                            />
                        </div>
                    </div>

                    {/* Submission Type */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#536174] uppercase tracking-wider block">
                            Submission Type
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full text-xs p-2 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        >
                            <option value="ALL">All Submission Types</option>
                            <option value="Data Intake">Data Intake</option>
                            <option value="Report Data Issue">Report Data Issue</option>
                            <option value="Give Feedback">Give Feedback</option>
                            <option value="Formal Report Archive">Formal Report Archive</option>
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
                                <option value="Logged / Awaiting Review">Awaiting Review</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Processed">Processed</option>
                                <option value="Acknowledged">Acknowledged</option>
                                <option value="Action Taken">Action Taken</option>
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

            {/* Submissions Table with #174a7e Header */}
            <div className="overflow-x-auto border border-[#dfe3e8] rounded-none bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-[#174a7e] text-white">
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider w-36 whitespace-nowrap">
                                Submission ID
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
                                Type
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider min-w-[240px]">
                                Subject / Context
                            </th>
                            <th className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
                                Submitted On
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
                        {filteredSubmissions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-xs text-[#536174]">
                                    No submissions match the specified query and filter criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredSubmissions.map((item) => {
                                const statusBadge =
                                    item.status === "Action Taken" || item.status === "Processed"
                                        ? "bg-[#eaf5ef] text-[#2f7d5a] border-[#bbf7d0]"
                                        : item.status === "Under Review" || item.status === "Logged / Awaiting Review"
                                        ? "bg-[#fff4df] text-[#a56a00] border-[#fde68a]"
                                        : "bg-[#f1f3f6] text-[#536174] border-[#dfe3e8]";

                                return (
                                    <tr key={item.id} className="hover:bg-[#fafbfc] transition">
                                        <td className="py-2.5 px-3 font-mono font-bold text-[#174a7e] whitespace-nowrap">
                                            {item.id}
                                        </td>
                                        <td className="py-2.5 px-3 whitespace-nowrap">
                                            <span className="font-bold text-[#172033] block">
                                                {item.submission_type}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 min-w-[240px]">
                                            <span className="font-bold text-[#172033] block leading-snug">
                                                {item.subject}
                                            </span>
                                            <span className="text-[10px] text-[#536174] block mt-0.5">
                                                Submitter: {item.submitter}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#536174] whitespace-nowrap">
                                            {item.submitted_on}
                                        </td>
                                        <td className="py-2.5 px-3 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedSubmission(item)}
                                                className="px-3 py-1 text-[11px] font-bold text-[#174a7e] bg-[#f1f3f6] hover:bg-[#e8f0f8] border border-[#dfe3e8] transition cursor-pointer"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Submission Detail Modal */}
            {selectedSubmission && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs"
                    onClick={() => setSelectedSubmission(null)}
                >
                    <div
                        className="bg-white border border-[#dfe3e8] shadow-xl max-w-xl w-full p-6 space-y-4 rounded-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-[#dfe3e8] pb-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-[#174a7e]">
                                        {selectedSubmission.id}
                                    </span>
                                    <span className="px-2 py-0.2 text-[10px] font-bold border border-[#dfe3e8] bg-[#f1f3f6] text-[#536174]">
                                        {selectedSubmission.submission_type}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-[#172033]">
                                    {selectedSubmission.subject}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedSubmission(null)}
                                className="text-[#536174] hover:text-[#172033] p-1 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Metadata Details */}
                        <div className="p-3 bg-[#fafbfc] border border-[#dfe3e8] space-y-2.5 text-xs">
                            <div className="grid grid-cols-2 gap-2 border-b border-[#dfe3e8] pb-2 text-[11px]">
                                <div>
                                    <span className="text-[#536174]">Submitted On:</span>
                                    <span className="font-mono font-bold text-[#172033] block">{selectedSubmission.submitted_on}</span>
                                </div>
                                <div>
                                    <span className="text-[#536174]">Current Status:</span>
                                    <span className="font-bold text-[#174a7e] block">{selectedSubmission.status}</span>
                                </div>
                            </div>

                            {selectedSubmission.contact_email && (
                                <div className="text-[11px]">
                                    <span className="text-[#536174]">Contact Email:</span>
                                    <span className="font-semibold text-[#172033] block">{selectedSubmission.contact_email}</span>
                                </div>
                            )}

                            <div className="space-y-1.5 pt-1">
                                <span className="font-bold text-[#172033] text-[11px] block uppercase tracking-wider">
                                    Submission Payload &amp; Remarks:
                                </span>
                                <div className="p-3 bg-white border border-[#dfe3e8] space-y-2 text-xs">
                                    {Object.entries(selectedSubmission.details).map(([key, val]) => (
                                        <div key={key} className="space-y-0.5">
                                            <span className="font-bold text-[#536174] capitalize text-[10px] block">
                                                {key.replace(/([A-Z])/g, " $1")}:
                                            </span>
                                            <p className="text-[#172033] leading-relaxed">
                                                {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#dfe3e8] text-xs">
                            <span className="text-[11px] text-[#536174]">
                                Immutably logged in system audit record.
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedSubmission(null)}
                                className="px-4 py-2 text-xs font-bold text-[#536174] hover:text-[#172033] bg-[#f1f3f6] border border-[#dfe3e8] cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
