"use client";

import React, { useState } from "react";
import {
    Check,
    Info,
    Shield,
} from "@/components/shared/Icons";
import { demoReportsStore } from "./demoReportsStore";

export const GiveFeedbackForm: React.FC = () => {
    const [category, setCategory] = useState<string>("Usability & Navigation");
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [contactEmail, setContactEmail] = useState<string>("");

    const [submittedId, setSubmittedId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        setIsSubmitting(true);
        setTimeout(() => {
            const submission = demoReportsStore.addFeedback({
                category,
                title: title.trim(),
                description: description.trim(),
                contactEmail: contactEmail.trim() || undefined,
            });

            setIsSubmitting(false);
            setSubmittedId(submission.id);

            // Reset
            setTitle("");
            setDescription("");
            setContactEmail("");
        }, 500);
    };

    return (
        <div className="space-y-6">
            {/* Header / Intro */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-1">
                <h2 className="text-base font-bold text-[#172033]">
                    Give Feedback
                </h2>
                <p className="text-xs text-[#536174]">
                    Share feedback, usability notes, bug reports, or feature suggestions regarding the NIRIKSHAK AI platform.
                </p>
            </div>

            {/* Scope Distinction Notice */}
            <div className="flex items-start gap-2.5 p-3.5 bg-[#f1f3f6] border border-[#dfe3e8] text-xs text-[#536174]">
                <Info size={15} className="text-[#174a7e] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    <strong className="text-[#172033]">Platform Feedback Scope:</strong> This form is specifically for feedback concerning NIRIKSHAK AI software behavior, interface ergonomics, and tool capabilities. To report incorrect or missing scheme data for a project, please use the <strong>Report Data Issue</strong> tab.
                </p>
            </div>

            {/* Submission Acknowledgment Banner */}
            {submittedId && (
                <div className="rounded-lg border border-[#bbf7d0] bg-[#eaf5ef] p-4 text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-[#2f7d5a]">
                            <Check size={16} />
                            <span>Platform Feedback Recorded Successfully</span>
                        </div>
                        <span className="font-mono font-bold text-[#174a7e] bg-white border border-[#bbf7d0] px-2 py-0.5">
                            {submittedId}
                        </span>
                    </div>
                    <p className="text-[#172033] leading-relaxed">
                        Thank you for your feedback. It has been logged under reference ID <strong>{submittedId}</strong> and routed to the development and product oversight team.
                    </p>
                </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="rounded-lg border border-[#dfe3e8] bg-white p-6 shadow-xs space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="space-y-1">
                        <label className="font-bold text-[#172033] block">
                            Feedback Category <span className="text-[#c2410c]">*</span>
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-2.5 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        >
                            <option value="Usability & Navigation">Usability &amp; Navigation</option>
                            <option value="Investigation Tools">Investigation Tools &amp; Rate Analysis</option>
                            <option value="System Behavior / Bug">System Behavior / Bug Report</option>
                            <option value="Feature Suggestion">Feature Suggestion</option>
                            <option value="Other">Other Platform Feedback</option>
                        </select>
                    </div>

                    {/* Subject / Title */}
                    <div className="space-y-1">
                        <label className="font-bold text-[#172033] block">
                            Subject / Title <span className="text-[#c2410c]">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Brief summary of your feedback..."
                            className="w-full p-2.5 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                        />
                    </div>
                </div>

                {/* Contact Email */}
                <div className="space-y-1">
                    <label className="font-bold text-[#172033] block">
                        Contact Email (Optional)
                    </label>
                    <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="your.email@organization.gov.in"
                        className="w-full p-2.5 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                    />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="font-bold text-[#172033] block">
                            Feedback Details <span className="text-[#c2410c]">*</span>
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
                        placeholder="Explain the suggestion, workflow observation, or bug in detail..."
                        className="w-full p-3 border border-[#dfe3e8] rounded-none bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e] leading-relaxed"
                    />
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-[#dfe3e8]">
                    <span className="text-[11px] text-[#536174] italic">
                        * All feedback is reviewed to improve system transparency and investigator ergonomics.
                    </span>

                    <button
                        type="submit"
                        disabled={!title.trim() || !description.trim() || isSubmitting}
                        className="px-6 py-2.5 text-xs font-bold text-white bg-[#174a7e] hover:bg-[#123b65] disabled:opacity-50 transition cursor-pointer"
                    >
                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                </div>
            </form>
        </div>
    );
};
