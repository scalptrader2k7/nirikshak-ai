"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Shield,
    Activity,
    Database,
    ClipboardCheck,
    ArrowRight,
    Check,
    Info,
} from "@/components/shared/Icons";
import { SignInModal } from "@/components/auth/SignInModal";

const HERO_IMAGE = "/parliament-hero.jpg";

const capabilities = [
    {
        number: "01",
        label: "AI-ASSISTED DETECTION",
        title: "Multi-Detector Anomaly Engine",
        text: "Identifies statistical signals including cost outliers against peer groups, exact project duplicates, near-duplicate textual descriptions, and irregular allocation patterns across monitored works.",
        tags: ["Cost Benchmarks", "Duplicate Detection", "Pattern Signals"],
    },
    {
        number: "02",
        label: "EVIDENCE-LED VERIFICATION",
        title: "Empirical Evidence Ledger",
        text: "Brings raw project records, district & state peer medians, Integrity Passports, and baseline comparisons together so every flagged case is transparently explained with verifiable signals.",
        tags: ["Peer Medians", "Integrity Passport", "Signal Ledger"],
    },
    {
        number: "03",
        label: "HUMAN-IN-THE-LOOP INVESTIGATION",
        title: "Official Decision Support",
        text: "Empowers authorised audit officers to conduct structured inquiries, assign physical field inspections, request contractor vouchers, and maintain immutable audit histories.",
        tags: ["Payment Gate", "Audit Trail", "Officer Controlled"],
    },
];

export default function LandingPage() {
    const [isSignInOpen, setIsSignInOpen] = useState(false);

    // Deep-link support: auto-open modal if URL has ?signin=true or #signin
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("signin") === "true" || window.location.hash === "#signin") {
                setIsSignInOpen(true);
            }
        }
    }, []);

    const openSignIn = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        setIsSignInOpen(true);
    };

    return (
        <main className="min-h-screen bg-[#f4f2ec] text-[#17263a] selection:bg-[#d8b45c]/25 selection:text-[#102d49]">
            {/* ─────────────────────────────────────────────
          TOP INSTITUTIONAL HEADER
          Clean compact height (76px) + preserved bold typography + Sign In button
      ───────────────────────────────────────────── */}
            <header className="sticky top-0 z-30 border-b border-white/15 bg-[#102d49] text-white shadow-sm">
                <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-14">
                    <div className="flex items-center gap-4">
                        {/* 
                            LEGAL COMPLIANCE NOTE:
                            The SVG icon below is a generic institutional governance mark.
                            It is explicitly NOT the official State Emblem of India.
                        */}
                        <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8b45c]/40 bg-[#d8b45c]/10 text-[#d8b45c] shadow-xs"
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
                        </div>

                        <div className="leading-tight">
                            <div className="flex items-center gap-2.5">
                                <span className="text-lg font-extrabold tracking-wider text-white sm:text-xl">
                                    NIRIKSHAK AI
                                </span>
                                <span className="rounded border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e2c878]">
                                    Oversight Inspectorate
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs font-medium text-white/75 sm:text-[13px]">
                                Ministry of Statistics &amp; Programme Implementation · MPLADS Division
                            </p>
                        </div>
                    </div>

                    {/* Right: MoSPI label + Sign In CTA */}
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-widest text-[#e2c878]">
                            MoSPI • MPLADS
                        </span>
                        <button
                            type="button"
                            onClick={openSignIn}
                            className="rounded-md bg-[#d8b45c] px-4 py-2 text-xs font-bold text-[#102d49] transition hover:bg-[#e6ca7c] shadow-sm cursor-pointer"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </header>

            {/* ─────────────────────────────────────────────
          HERO SECTION (Restored to earlier grand scale)
      ───────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-[#102d49]" aria-labelledby="hero-heading">
                <div className="mx-auto grid min-h-[660px] max-w-[1440px] lg:grid-cols-[1.08fr_0.92fr]">
                    {/* LEFT — Institutional Editorial Panel */}
                    <div className="relative z-10 flex items-center px-7 py-16 sm:px-12 lg:px-16 xl:px-20">
                        <div className="max-w-[650px]">
                            <div className="mb-6 flex items-center gap-3">
                                <span className="h-px w-10 bg-[#d8b45c]" aria-hidden="true" />
                                <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#e2c878]">
                                    MPLADS • Public Expenditure Oversight
                                </span>
                            </div>

                            {/* Headline slightly refined for ideal visual balance */}
                            <h1 id="hero-heading" className="max-w-[680px] font-serif text-3xl font-medium leading-[1.10] tracking-[-0.025em] text-white sm:text-4xl lg:text-[54px]">
                                Intelligent Oversight for
                                <br />
                                <span className="text-[#d9bd67]">Public Development Works.</span>
                            </h1>

                            <p className="mt-5 text-xs sm:text-[13px] font-semibold uppercase tracking-[0.16em] text-[#e2c878]/90">
                                Detect anomalies. Verify evidence. Strengthen accountability.
                            </p>

                            <p className="mt-4 max-w-[550px] text-sm leading-relaxed text-white/75 sm:text-[15px]">
                                NIRIKSHAK AI assists authorised public officials and audit officers to surface unusual patterns in MPLADS works, examine empirical supporting evidence, and prioritise cases that warrant human verification.
                            </p>

                            {/* CTAs styled with exact landing-alt buttons */}
                            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                                <button
                                    type="button"
                                    onClick={openSignIn}
                                    className="w-full sm:w-auto rounded-md bg-[#d8b45c] px-6 py-3.5 text-sm font-semibold text-[#102d49] shadow-sm transition hover:bg-[#e6ca7c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d8b45c] cursor-pointer"
                                >
                                    Sign in to NIRIKSHAK
                                </button>

                                <a
                                    href="#about"
                                    className="w-full sm:w-auto rounded-md border border-white/40 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xs transition hover:border-white hover:bg-white/10 text-center"
                                >
                                    Learn More
                                </a>
                            </div>

                            {/* Trust Signals Strip */}
                            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/15 pt-6 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
                                <span className="flex items-center gap-2">
                                    <Check size={13} className="text-[#d8b45c]" />
                                    Evidence-Led
                                </span>
                                <span className="flex items-center gap-2">
                                    <Check size={13} className="text-[#d8b45c]" />
                                    Human-in-the-Loop
                                </span>
                                <span className="flex items-center gap-2">
                                    <Check size={13} className="text-[#d8b45c]" />
                                    Audit-Focused
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — Institutional Imagery Panel (Public Works Intelligence card completely removed) */}
                    <div className="relative min-h-[420px] lg:min-h-full">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
                            role="img"
                            aria-label="Parliament of India House and public development infrastructure"
                        />

                        {/* Professional Navy Tonal Overlay */}
                        <div className="absolute inset-0 bg-[#102d49]/25" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#102d49] via-[#102d49]/40 to-transparent lg:from-[#102d49]/80 lg:via-[#102d49]/20" />
                    </div>
                </div>
            </section>

            {/* ─────────────────────────────────────────────
          INTRODUCTION SECTION (#about)
      ───────────────────────────────────────────── */}
            <section
                id="about"
                className="mx-auto grid max-w-[1440px] gap-12 px-7 py-20 sm:px-12 lg:grid-cols-[0.85fr_1.15fr] lg:px-16 lg:py-28"
                aria-labelledby="about-heading"
            >
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9b7b32]">
                        About NIRIKSHAK AI
                    </p>

                    <h2 id="about-heading" className="mt-4 max-w-[480px] font-serif text-3xl leading-tight tracking-[-0.025em] text-[#17263a] sm:text-4xl lg:text-5xl">
                        Making public expenditure easier to examine.
                    </h2>
                </div>

                <div className="max-w-[720px]">
                    <p className="text-lg leading-relaxed text-[#536174]">
                        NIRIKSHAK is designed as an intelligence and investigation layer for MPLADS monitoring. It does not replace official decision-making. Instead, it assists officials in surfacing risk signals, organising empirical evidence, and focusing limited inspection resources where scrutiny is most warranted.
                    </p>

                    <div className="mt-10 grid gap-6 border-t border-[#d8d4ca] pt-8 sm:grid-cols-2">
                        <div className="rounded-lg border border-[#e2ddd1] bg-white p-5 shadow-xs">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#102d49]/5 text-[#102d49]">
                                <Shield size={18} />
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-[#17263a]">
                                Detection, not accusation
                            </h3>
                            <p className="mt-1.5 text-xs leading-relaxed text-[#687487]">
                                An anomaly score is an objective indicator for human examination—never an automatic finding of wrongdoing or fraud.
                            </p>
                        </div>

                        <div className="rounded-lg border border-[#e2ddd1] bg-white p-5 shadow-xs">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#102d49]/5 text-[#102d49]">
                                <Database size={18} />
                            </div>
                            <h3 className="mt-3 text-sm font-bold text-[#17263a]">
                                Evidence before action
                            </h3>
                            <p className="mt-1.5 text-xs leading-relaxed text-[#687487]">
                                Investigators review baseline peer benchmarks, duplicate clusters, and records before determining audit actions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────────────────────────────────────────
          CORE CAPABILITIES SECTION (#capabilities)
      ───────────────────────────────────────────── */}
            <section
                id="capabilities"
                className="border-y border-[#d8d4ca] bg-[#ebe8df]"
                aria-labelledby="capabilities-heading"
            >
                <div className="mx-auto max-w-[1440px] px-7 py-20 sm:px-12 lg:px-16 lg:py-24">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9b7b32]">
                                Core Architecture
                            </p>

                            <h2 id="capabilities-heading" className="mt-3 font-serif text-3xl tracking-[-0.025em] text-[#17263a] sm:text-4xl lg:text-5xl">
                                From signal to investigation.
                            </h2>
                        </div>

                        <p className="max-w-[440px] text-sm leading-relaxed text-[#687487]">
                            A structured, three-stage workflow engineered to support official audits—not substitute human judgment.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-8 md:grid-cols-3">
                        {capabilities.map((item) => (
                            <article
                                key={item.number}
                                className="flex flex-col justify-between rounded-xl border border-[#d5d0c3] bg-white p-7 shadow-xs transition hover:border-[#102d49]/30 hover:shadow-md"
                            >
                                <div>
                                    <div className="flex items-center justify-between border-b border-[#ece7dc] pb-4">
                                        <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#9b7b32]">
                                            STAGE {item.number}
                                        </span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#687487]">
                                            {item.label}
                                        </span>
                                    </div>

                                    <h3 className="mt-5 text-xl font-bold text-[#17263a]">
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 text-xs leading-relaxed text-[#687487]">
                                        {item.text}
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-1.5 border-t border-[#ece7dc] pt-4">
                                    {item.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded border border-[#e2ddd1] bg-[#f7f5ef] px-2 py-0.5 text-[10px] font-medium text-[#536174]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────────────────────────────────────────
          RESPONSIBLE AI & TRANSPARENCY SECTION (#transparency)
      ───────────────────────────────────────────── */}
            <section
                id="transparency"
                className="bg-[#102d49] text-white"
                aria-labelledby="transparency-heading"
            >
                <div className="mx-auto max-w-[1440px] px-7 py-20 sm:px-12 lg:px-16 lg:py-24">
                    <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded border border-[#d8b45c]/40 bg-[#d8b45c]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e2c878]">
                                <Shield size={14} />
                                Responsible Intelligence Protocol
                            </div>

                            <h2 id="transparency-heading" className="mt-5 max-w-[700px] font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
                                Every signal leads to better questions—not automated conclusions.
                            </h2>

                            <p className="mt-6 max-w-[620px] text-base leading-relaxed text-white/75">
                                NIRIKSHAK AI adheres to strict public governance standards. The platform operates on four non-negotiable principles:
                            </p>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d8b45c] text-[#102d49] font-bold text-xs">
                                        ✓
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Non-Accusatory Terminology</p>
                                        <p className="text-xs text-white/70">Cases are marked as &ldquo;Flagged for review&rdquo; or &ldquo;Investigation priority&rdquo;, never premature declarations of fraud.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d8b45c] text-[#102d49] font-bold text-xs">
                                        ✓
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Disclosed Data Limitations</p>
                                        <p className="text-xs text-white/70">Unrecorded expenditure or progress fields are transparently flagged as unavailable rather than fabricated.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d8b45c] text-[#102d49] font-bold text-xs">
                                        ✓
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Full Officer Audit Logging</p>
                                        <p className="text-xs text-white/70">All inquiries, document requests, and review closures are permanently logged with officer credentials.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sign In Callout Card */}
                        <div className="rounded-xl border border-white/20 bg-[#0d263e] p-8 shadow-2xl">
                            <h3 className="text-xl font-bold text-white">
                                Authorised Institutional Access
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-white/70">
                                Audit officers, vigilance administrators, and citizens may enter the NIRIKSHAK platform using registered credentials or demonstration profiles.
                            </p>

                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={openSignIn}
                                    className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#d8b45c] px-6 text-sm font-bold text-[#102d49] transition hover:bg-[#e6ca7c] shadow-md cursor-pointer"
                                >
                                    <span>Enter NIRIKSHAK Workspace</span>
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                </button>
                                <p className="text-center text-[10px] text-white/50">
                                    Seeded demonstration accounts available on the Sign-In portal.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────────────────────────────────────────
          INSTITUTIONAL FOOTER
      ───────────────────────────────────────────── */}
            <footer className="border-t border-[#091b2c] bg-[#071524] text-white/60">
                <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-7 py-10 sm:px-12 md:flex-row md:items-center md:justify-between lg:px-16">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">NIRIKSHAK AI</span>
                            <span className="text-[10px] text-white/40">|</span>
                            <span className="text-xs text-white/80">Public Expenditure Risk Intelligence</span>
                        </div>
                        <p className="text-[11px] text-white/50">
                            Ministry of Statistics &amp; Programme Implementation · MPLADS Division
                        </p>
                    </div>

                    <div className="text-xs text-white/50 md:text-right">
                        <p>Decision-support intelligence system for authorized institutional oversight.</p>
                        <p className="mt-1 text-[10px] text-white/40">Smart India Hackathon (SIH 102) · Team VOYAGERS</p>
                    </div>
                </div>
            </footer>

            {/* ─────────────────────────────────────────────
          SIGN-IN MODAL OVERLAY (Screen 2)
      ───────────────────────────────────────────── */}
            <SignInModal
                isOpen={isSignInOpen}
                onClose={() => setIsSignInOpen(false)}
                initialRole="officer"
            />
        </main>
    );
}