import React from "react";
import Link from "next/link";

const HERO_IMAGE = "/parliament-hero.jpg";

export const metadata = {
    title: "NIRIKSHAK AI — Public Expenditure Intelligence",
    description: "Intelligent Oversight for Public Development Works · MoSPI MPLADS",
};

export default function LandingPageAlt() {
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-text-primary antialiased">
            {/* ───────────────────────────────────────────────────────────────
          1. INSTITUTIONAL HEADER BAR
          Dark navy bar (--gateway-navy)
      ─────────────────────────────────────────────────────────────── */}
            <header className="border-b border-white/10 bg-gateway-navy text-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Left: Generic Institutional SVG mark + Brand + Subtext */}
                    <div className="flex items-center gap-3">
                        {/* 
                            CRITICAL LEGAL NOTICE:
                            The icon below is a generic institutional shield/pillar SVG mark.
                            It is explicitly NOT the official State Emblem of India, in strict compliance
                            with the State Emblem of India (Prohibition of Improper Use) Act, 2005.
                        */}
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded border border-gateway-accent/40 bg-white/5 text-gateway-accent"
                            aria-label="Institutional governance insignia"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M12 8v8M8 12h8" />
                            </svg>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold tracking-wider text-white">
                                    NIRIKSHAK AI
                                </span>
                            </div>
                            <p className="text-[10px] tracking-wide text-white/70">
                                Public Expenditure Intelligence
                            </p>
                        </div>
                    </div>

                    {/* Right: MoSPI • MPLADS Label */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold uppercase tracking-widest text-gateway-accent-light">
                            MoSPI • MPLADS
                        </span>
                        <Link
                            href="/signin"
                            className="hidden rounded bg-gateway-accent px-3 py-1.5 text-xs font-semibold text-gateway-navy transition hover:bg-gateway-accent-light sm:inline-block"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            {/* ───────────────────────────────────────────────────────────────
          2. FULL-BLEED TRANSLUCENT HERO EXPERIENCE
          Centered white headline, subhead, and two CTA buttons
      ─────────────────────────────────────────────────────────────── */}
            <section
                className="relative flex flex-1 items-center justify-center overflow-hidden bg-gateway-navy py-24 sm:py-32"
                aria-label="Hero Introduction"
            >
                {/* Background Photograph Asset */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${HERO_IMAGE}")` }}
                    role="img"
                    aria-label="Parliament and public infrastructure background"
                />

                {/* Translucent Navy Overlay (~70% opacity + subtle gradient) */}
                <div className="absolute inset-0 bg-gateway-navy/70 backdrop-blur-[1px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-gateway-navy via-gateway-navy/40 to-gateway-navy/60" />

                {/* Centered Editorial Content */}
                <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Intelligent Oversight for
                        <br />
                        <span className="text-gateway-accent-light">
                            Public Development Works
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg sm:leading-8">
                        Detect anomalies. Verify evidence. Strengthen accountability.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        {/* Primary CTA */}
                        <Link
                            href="/signin"
                            className="w-full rounded-md bg-gateway-accent px-6 py-3.5 text-sm font-semibold text-gateway-navy shadow-sm transition hover:bg-gateway-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gateway-accent sm:w-auto"
                        >
                            Sign in to NIRIKSHAK
                        </Link>

                        {/* Secondary CTA */}
                        <a
                            href="#capabilities"
                            className="w-full rounded-md border border-white/40 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xs transition hover:border-white hover:bg-white/10 sm:w-auto"
                        >
                            Explore public dashboard
                        </a>
                    </div>
                </div>
            </section>

            {/* ───────────────────────────────────────────────────────────────
          3. THREE-COLUMN CAPABILITY STRIP
          White surface background, standard design tokens
      ─────────────────────────────────────────────────────────────── */}
            <section
                id="capabilities"
                className="border-b border-border bg-surface py-16 sm:py-20"
                aria-label="Core Capabilities"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
                        {/* Column 1: AI-ASSISTED Detection */}
                        <div className="flex flex-col border-b border-border pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-8">
                            <span className="text-xs font-bold uppercase tracking-widest text-gateway-accent">
                                AI-ASSISTED
                            </span>
                            <h2 className="mt-2 text-xl font-bold text-text-primary">
                                Detection
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                                Identify unusual cost variations, duplicate project allocations, and statistical pattern signals across monitored public works.
                            </p>
                        </div>

                        {/* Column 2: EVIDENCE-LED Verification */}
                        <div className="flex flex-col border-b border-border pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-8">
                            <span className="text-xs font-bold uppercase tracking-widest text-gateway-accent">
                                EVIDENCE-LED
                            </span>
                            <h2 className="mt-2 text-xl font-bold text-text-primary">
                                Verification
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                                Surface empirical records, baseline peer medians, and Integrity Passports to explain and corroborate every flagged record.
                            </p>
                        </div>

                        {/* Column 3: HUMAN-IN-THE-LOOP Investigation */}
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-widest text-gateway-accent">
                                HUMAN-IN-THE-LOOP
                            </span>
                            <h2 className="mt-2 text-xl font-bold text-text-primary">
                                Investigation
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                                Enable authorised audit officers to conduct structured reviews, assign physical inspections, and maintain complete decision authority.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───────────────────────────────────────────────────────────────
          4. INSTITUTIONAL FOOTER
          Dark navy-deep bar (--gateway-navy-deep)
      ─────────────────────────────────────────────────────────────── */}
            <footer className="bg-gateway-navy-deep py-6 text-white/70">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center text-xs sm:flex-row sm:px-6 sm:text-left lg:px-8">
                    <p>
                        NIRIKSHAK AI · Public Works Expenditure Audit &amp; Risk Intelligence
                    </p>
                    <p>
                        Ministry of Statistics &amp; Programme Implementation · MPLADS
                    </p>
                </div>
            </footer>
        </div>
    );
}
