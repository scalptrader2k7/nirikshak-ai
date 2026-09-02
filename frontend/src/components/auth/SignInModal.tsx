"use client";

import React, { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
    Shield,
    User,
    Lock,
    Key,
    Eye,
    EyeOff,
    ArrowRight,
    Check,
    Info,
    X,
} from "@/components/shared/Icons";

export type UserRole = "officer" | "citizen" | "admin";

interface RoleDetails {
    label: string;
    shortLabel: string;
    description: string;
    idLabel: string;
    placeholder: string;
    format: string;
    buttonText: string;
    defaultId: string;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

const ROLE_CONFIG: Record<UserRole, RoleDetails> = {
    officer: {
        label: "Audit Officer",
        shortLabel: "Officer",
        description: "Investigate flagged public works, review empirical evidence, and log verification decisions.",
        idLabel: "Official Officer ID",
        placeholder: "OFF-10234",
        format: "Format: OFF-XXXXX (e.g. OFF-10234)",
        buttonText: "Sign in as Audit Officer",
        defaultId: "OFF-10234",
        icon: Shield,
    },
    citizen: {
        label: "Citizen",
        shortLabel: "Citizen",
        description: "View public project transparency summaries, verified records, and community audit data.",
        idLabel: "Citizen ID / Email",
        placeholder: "demo.citizen@example.in",
        format: "Use registered citizen email or ID",
        buttonText: "Continue as Citizen",
        defaultId: "demo.citizen@example.in",
        icon: User,
    },
    admin: {
        label: "Administrator",
        shortLabel: "Admin",
        description: "Manage oversight operations, investigator assignments, and system integrity controls.",
        idLabel: "Administrator ID",
        placeholder: "ADM-00001",
        format: "Format: ADM-XXXXX (e.g. ADM-00001)",
        buttonText: "Sign in as Administrator",
        defaultId: "ADM-00001",
        icon: Lock,
    },
};

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialRole?: UserRole;
}

export const SignInModal: React.FC<SignInModalProps> = ({
    isOpen,
    onClose,
    initialRole = "officer",
}) => {
    const router = useRouter();
    const modalRef = useRef<HTMLDivElement>(null);
    const identifierInputRef = useRef<HTMLInputElement>(null);

    const [role, setRole] = useState<UserRole>(initialRole);
    const [identifier, setIdentifier] = useState(ROLE_CONFIG[initialRole].defaultId);
    const [password, setPassword] = useState("Demo@123");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [notice, setNotice] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync role when initialRole changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setRole(initialRole);
            setIdentifier(ROLE_CONFIG[initialRole].defaultId);
            setPassword("Demo@123");
            setNotice(null);
            setIsError(false);
            setIsSubmitting(false);

            const timer = setTimeout(() => {
                identifierInputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialRole]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isSubmitting) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) return null;

    const currentRole = ROLE_CONFIG[role];
    const RoleIcon = currentRole.icon;

    const handleRoleSelect = (selectedRole: UserRole) => {
        setRole(selectedRole);
        setIdentifier(ROLE_CONFIG[selectedRole].defaultId);
        setPassword("Demo@123");
        setNotice(null);
        setIsError(false);
    };

    const handleFastFill = (demoRole: UserRole) => {
        handleRoleSelect(demoRole);
        setNotice(`${ROLE_CONFIG[demoRole].label} credentials loaded. Click '${ROLE_CONFIG[demoRole].buttonText}' to enter.`);
        setIsError(false);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!identifier.trim() || !password.trim()) {
            setNotice("Please enter your credentials before continuing.");
            setIsError(true);
            return;
        }

        setIsSubmitting(true);
        setIsError(false);
        setNotice("Demonstration access verified. Entering NIRIKSHAK AI Workspace...");

        setTimeout(() => {
            router.push("/dashboard");
        }, 450);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="signin-modal-title"
        >
            {/* Dark translucent backdrop preserving Landing Page visibility */}
            <div
                className="fixed inset-0 bg-[#071524]/75 backdrop-blur-[2px] transition-opacity duration-300"
                onClick={() => {
                    if (!isSubmitting) onClose();
                }}
                aria-hidden="true"
            />

            {/* Modal Dialog Card (Comfortable width max-w-[550px]) */}
            <div
                ref={modalRef}
                className="relative w-full max-w-[550px] rounded-2xl border border-white/15 bg-white text-[#172033] shadow-[0_25px_70px_rgba(7,21,36,0.35)] ring-1 ring-black/5 overflow-hidden transition-all duration-300 transform scale-100 my-auto"
            >
                {/* ─────────────────────────────────────────────────────────────
            MODAL HEADER: Exact Institutional Dark Navy Header (Preserved)
        ───────────────────────────────────────────────────────────── */}
                <div className="relative border-b border-white/10 bg-[#102d49] px-5 py-4 sm:px-6 text-white">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            {/* Insignia mark */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#d8b45c]/40 bg-[#d8b45c]/10 text-[#d8b45c]">
                                <Shield size={20} />
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 id="signin-modal-title" className="text-base font-bold tracking-wide text-white">
                                        NIRIKSHAK AI
                                    </h2>
                                    <span className="rounded border border-[#d8b45c]/30 bg-[#d8b45c]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#e2c878]">
                                        Secure Access
                                    </span>
                                </div>
                                <p className="text-[11px] text-white/70">
                                    Ministry of Statistics &amp; Programme Implementation · MPLADS
                                </p>
                            </div>
                        </div>

                        {/* Close button (X) */}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition focus-visible:outline-2 focus-visible:outline-white disabled:opacity-50 cursor-pointer"
                            aria-label="Close sign-in modal"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
            MODAL BODY: Role Selection & Form (Enlarged Font Sizes)
        ───────────────────────────────────────────────────────────── */}
                <div className="p-5 sm:p-6 bg-[#fafbfc]">
                    {/* Header instruction */}
                    <div className="text-center mb-5">
                        <h3 className="text-xl font-bold tracking-tight text-[#172033]">
                            Sign in to Investigation Workspace
                        </h3>
                        <p className="text-sm text-[#617083] mt-1">
                            Select your operational role to access monitored works.
                        </p>
                    </div>

                    {/* Role Selector Tabs */}
                    <div className="rounded-xl border border-[#dfe4e9] bg-[#edf2f7] p-1 grid grid-cols-3 gap-1 shadow-xs">
                        {(["officer", "citizen", "admin"] as UserRole[]).map((r) => {
                            const config = ROLE_CONFIG[r];
                            const isSelected = role === r;
                            const Icon = config.icon;
                            return (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => handleRoleSelect(r)}
                                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${isSelected
                                            ? "bg-white text-[#102d49] shadow-sm ring-1 ring-[#dce3e9]"
                                            : "text-[#687789] hover:text-[#172033] hover:bg-white/50"
                                        }`}
                                >
                                    <Icon size={16} className={isSelected ? "text-[#174a7e]" : "text-[#8a96a4]"} />
                                    <span>{config.shortLabel}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Role description badge */}
                    <div className="mt-3 rounded-lg bg-white px-3.5 py-2.5 border border-[#e2e8ef] flex items-start gap-2.5 text-left">
                        <span className="mt-0.5 text-[#174a7e]">
                            <RoleIcon size={15} />
                        </span>
                        <div className="text-xs leading-relaxed text-[#536071]">
                            <span className="font-bold text-[#172033] mr-1">{currentRole.label}:</span>
                            {currentRole.description}
                        </div>
                    </div>

                    {/* Sign-In Form */}
                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        {/* Identifier Field */}
                        <div>
                            <label
                                htmlFor="modal-identifier"
                                className="block text-sm font-bold text-[#2d3b4b] mb-1.5"
                            >
                                {currentRole.idLabel}
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#8290a0]">
                                    {role === "citizen" ? <User size={18} /> : <Shield size={18} />}
                                </div>
                                <input
                                    ref={identifierInputRef}
                                    id="modal-identifier"
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => {
                                        setIdentifier(e.target.value);
                                        setNotice(null);
                                    }}
                                    placeholder={currentRole.placeholder}
                                    autoComplete="username"
                                    required
                                    className="h-12 w-full rounded-lg border border-[#d6dce2] bg-white pl-11 pr-4 text-sm font-medium text-[#172033] placeholder:text-[#a2acb7] transition hover:border-[#b9c4cf] focus:border-[#174a7e] focus:ring-4 focus:ring-[#174a7e]/10 outline-none"
                                />
                            </div>
                            <p className="mt-1 text-[11px] text-[#8a96a4]">
                                {currentRole.format}
                            </p>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="modal-password"
                                    className="block text-sm font-bold text-[#2d3b4b]"
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPassword("Demo@123");
                                        setNotice("Demo password (Demo@123) loaded.");
                                        setIsError(false);
                                    }}
                                    className="text-xs font-semibold text-[#174a7e] hover:underline cursor-pointer"
                                >
                                    Demo password: Demo@123
                                </button>
                            </div>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#8290a0]">
                                    <Key size={18} />
                                </div>
                                <input
                                    id="modal-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setNotice(null);
                                    }}
                                    autoComplete="current-password"
                                    required
                                    className="h-12 w-full rounded-lg border border-[#d6dce2] bg-white pl-11 pr-12 text-sm font-medium tracking-wider text-[#172033] placeholder:text-[#a2acb7] transition hover:border-[#b9c4cf] focus:border-[#174a7e] focus:ring-4 focus:ring-[#174a7e]/10 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#8290a0] hover:text-[#174a7e] transition cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me option */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="h-4 w-4 rounded border-[#c8ced6] text-[#174a7e] accent-[#174a7e]"
                                />
                                <span className="text-xs text-[#536071] font-medium">
                                    Remember session on this workstation
                                </span>
                            </label>
                        </div>

                        {/* Submit Button (Enlarged Height & Font) */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#102d49] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#173d61] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#102d49] active:translate-y-px disabled:opacity-75 mt-3 cursor-pointer"
                        >
                            <span>{isSubmitting ? "Verifying..." : currentRole.buttonText}</span>
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </button>

                        {/* Notice & Validation Feedback */}
                        {notice && (
                            <div
                                className={`rounded-lg p-3 text-xs font-medium leading-relaxed border ${isError
                                        ? "bg-red-50 text-red-800 border-red-200"
                                        : "bg-[#edf4fa] text-[#174a7e] border-[#c9ddf0]"
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <Info size={15} className="mt-0.5 shrink-0" />
                                    <span>{notice}</span>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* ─────────────────────────────────────────────────────────────
              FAST-FILL DEMO PROFILES (Enlarged Text)
          ───────────────────────────────────────────────────────────── */}
                    <div className="mt-5 border-t border-[#e2e8ef] pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#35465a]">
                                Fast-Fill Demo Profiles
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8fa4b9] bg-[#edf2f7] px-2 py-0.5 rounded">
                                SIH 102
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {(["officer", "citizen", "admin"] as UserRole[]).map((r) => {
                                const cfg = ROLE_CONFIG[r];
                                const isCur = role === r;
                                return (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => handleFastFill(r)}
                                        className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${isCur
                                                ? "border-[#174a7e] bg-[#f0f6fa] ring-1 ring-[#174a7e]/20"
                                                : "border-[#e2e8ef] bg-white hover:border-[#cbd7e2]"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-[#35465a] uppercase">
                                                {cfg.shortLabel}
                                            </span>
                                            {isCur && <Check size={12} className="text-[#174a7e]" />}
                                        </div>
                                        <div className="text-xs font-mono font-bold text-[#174a7e] truncate mt-0.5">
                                            {cfg.defaultId}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
            MODAL FOOTER: Trust & Disclosures
        ───────────────────────────────────────────────────────────── */}
                <div className="border-t border-[#e2e8ef] bg-[#f1f4f8] px-5 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#748092]">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 font-medium">
                            <Shield size={12} className="text-[#174a7e]" />
                            Authorised Access
                        </span>
                        <span className="hidden sm:inline-block text-[#d0d7de]">|</span>
                        <span>Audit Actions Logged</span>
                    </div>

                    <span className="text-center sm:text-right text-[10px] text-[#8a96a4]">
                        Demonstration Mode · SIH 102
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SignInModal;
