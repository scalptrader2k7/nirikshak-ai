"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SCHEDULED_LANGUAGES, type LanguageOption } from "./languages";
import { TRANSLATIONS, getTranslation } from "./translations";

interface LanguageContextType {
    language: string;
    setLanguage: (code: string) => void;
    currentLanguageInfo: LanguageOption;
    t: (key: string, fallbackText: string) => string;
}

const defaultLangInfo: LanguageOption = SCHEDULED_LANGUAGES[0] || {
    code: "en",
    name: "English",
    nativeName: "English",
};

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    setLanguage: () => {},
    currentLanguageInfo: defaultLangInfo,
    t: (_key, fallbackText) => fallbackText,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<string>("en");

    const applyDocumentDirection = (code: string) => {
        if (typeof document === "undefined") return;
        const isRtl = code === "ur" || code === "ks" || code === "sd";
        document.documentElement.dir = isRtl ? "rtl" : "ltr";
        document.documentElement.setAttribute("lang", code);
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem("nirikshak_lang");
            if (saved && SCHEDULED_LANGUAGES.some((l) => l.code === saved)) {
                setLanguageState(saved);
                applyDocumentDirection(saved);
            } else {
                applyDocumentDirection("en");
            }
        } catch {
            applyDocumentDirection("en");
        }
    }, []);

    const setLanguage = (code: string) => {
        setLanguageState(code);
        applyDocumentDirection(code);
        try {
            localStorage.setItem("nirikshak_lang", code);
        } catch {
            // Ignore
        }
    };

    const currentLanguageInfo =
        SCHEDULED_LANGUAGES.find((l) => l.code === language) || defaultLangInfo;

    const t = (key: string, fallbackText: string): string => {
        return getTranslation(language, key, fallbackText);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, currentLanguageInfo, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
