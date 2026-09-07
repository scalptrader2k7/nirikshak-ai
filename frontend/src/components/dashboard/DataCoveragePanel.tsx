import React from "react";
import { Info, Check, X, ShieldAlert } from "@/components/shared/Icons";

interface DataDomainItem {
    domain: string;
    status: "available" | "unavailable" | "partial";
    details: string;
    scope: string;
}

const DOMAINS: DataDomainItem[] = [
    {
        domain: "Sanction / Allocation Amount",
        status: "available",
        details: "100% of monitored public works covered (₹384.6 Cr financial baseline)",
        scope: "Verified Administrative Data",
    },
    {
        domain: "MP Representative & House",
        status: "available",
        details: "100% Lok Sabha & Rajya Sabha representative mapping",
        scope: "Constituency Demarcation",
    },
    {
        domain: "State, District & Panchayat",
        status: "available",
        details: "Complete 4-tier geographic demarcation across 28 States & UTs",
        scope: "Administrative Hierarchy",
    },
    {
        domain: "Work Category & Description",
        status: "available",
        details: "7 public infrastructure sectors with full project descriptions",
        scope: "Sector Classification",
    },
    {
        domain: "Multi-Detector Anomaly Signals",
        status: "available",
        details: "Cost Outlier, Near Duplicate, Exact Duplicate & Pattern Detectors",
        scope: "Statistical Oversight",
    },
    {
        domain: "Actual Expenditure Amount",
        status: "unavailable",
        details: "Not recorded in current administrative baseline dataset files",
        scope: "Data Limitation",
    },
    {
        domain: "Physical Progress %",
        status: "unavailable",
        details: "Physical execution milestone percentages unrecorded in source files",
        scope: "Data Limitation",
    },
    {
        domain: "Delay & Execution Milestones",
        status: "unavailable",
        details: "Completion target timestamps not provided in current dataset",
        scope: "Data Limitation",
    },
];

export const DataCoveragePanel: React.FC = () => {
    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ece7dc] pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102d49]/5 text-[#102d49]">
                        <Info size={17} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                            Data Coverage &amp; Institutional Limitations
                        </h2>
                        <p className="text-xs text-[#687487]">
                            Explicit inventory of verified dataset attributes versus unrecorded parameters
                        </p>
                    </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-[#102d49] bg-[#e8f0f8] px-2.5 py-1 rounded border border-[#c8ced6] self-start sm:self-auto">
                    Data Integrity Protocol
                </span>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-[#d8d4ca] bg-[#fbfaf8] text-[#536174] font-semibold text-[11px] uppercase tracking-wider">
                            <th className="py-2.5 px-3">Data Domain</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Coverage &amp; Assessment</th>
                            <th className="py-2.5 px-3 text-right">Scope</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ece7dc]">
                        {DOMAINS.map((item, idx) => {
                            const isAvail = item.status === "available";
                            return (
                                <tr
                                    key={idx}
                                    className="hover:bg-[#fbfaf8] transition-colors"
                                >
                                    <td className="py-2.5 px-3 font-semibold text-[#17263a]">
                                        {item.domain}
                                    </td>
                                    <td className="py-2.5 px-3">
                                        {isAvail ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#eaf5ef] text-[#2f7d5a] border border-[#bbf7d0]">
                                                <Check size={11} strokeWidth={2.5} />
                                                Available
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#f1f3f6] text-[#687487] border border-[#d8d4ca]">
                                                <X size={11} strokeWidth={2.5} />
                                                Not Available
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-3 text-[#536174]">
                                        {item.details}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-[11px] text-[#8e897e] font-medium">
                                        {item.scope}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Explanatory Callout */}
            <div className="rounded-lg border border-[#e2ddd1] bg-[#fbfaf8] p-3.5 flex items-start gap-2.5 text-xs text-[#536174]">
                <ShieldAlert size={16} className="text-[#102d49] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    <strong className="text-[#17263a]">Data Honesty Commitment:</strong> Unavailable fields (actual expenditure, physical execution milestones, project delay) are intentionally surfaced rather than inferred or simulated, ensuring audit decisions are grounded strictly in confirmed administrative records.
                </p>
            </div>
        </div>
    );
};

export default DataCoveragePanel;
