"use client";

import React, { useState } from "react";
import {
    AlertTriangle,
    Check,
    Info,
    Clock,
    Shield,
} from "@/components/shared/Icons";
import { demoReportsStore } from "./demoReportsStore";

export const ReportDataIssueForm: React.FC = () => {
    const [issueType, setIssueType] = useState<string>("Incorrect Data");
    const [location, setLocation] = useState<string>("");
    const [mpName, setMpName] = useState<string>("");
    const [projectId, setProjectId] = useState<string>("");
    const [expectedValue, setExpectedValue] = useState<string>("");
    const [currentValue, setCurrentValue] = useState<string>("");
    const [contactEmail, setContactEmail] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const [submittedId, setSubmittedId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        setIsSubmitting(true);
        setTimeout(() => {
            const submission = demoReportsStore.addDataIssue({
                issueType,
                location: location.trim(),
                mpName: mpName.trim(),
                projectId: projectId.trim(),
                expectedValue: expectedValue.trim(),
                currentValue: currentValue.trim(),
                description: description.trim(),
                contactEmail: contactEmail.trim() || undefined,
            });

            setIsSubmitting(false);
            setSubmittedId(submission.id);

            // Reset form inputs
            setLocation("");
            setMpName("");
            setProjectId("");
            setExpectedValue("");
            setCurrentValue("");
            setContactEmail("");
            setDescription("");
        }, 600);
    };

    return (
        <div className="space-y-6">
            {/* Header / Intro */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-1">
                <div className="flex items-center gap-2 text-[#172033]">
                    <AlertTriangle size={18} className="text-[#a56a00]" />
                    <h2 className="text-base font-bold text-[#172033]">
                        Report Data Issue
                    </h2>
                </div>
                <p className="text-xs text-[#536174]">
                    Found incorrect, missing, or outdated information? Help us maintain accurate data by reporting issues.
                </p>
            </div>

            {/* Submission Acknowledgment Banner */}
            {submittedId && (
                <div className="rounded-lg border border-[#bbf7d0] bg-[#eaf5ef] p-4 text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-[#2f7d5a]">
                            <Check size={16} />
                            <span>Data Issue Report Logged Successfully</span>
                        </div>
                        <span className="font-mono font-bold text-[#174a7e] bg-white border border-[#bbf7d0] px-2 py-0.5">
                            {submittedId}
                        </span>
                    </div>
                    <p className="text-[#172033] leading-relaxed">
                        Your issue report has been logged with reference ID <strong>{submittedId}</strong>. You can track its review progress inside the <strong>Submissions</strong> tab.
                    </p>
                </div>
            )}

            {/* Main Form Container */}
            <form onSubmit={handleSubmit} className="rounded-lg border border-[#dfe3e8] bg-white p-6 shadow-xs space-y-5">
                {/* 2-Column Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* 1. Issue Type */}
                    <div className="space-y-1">
                        <label className="font-bold text-[#172033] block">
                            Issue Type <span className="text-[#c2410c]">*</span>
                        </label>
                        <select
                            value={issueType}
                            onChange={(e) => setIssueType(e.target.value)}
                            required
                            className="w-full p-2.5 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        >
                            <option value="Incorrect Data">Incorrect Data</option>
                            <option value="Missing Data">Missing Data</option>
                            <option value="Outdated Data">Outdated Data</option>
                        </select>
                    </div>

                    {/* 2. Location */}
                    <div className="space-y-1">
                        <label className="font-bold text-[#172033] block">
                            Location (State / Constituency)
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. North District, State Sector A"
                            className="w-full p-2.5 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        />
                    </div>

                    {/* 3. MP Name */}
                    <div className="space-y-1">
                        <label className="font-bold text-[#172033] block">
                            MP Representative Name
                        </label>
                        <input
                            type="text"
                            value={mpName}
                            onChange={(e) => setMpName(e.target.value)}
                            placeholder="e.g. Representative S. Kumar"
                            className="w-full p-2.5 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        />
                    </div>

                    {/* 4. Work / Project ID */}
                    <div className="space-y-1">
                        <label className="font-bold text-[#172033] block">
                            Work / Project ID (if applicable)
                        </label>
                        <input
                            type="text"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            placeholder="e.g. REC-00001"
                            className="w-full p-2.5 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        />
                    </div>

                    {/* 5. Expected / Correct Value */}
                    <div className="space-y-1">
                        <label className="font-bold text-[#172033] block">
                            Expected / Correct Value
                        </label>
                        <input
                            type="text"
                            value={expectedValue}
                            onChange={(e) => setExpectedValue(e.target.value)}
                            placeholder="e.g. Sanctioned Amount: ₹18.50 Lakhs"
                            className="w-full p-2.5 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        />
                    </div>

                    {/* 6. Current / Incorrect Value */}
                    <div className="space-y-1">
                        <label className="font-bold text-[#172033] block">
                            Current / Incorrect Value
                        </label>
                        <input
                            type="text"
                            value={currentValue}
                            onChange={(e) => setCurrentValue(e.target.value)}
                            placeholder="e.g. Portal displays ₹35.00 Lakhs"
                            className="w-full p-2.5 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        />
                    </div>
                </div>

                {/* Contact Email (Optional) */}
                <div className="text-xs space-y-1">
                    <label className="font-bold text-[#172033] block">
                        Contact Email (Optional — for resolution notifications)
                    </label>
                    <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="officer.email@mospi.gov.in"
                        className="w-full p-2.5 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                    />
                </div>

                {/* Issue Description (Full width with 0/1000 live counter) */}
                <div className="text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="font-bold text-[#172033] block">
                            Issue Description <span className="text-[#c2410c]">*</span>
                        </label>
                        <span className={`font-mono text-[11px] ${description.length > 950 ? "text-[#c2410c] font-bold" : "text-[#536174]"}`}>
                            {description.length} / 1000
                        </span>
                    </div>
                    <textarea
                        rows={5}
                        maxLength={1000}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        placeholder="Describe the data discrepancy in detail. Mention specific source documents (e.g. sanctioned order numbers, measurement book entry dates, tender notices) if available..."
                        className="w-full p-3 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e] leading-relaxed"
                    />
                </div>

                {/* Submit Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#dfe3e8] text-xs">
                    <span className="text-[11px] text-[#536174] italic">
                        * Data issue reports are logged for human audit review. They do not automatically alter live case metrics.
                    </span>

                    <button
                        type="submit"
                        disabled={!description.trim() || isSubmitting}
                        className="px-6 py-2.5 text-xs font-bold text-white bg-[#174a7e] hover:bg-[#123b65] disabled:opacity-50 transition cursor-pointer self-end sm:self-auto"
                    >
                        {isSubmitting ? "Logging Report..." : "Report Issue"}
                    </button>
                </div>
            </form>

            {/* Structured Guidance Sections Below the Form (Normal Browser Zoom & Spacing) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Section A: What Happens After You Submit */}
                <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4 text-xs">
                    <div className="flex items-center gap-2 text-[#172033] border-b border-[#dfe3e8] pb-3">
                        <Clock size={16} className="text-[#174a7e]" />
                        <h3 className="font-bold uppercase tracking-wider text-[11px]">
                            What Happens After You Submit?
                        </h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8f0f8] text-[#174a7e] font-bold text-[10px] mt-0.5">
                                1
                            </span>
                            <div>
                                <strong className="text-[#172033] block">Immediate Acknowledgment</strong>
                                <p className="text-[#536174] leading-relaxed mt-0.5">
                                    Your feedback is received and logged in our system with a unique tracking reference.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8f0f8] text-[#174a7e] font-bold text-[10px] mt-0.5">
                                2
                            </span>
                            <div>
                                <strong className="text-[#172033] block">Review Process</strong>
                                <p className="text-[#536174] leading-relaxed mt-0.5">
                                    Our team reviews your submission within 2–3 business days against official district source feeds.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8f0f8] text-[#174a7e] font-bold text-[10px] mt-0.5">
                                3
                            </span>
                            <div>
                                <strong className="text-[#172033] block">Follow-up</strong>
                                <p className="text-[#536174] leading-relaxed mt-0.5">
                                    If you provided an email, we&apos;ll update you on the resolution and any registry updates.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section B: Tips for Effective Reporting */}
                <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4 text-xs">
                    <div className="flex items-center gap-2 text-[#172033] border-b border-[#dfe3e8] pb-3">
                        <Info size={16} className="text-[#174a7e]" />
                        <h3 className="font-bold uppercase tracking-wider text-[11px]">
                            Tips for Effective Reporting
                        </h3>
                    </div>

                    <ul className="space-y-2.5 text-[#536174] leading-relaxed list-disc list-inside">
                        <li>
                            <strong className="text-[#172033]">Be specific:</strong> Detail exact amounts, dates, and work descriptions rather than broad statements.
                        </li>
                        <li>
                            <strong className="text-[#172033]">Include identifiers:</strong> Provide relevant MP names, constituency labels, or Project IDs (e.g. REC-00045).
                        </li>
                        <li>
                            <strong className="text-[#172033]">Compare values:</strong> For data issues, mention both what you expected and what you found recorded.
                        </li>
                        <li>
                            <strong className="text-[#172033]">Provide contact email:</strong> Enter an official email if you require tracking updates on the inquiry resolution.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
