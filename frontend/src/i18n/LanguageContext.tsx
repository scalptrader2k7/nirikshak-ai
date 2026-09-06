"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SCHEDULED_LANGUAGES, type LanguageOption, type SupportedLanguageCode } from "./languages";
import { getTranslation, type TranslationKey } from "./translations";

interface LanguageContextType {
    language: SupportedLanguageCode;
    setLanguage: (code: string) => void;
    currentLanguageInfo: LanguageOption;
    t: (key: TranslationKey, fallbackText: string) => string;
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
    const [language, setLanguageState] = useState<SupportedLanguageCode>("en");

    const applyDocumentDirection = (code: SupportedLanguageCode) => {
        if (typeof document === "undefined") return;
        const isRtl = code === "ur";
        document.documentElement.dir = isRtl ? "rtl" : "ltr";
        document.documentElement.setAttribute("lang", code);
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem("nirikshak_lang");
            const savedLanguage = SCHEDULED_LANGUAGES.find((option) => option.code === saved);
            if (savedLanguage) {
                setLanguageState(savedLanguage.code);
                applyDocumentDirection(savedLanguage.code);
            } else {
                applyDocumentDirection("en");
            }
        } catch {
            applyDocumentDirection("en");
        }
    }, []);

    const setLanguage = (code: string) => {
        const selectedLanguage = SCHEDULED_LANGUAGES.find((option) => option.code === code);
        if (!selectedLanguage) return;

        setLanguageState(selectedLanguage.code);
        applyDocumentDirection(selectedLanguage.code);
        try {
            localStorage.setItem("nirikshak_lang", selectedLanguage.code);
        } catch {
            // Ignore
        }
    };

    const currentLanguageInfo =
        SCHEDULED_LANGUAGES.find((l) => l.code === language) || defaultLangInfo;

    const t = (key: TranslationKey, fallbackText: string): string => {
        return getTranslation(language, key, fallbackText);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, currentLanguageInfo, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
