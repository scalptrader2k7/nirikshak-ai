import React from "react";
import Link from "next/link";
import {
    ArrowRight,
    ShieldAlert,
    AlertTriangle,
    Activity,
    FileText,
    FolderSearch,
} from "@/components/shared/Icons";

export const InvestigationShortcuts: React.FC = () => {
    const shortcuts = [
        {
            title: "High Risk Public Works",
            count: 45,
            badge: "Multi-Signal",
            description: "High review-priority combinations flagged for targeted desk scrutiny.",
            href: "/projects?priority=HIGH",
            badgeBg: "bg-[#fff0e6]",
            badgeText: "text-[#c2410c]",
            borderHover: "hover:border-[#c2410c]/50",
            icon: AlertTriangle,
            iconColor: "text-[#c2410c]",
        },
        {
            title: "Cost Outlier Signals",
            count: 68,
            badge: "Statistical",
            description: "Public works with allocation divergence vs district peer benchmarks.",
            href: "/projects?detector=cost",
            badgeBg: "bg-[#fff4df]",
            badgeText: "text-[#a56a00]",
            borderHover: "hover:border-[#a56a00]/50",
            icon: Activity,
            iconColor: "text-[#a56a00]",
        },
        {
            title: "Exact Duplicate Records",
            count: 34,
            badge: "Direct Match",
            description: "Identical parameter overlap across sequential budget lines.",
            href: "/projects?detector=exact_duplicate",
            badgeBg: "bg-[#fbe9e9]",
            badgeText: "text-[#b91c1c]",
            borderHover: "hover:border-[#b91c1c]/50",
            icon: FileText,
            iconColor: "text-[#b91c1c]",
        },
        {
            title: "Near-Duplicate Records",
            count: 89,
            badge: "Geo & Lexical",
            description: "High textual similarity among co-located public works.",
            href: "/projects?detector=near_duplicate",
            badgeBg: "bg-[#e8f0f8]",
            badgeText: "text-[#102d49]",
            borderHover: "hover:border-[#102d49]/50",
            icon: FolderSearch,
            iconColor: "text-[#102d49]",
        },
    ];

    return (
        <div className="rounded-xl border border-[#d8d4ca] bg-white p-6 shadow-xs space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ece7dc] pb-4">
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#17263a]">
                        Investigation Shortcuts
                    </h2>
                    <p className="text-xs text-[#687487] mt-0.5">
                        Direct navigation pathways from executive intelligence into targeted discovery queues
                    </p>
                </div>

                <Link
                    href="/projects"
                    className="text-xs font-bold text-[#102d49] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
                >
                    <span>Open Full Registry</span>
                    <ArrowRight size={12} />
                </Link>
            </div>

            {/* Shortcuts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {shortcuts.map((sc, idx) => {
                    const Icon = sc.icon;
                    return (
                        <Link
                            key={idx}
                            href={sc.href}
                            className={`group rounded-xl border border-[#e2ddd1] bg-[#fbfaf8] p-4.5 flex flex-col justify-between transition ${sc.borderHover} hover:bg-white hover:shadow-xs`}
                        >
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${sc.badgeBg} ${sc.badgeText}`}
                                    >
                                        {sc.badge}
                                    </span>
                                    <Icon size={16} className={sc.iconColor} />
                                </div>

                                <div>
                                    <div className="text-xl font-black font-mono text-[#17263a]">
                                        {sc.count}
                                    </div>
                                    <h3 className="text-xs font-bold text-[#17263a] mt-0.5">
                                        {sc.title}
                                    </h3>
                                </div>

                                <p className="text-[11px] text-[#687487] leading-relaxed">
                                    {sc.description}
                                </p>
                            </div>

                            <div className="pt-3 mt-3 border-t border-[#ece7dc] flex items-center justify-between text-xs font-bold text-[#102d49]">
                                <span>Explore</span>
                                <ArrowRight
                                    size={12}
                                    className="group-hover:translate-x-1 transition"
                                />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default InvestigationShortcuts;
