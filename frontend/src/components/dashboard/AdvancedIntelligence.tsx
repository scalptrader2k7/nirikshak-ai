import React from "react";
import Link from "next/link";
import {
    Shield,
    Activity,
    Database,
    FolderSearch,
    AlertTriangle,
    Check,
    Info,
    ArrowRight,
} from "@/components/shared/Icons";

interface AdvancedIntelligenceProps {
    totalRecords?: number;
}

export const AdvancedIntelligence: React.FC<AdvancedIntelligenceProps> = ({
    totalRecords = 742,
}) => {
    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                    <span className="h-4 w-1 bg-primary rounded-full" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                        Deep Oversight &amp; Verification Intelligence
                    </h2>
                </div>
                <span className="text-[11px] text-text-muted">
                    Administrative Evidence Architecture
                </span>
            </div>

            {/* 3-Column Intelligence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Project Lifecycle & Milestone Tracking */}
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <span className="p-1 rounded bg-[#e8f0f8] text-[#174a7e]">
                                    <Activity size={14} />
                                </span>
                                <h3 className="text-xs font-bold text-text-primary">
                                    Project Lifecycle Stage
                                </h3>
                            </div>
                            <span className="text-[10px] font-bold text-[#2f7d5a] bg-[#eaf5ef] px-1.5 py-0.5 rounded">
                                Sanction Stage
                            </span>
                        </div>

                        {/* Lifecycle Funnel */}
                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-semibold text-text-primary">1. Recommended Works</span>
                                    <span className="font-mono font-bold text-text-primary">{totalRecords} (100%)</span>
                                </div>
                                <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-[#174a7e] w-full" />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-semibold text-text-primary">2. Sanctioned Allocation</span>
                                    <span className="font-mono font-bold text-text-primary">{totalRecords} (100%)</span>
                                </div>
                                <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-[#2f7d5a] w-full" />
                                </div>
                            </div>

                            {/* Milestone Gaps with Honest Badges */}
                            <div className="p-2.5 rounded-lg border border-dashed border-[#c8ced6] bg-[#f8fafc] text-xs text-text-secondary">
                                <div className="flex items-center justify-between font-medium">
                                    <span>3. Physical Progress &amp; Completion</span>
                                    <span className="text-[10px] font-bold text-[#536071] bg-[#eaeff5] px-1.5 py-0.5 rounded">
                                        Not tracked in dataset
                                    </span>
                                </div>
                                <p className="text-[10px] text-text-muted mt-1">
                                    Completion certificates &amp; geotagged milestone photos pending field upload.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Evidence Verification</span>
                        <Link href="/upload" className="font-semibold text-primary hover:underline">
                            Upload Field CSV →
                        </Link>
                    </div>
                </div>

                {/* 2. Integrity Passport & Payment Gate Snapshot */}
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <span className="p-1 rounded bg-[#fff0e6] text-[#c2410c]">
                                    <Shield size={14} />
                                </span>
                                <h3 className="text-xs font-bold text-text-primary">
                                    Integrity &amp; Payment Gate
                                </h3>
                            </div>
                            <span className="text-[10px] font-bold text-[#c2410c] bg-[#fff0e6] px-1.5 py-0.5 rounded">
                                Hold &amp; Inspect Gate
                            </span>
                        </div>

                        <div className="mt-4 space-y-2.5">
                            {/* Integrity Passport Status */}
                            <div className="p-3 rounded-lg border border-border bg-surface-subtle">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-text-primary">
                                        Integrity Passport
                                    </span>
                                    <span className="text-[10px] font-bold text-[#a56a00] bg-[#fff4df] px-1.5 py-0.5 rounded">
                                        AMBER Review (185)
                                    </span>
                                </div>
                                <p className="text-[11px] text-text-secondary mt-1">
                                    Multivariate signals requiring officer audit before milestone release.
                                </p>
                            </div>

                            {/* Reality Gap Status */}
                            <div className="p-3 rounded-lg border border-border bg-surface-subtle">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-text-primary">
                                        Reality Gap Analysis
                                    </span>
                                    <span className="text-[10px] font-bold text-[#536071] bg-[#eaeff5] px-1.5 py-0.5 rounded">
                                        Baseline Verified
                                    </span>
                                </div>
                                <p className="text-[11px] text-text-secondary mt-1">
                                    Comparison between administrative sanctions vs peer district averages.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Payment Release Policy</span>
                        <span className="font-semibold text-[#174a7e]">Officer Discretion</span>
                    </div>
                </div>

                {/* 3. Data Integrity & Evidence Freshness */}
                <div className="rounded-xl border border-border bg-surface p-5 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <span className="p-1 rounded bg-[#eaf5ef] text-[#2f7d5a]">
                                    <Database size={14} />
                                </span>
                                <h3 className="text-xs font-bold text-text-primary">
                                    Data Quality &amp; Transparency
                                </h3>
                            </div>
                            <span className="text-[10px] font-bold text-[#2f7d5a] bg-[#eaf5ef] px-1.5 py-0.5 rounded">
                                100% Contract Fidelity
                            </span>
                        </div>

                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between p-2 rounded bg-surface-subtle text-xs">
                                <span className="text-text-secondary flex items-center gap-1.5">
                                    <Check size={13} className="text-[#2f7d5a]" />
                                    Sanction Records &amp; Titles
                                </span>
                                <span className="font-bold text-[#2f7d5a]">Verified (742)</span>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded bg-surface-subtle text-xs">
                                <span className="text-text-secondary flex items-center gap-1.5">
                                    <Check size={13} className="text-[#2f7d5a]" />
                                    MP &amp; Geographic Mapping
                                </span>
                                <span className="font-bold text-[#2f7d5a]">Verified (742)</span>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded bg-[#f8fafc] border border-dashed border-[#c8ced6] text-xs">
                                <span className="text-text-muted flex items-center gap-1.5">
                                    <Info size={13} className="text-[#748092]" />
                                    Voucher &amp; Geotagged Media
                                </span>
                                <span className="text-[10px] font-bold text-[#536071]">Not In Current DB</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">Audit Trail Log</span>
                        <Link href="/reports" className="font-semibold text-primary hover:underline">
                            View Audit Dossier →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedIntelligence;
