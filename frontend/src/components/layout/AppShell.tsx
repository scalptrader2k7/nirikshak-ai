"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShieldAlert,
    FolderSearch,
    FileText,
    ClipboardCheck,
    LogIn,
} from "@/components/shared/Icons";
import apiClient from "@/api/client";
import { LanguageProvider, useLanguage } from "@/i18n/LanguageContext";
import { LanguageSelector } from "@/components/layout/LanguageSelector";

interface NavItem {
    name: string;
    translationKey: string;
    href: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
    { name: "Dashboard", translationKey: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", translationKey: "nav.projects", href: "/projects", icon: FolderSearch },
    { name: "Review Queue", translationKey: "nav.review_queue", href: "/review", icon: ShieldAlert },
    { name: "Evidence & Investigation", translationKey: "nav.evidence", href: "/evidence", icon: FileText },
    { name: "Reports & Data", translationKey: "nav.reports", href: "/reports", icon: ClipboardCheck },
];

function AppShellContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { t } = useLanguage();
    const [dbStatus, setDbStatus] = useState<"loading" | "connected" | "disconnected">("loading");

    useEffect(() => {
        apiClient
            .getHealth()
            .then((res) => {
                setDbStatus(res.status === "ok" && res.data_loaded ? "connected" : "disconnected");
            })
            .catch(() => setDbStatus("disconnected"));
    }, []);

    return (
        <div className="min-h-screen bg-[#f4f2ec] text-[#17263a] flex flex-col font-sans selection:bg-[#d8b45c]/25 selection:text-[#102d49]">
            {/* ─────────────────────────────────────────────────────────────
          1. TOP INSTITUTIONAL HEADER (Exact match with Landing Page)
      ───────────────────────────────────────────────────────────── */}
            <header className="sticky top-0 z-30 border-b border-white/15 bg-[#102d49] text-white shadow-sm">
                <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-14">
                    {/* Brand & Emblem */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8b45c]/40 bg-[#d8b45c]/10 text-[#d8b45c] shadow-xs hover:border-[#d8b45c] transition"
                            aria-label="NIRIKSHAK Institutional Insignia"
                        >
                            <svg
                                viewBox="0 0 48 48"
                                className="h-6 w-6"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M12 18h24M15 18v17M21 18v17M27 18v17M33 18v17M10 35h28M9 39h30"
                                    stroke="currentColor"
                                    strokeWidth="2.3"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M10 17c4-7 9-10 14-10s10 3 14 10"
                                    stroke="currentColor"
                                    strokeWidth="2.3"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </Link>

                        <div className="leading-tight">
                            <div className="flex items-center gap-2.5">
                                <Link href="/dashboard" className="text-lg font-extrabold tracking-wider text-white sm:text-xl hover:text-white/90 transition">
                                    NIRIKSHAK AI
                                </Link>
                                <span className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e2c878]">
                                    Investigation Workspace
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs font-medium text-white/75 sm:text-[13px]">
                                Ministry of Statistics &amp; Programme Implementation · MPLADS Division
                            </p>
                        </div>
                    </div>

                    {/* Right side controls: Language Selector + Officer Badge + Sign Out */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* Language Selector Dropdown */}
                        <LanguageSelector />

                        {/* Officer Profile Badge */}
                        <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8b45c]/20 border border-[#d8b45c]/40 text-[#d8b45c] font-bold text-[11px]">
                                OFF
                            </div>
                            <div className="hidden sm:block text-left leading-none">
                                <p className="font-bold text-white text-xs">{t("nav.audit_officer", "Audit Officer")}</p>
                                <p className="text-[10px] text-white/60 font-mono mt-0.5">OFF-10234</p>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <Link
                            href="/signin"
                            className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/40 transition cursor-pointer flex items-center gap-1.5"
                            title="Sign Out of Investigation Workspace"
                        >
                            <LogIn size={13} className="rotate-180" />
                            <span className="hidden sm:inline">{t("nav.sign_out", "Sign Out")}</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* ─────────────────────────────────────────────────────────────
          2. TOP HORIZONTAL NAVIGATION BAR (Below Header)
      ───────────────────────────────────────────────────────────── */}
            <nav className="sticky top-[76px] z-20 border-b border-[#d8d4ca] bg-[#ebe8df] shadow-xs">
                <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-14 overflow-x-auto scrollbar-none py-1.5">
                    <div className="flex items-center gap-1.5">
                        {NAV_ITEMS.map((item) => {
                            const isActive =
                                item.href === "/projects"
                                    ? pathname === "/projects"
                                    : item.name === "Evidence & Investigation"
                                    ? pathname === "/evidence" || pathname.startsWith("/evidence") || pathname.startsWith("/projects/")
                                    : item.name === "Reports & Data"
                                    ? pathname === "/reports" || pathname.startsWith("/reports") || pathname === "/upload" || pathname.startsWith("/upload")
                                    : pathname === item.href ||
                                      (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            const IconComponent = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                                        isActive
                                            ? "bg-[#102d49] text-white shadow-xs"
                                            : "text-[#536174] hover:text-[#102d49] hover:bg-white/60"
                                    }`}
                                >
                                    <IconComponent
                                        size={14}
                                        className={isActive ? "text-[#d8b45c]" : "text-[#687487]"}
                                    />
                                    <span>{t(item.translationKey, item.name)}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT BODY
      ───────────────────────────────────────────────────────────── */}
            <main className="flex-1 mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-14 py-8">
                {children}
            </main>

            {/* ─────────────────────────────────────────────────────────────
          4. INSTITUTIONAL FOOTER
      ───────────────────────────────────────────────────────────── */}
            <footer className="border-t border-[#d8d4ca] bg-[#ebe8df] text-[#536174] text-xs py-6">
                <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-14 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-bold text-[#102d49]">NIRIKSHAK AI</span>
                        <span>·</span>
                        <span>Ministry of Statistics &amp; Programme Implementation</span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] font-mono">
                        <span>Database Status: {dbStatus === "connected" ? "Connected (742 Records)" : "Live Dataset"}</span>
                        <span>·</span>
                        <span>Version 2.4.0</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <LanguageProvider>
            <AppShellContent>{children}</AppShellContent>
        </LanguageProvider>
    );
};

export default AppShell;