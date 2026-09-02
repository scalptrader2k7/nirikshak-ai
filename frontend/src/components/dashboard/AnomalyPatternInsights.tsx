import React from "react";
import Link from "next/link";
import {
    Activity,
    FolderSearch,
    FileText,
    ShieldAlert,
    ArrowRight,
} from "@/components/shared/Icons";
import type { DetectorName } from "@/api/types";

interface AnomalyPatternInsightsProps {
    costCount?: number;
    exactCount?: number;
    nearCount?: number;
    patternCount?: number;
}

interface DetectorCardConfig {
    id: DetectorName;
    title: string;
    count: number;
    sharePct: string;
    explanation: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    tag: string;
    tagBg: string;
    tagText: string;
    tagBorder: string;
    hoverBorder: string;
}

export const AnomalyPatternInsights: React.FC<AnomalyPatternInsightsProps> = ({
    costCount = 68,
    exactCount = 34,
    nearCount = 89,
    patternCount = 42,
}) => {
    const totalSignals = costCount + exactCount + nearCount + patternCount; // 233 signals across 185 cases

    const cards: DetectorCardConfig[] = [
        {
            id: "cost",
            title: "Cost Outlier Detector",
            count: costCount,
            sharePct: "9.2% of corpus",
            explanation:
                "Allocation amount shows unusual statistical deviation from district peer group reference parameters.",
            icon: Activity,
            tag: "Statistical Anomaly",
            tagBg: "bg-[#fff0e6]",
            tagText: "text-[#c2410c]",
            tagBorder: "border-[#fed7aa]",
            hoverBorder: "hover:border-[#c2410c]/50",
        },
        {
            id: "near_duplicate",
            title: "Near Duplicate Engine",
            count: nearCount,
            sharePct: "12.0% of corpus",
            explanation:
                "High lexical similarity with proximate co-located public works in adjacent administrative wards.",
            icon: FolderSearch,
            tag: "Lexical & Geo Overlap",
            tagBg: "bg-[#fff4df]",
            tagText: "text-[#a56a00]",
            tagBorder: "border-[#fde68a]",
            hoverBorder: "hover:border-[#a56a00]/50",
        },
        {
            id: "exact_duplicate",
            title: "Exact Duplicate Detector",
            count: exactCount,
            sharePct: "4.6% of corpus",
            explanation:
                "Identical work title, gram panchayat, and budget line matching previously sanctioned records.",
            icon: FileText,
            tag: "Parameter Match",
            tagBg: "bg-[#fbe9e9]",
            tagText: "text-[#b91c1c]",
            tagBorder: "border-[#f5c2c2]",
            hoverBorder: "hover:border-[#b91c1c]/50",
        },
        {
            id: "pattern",
            title: "Pattern Anomaly Engine",
            count: patternCount,
            sharePct: "5.7% of corpus",
            explanation:
                "Clustered sanction frequencies and repetitive execution agency allocations within narrow time windows.",
            icon: ShieldAlert,
            tag: "Structured Pattern",
            tagBg: "bg-[#e8f0f8]",
            tagText: "text-[#102d49]",
            tagBorder: "border-[#c8ced6]",
            hoverBorder: "hover:border-[#102d49]/50",
        },
    ];

    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ece7dc] pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#17263a]">
                            Anomaly Pattern Insights
                        </span>
                        <span className="text-[10px] font-bold text-[#536174] bg-[#f4f2ec] px-2 py-0.5 rounded">
                            {totalSignals} Signals Across 185 Cases
                        </span>
                    </div>
                    <p className="text-xs text-[#687487] mt-0.5">
                        Multi-detector statistical signals flagging unusual public works patterns for objective desk scrutiny
                    </p>
                </div>

                <Link
                    href="/projects"
                    className="text-xs font-bold text-[#102d49] hover:underline inline-flex items-center gap-1 self-start sm:self-auto shrink-0"
                >
                    <span>View All in Projects</span>
                    <ArrowRight size={12} />
                </Link>
            </div>

            {/* 4-Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.id}
                            className={`rounded-xl border border-[#e2ddd1] bg-[#fbfaf8] p-4.5 flex flex-col justify-between transition ${card.hoverBorder} hover:bg-white hover:shadow-xs`}
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${card.tagBg} ${card.tagText} ${card.tagBorder}`}
                                    >
                                        {card.tag}
                                    </span>
                                    <Icon size={16} className={card.tagText} />
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-[#17263a]">
                                        {card.title}
                                    </h3>
                                    <div className="mt-1 flex items-baseline gap-1.5">
                                        <span className="text-xl font-black font-mono text-[#17263a]">
                                            {card.count}
                                        </span>
                                        <span className="text-[10px] text-[#687487]">
                                            records ({card.sharePct})
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[11px] text-[#536174] leading-relaxed">
                                    {card.explanation}
                                </p>
                            </div>

                            <div className="pt-3 mt-3 border-t border-[#ece7dc]">
                                <Link
                                    href={`/projects?detector=${card.id}`}
                                    className="text-xs font-bold text-[#102d49] hover:underline inline-flex items-center gap-1.5 group"
                                >
                                    <span>Explore in Projects</span>
                                    <ArrowRight
                                        size={12}
                                        className="group-hover:translate-x-0.5 transition"
                                    />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnomalyPatternInsights;
