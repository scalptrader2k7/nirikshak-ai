"use client";

import React, { useState } from "react";
import { Clock, Check } from "@/components/shared/Icons";
import type { EnrichedCaseDetail, AuditEventItem } from "./demoCaseDetailAdapter";

interface CaseHistoryTabProps {
    data: EnrichedCaseDetail;
    customNotes: Array<{ text: string; timestamp: string }>;
    onAddNote?: (note: string) => void;
}

export const CaseHistoryTab: React.FC<CaseHistoryTabProps> = ({
    data,
    customNotes,
    onAddNote,
}) => {
    const { audit_history } = data;
    const [newNote, setNewNote] = useState<string>("");
    const [noteSaved, setNoteSaved] = useState<boolean>(false);

    const handleSaveNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim() || !onAddNote) return;
        onAddNote(newNote.trim());
        setNewNote("");
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 3000);
    };

    // Combine standard audit events with newly added officer notes
    const allEvents: AuditEventItem[] = [
        ...audit_history,
        ...customNotes.map((note, index) => ({
            id: `NOTE-${index + 1}`,
            timestamp: note.timestamp,
            actor: "Authorized Audit Officer",
            action: "Officer Investigation Note Recorded",
            details: note.text,
            type: "officer" as const,
        })),
    ].sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

    return (
        <div className="space-y-6 pt-4">
            {/* Section 14: Timeline & Audit History */}
            <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#dfe3e8] pb-3">
                    <div className="flex items-center gap-2 text-[#172033]">
                        <Clock size={17} className="text-[#174a7e]" />
                        <h2 className="text-sm font-bold uppercase tracking-wider">
                            Case File Audit Trail &amp; Verification History
                        </h2>
                    </div>
                    <span className="text-[11px] font-mono text-[#536174]">
                        {allEvents.length} Historical Log Entries
                    </span>
                </div>

                <div className="relative pl-6 border-l-2 border-[#dfe3e8] space-y-6 my-2 text-xs">
                    {allEvents.map((evt) => (
                        <div key={evt.id} className="relative space-y-1">
                            {/* Dot indicator */}
                            <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#174a7e]" />

                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#172033] text-xs">
                                        {evt.action}
                                    </span>
                                    <span className="text-[10px] font-mono text-[#536174] bg-[#f1f3f6] border border-[#dfe3e8] px-2 py-0.5">
                                        {evt.actor}
                                    </span>
                                </div>
                                <span className="font-mono text-[11px] text-[#536174]">
                                    {evt.timestamp}
                                </span>
                            </div>

                            <p className="text-[#536174] leading-relaxed p-2.5 rounded-none bg-[#fafbfc] border border-[#dfe3e8] mt-1">
                                {evt.details}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="p-3 rounded-none bg-[#f1f3f6] border border-[#dfe3e8] text-[11px] text-[#536174]">
                    <strong>Audit Integrity Guarantee:</strong> All actions, status alterations, and evidence requests are immutably logged with system timestamps to maintain accountability under MoSPI administrative audit guidelines.
                </div>
            </div>

            {/* Officer Notes Form (Positioned after the audit trail) */}
            {onAddNote && (
                <div className="rounded-lg border border-[#dfe3e8] bg-white p-5 shadow-xs space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#172033]">
                        Add Officer Audit Note
                    </h3>
                    <form onSubmit={handleSaveNote} className="space-y-3">
                        <textarea
                            rows={3}
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Enter official investigation notes, verification findings, or inquiry remarks..."
                            className="w-full text-xs p-3 border border-[#dfe3e8] rounded-none focus:outline-none focus:ring-1 focus:ring-[#174a7e] bg-white text-[#172033]"
                        />
                        <div className="flex items-center justify-between">
                            {noteSaved ? (
                                <span className="text-xs font-bold text-[#2f7d5a] flex items-center gap-1">
                                    <Check size={14} /> Note recorded in Audit History
                                </span>
                            ) : (
                                <span className="text-[11px] text-[#536174]">
                                    Notes are timestamped and permanently logged in the Case File audit trail.
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={!newNote.trim()}
                                className="px-4 py-2 text-xs font-bold text-white bg-[#174a7e] hover:bg-[#123b65] disabled:opacity-50 rounded-none transition cursor-pointer"
                            >
                                Record Officer Note
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
