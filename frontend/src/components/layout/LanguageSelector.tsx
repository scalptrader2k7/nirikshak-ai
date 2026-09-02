"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Search, Check, ChevronDown, X } from "@/components/shared/Icons";
import { SCHEDULED_LANGUAGES } from "@/i18n/languages";
import { useLanguage } from "@/i18n/LanguageContext";

export const LanguageSelector: React.FC = () => {
    const { language, setLanguage, currentLanguageInfo, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter languages by name or nativeName
    const filteredLanguages = SCHEDULED_LANGUAGES.filter((lang) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
            lang.name.toLowerCase().includes(q) ||
            lang.nativeName.toLowerCase().includes(q) ||
            lang.code.toLowerCase().includes(q)
        );
    });

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Compact Language Selector Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/15 hover:border-white/40 transition cursor-pointer"
                aria-expanded={isOpen}
                aria-haspopup="true"
                title="Select Language / भाषा चुनें"
            >
                <Globe size={14} className="text-[#d8b45c]" />
                <span className="max-w-[85px] truncate text-[11px] font-bold">
                    {currentLanguageInfo.nativeName}
                </span>
                <ChevronDown size={12} className={`text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-[#dfe3e8] bg-white p-2.5 shadow-xl text-[#172033] animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Search Field */}
                    <div className="relative mb-2">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#536174]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t("common.search_language", "Search language...")}
                            className="w-full text-xs pl-8 pr-7 py-1.5 border border-[#dfe3e8] rounded-md bg-[#fafbfc] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#174a7e]"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#536174] hover:text-[#172033]"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Language Header / Count */}
                    <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-[#dfe3e8] text-[10px] font-bold uppercase tracking-wider text-[#536174]">
                        <span>22 Scheduled Languages</span>
                        <span className="font-mono text-[#174a7e]">{filteredLanguages.length}</span>
                    </div>

                    {/* Scrollable Language List */}
                    <div className="max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin">
                        {filteredLanguages.length === 0 ? (
                            <p className="py-4 text-center text-xs text-[#536174]">
                                No languages found
                            </p>
                        ) : (
                            filteredLanguages.map((lang) => {
                                const isSelected = language === lang.code;
                                return (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setIsOpen(false);
                                            setSearchQuery("");
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition text-left cursor-pointer ${
                                            isSelected
                                                ? "bg-[#174a7e] text-white font-bold"
                                                : "text-[#172033] hover:bg-[#f1f3f6]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{lang.name}</span>
                                            <span className={`text-[11px] ${isSelected ? "text-white/80" : "text-[#536174]"}`}>
                                                ({lang.nativeName})
                                            </span>
                                        </div>
                                        {isSelected && <Check size={14} className="text-[#d8b45c]" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
