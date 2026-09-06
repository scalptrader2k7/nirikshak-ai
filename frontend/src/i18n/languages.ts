export interface LanguageOption {
    code: string;
    name: string;
    nativeName: string;
}

export const SUPPORTED_LANGUAGE_CODES = [
    "en",
    "bn",
    "gu",
    "hi",
    "kn",
    "ml",
    "mr",
    "or",
    "pa",
    "sa",
    "ta",
    "te",
    "ur",
] as const;

export const SCHEDULED_LANGUAGES = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
    { code: "ur", name: "Urdu", nativeName: "اردو" },
] as const satisfies readonly LanguageOption[];

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGE_CODES[number];
