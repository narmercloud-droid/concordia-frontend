export type AppLanguage =
  | "de"
  | "en"
  | "nl"
  | "pl"
  | "ru"
  | "ro"
  | "hi"
  | "ar"
  | "ku"
  | "tr"
  | "ckb"

export const LANGUAGES: Array<{
  code: AppLanguage
  label: string
  native: string
  flag: string
}> = [
  { code: "de", label: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "nl", label: "Dutch", native: "Nederlands", flag: "🇳🇱" },
  { code: "pl", label: "Polish", native: "Polski", flag: "🇵🇱" },
  { code: "ru", label: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "ro", label: "Romanian", native: "Română", flag: "🇷🇴" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", label: "Arabic", native: "العربية", flag: "🇸🇦" },
  { code: "tr", label: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { code: "ku", label: "Kurdish (Kurmanji)", native: "Kurdî (Latînî)", flag: "🇮🇶" },
  { code: "ckb", label: "Kurdish (Sorani)", native: "کوردی (سۆرانی)", flag: "🇮🇶" }
]

export function getLanguage(code: string) {
  const short = code.split("-")[0] as AppLanguage
  return LANGUAGES.find((lang) => lang.code === short) ?? LANGUAGES[0]
}

export const DEFAULT_LANGUAGE: AppLanguage = "de"

export const SUPPORTED_LANGUAGE_CODES = LANGUAGES.map((lang) => lang.code)

/** Saved only when the customer picks a language in the header switcher. */
export const LANGUAGE_STORAGE_KEY = "concordia-lang-v2"

function languageFromCode(code: string | undefined): AppLanguage | null {
  const short = (code ?? "").split("-")[0].toLowerCase()
  return SUPPORTED_LANGUAGE_CODES.includes(short as AppLanguage) ? (short as AppLanguage) : null
}

/** Manual override from localStorage, else first matching phone/browser locale, else German. */
export function detectPreferredLanguage(): AppLanguage {
  if (typeof window !== "undefined") {
    try {
      const manual = localStorage.getItem(LANGUAGE_STORAGE_KEY)
      const fromManual = languageFromCode(manual ?? undefined)
      if (fromManual) return fromManual
    } catch {
      // private browsing / blocked storage
    }

    if (typeof navigator !== "undefined") {
      const candidates = [...(navigator.languages ?? []), navigator.language].filter(Boolean)
      for (const raw of candidates) {
        const match = languageFromCode(raw)
        if (match) return match
      }
    }
  }

  return DEFAULT_LANGUAGE
}

export function persistLanguageChoice(code: AppLanguage) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
  } catch {
    // ignore
  }
}

/** Map browser/device locale to a supported app language, else German. */
export function resolveAppLanguage(code: string | undefined): AppLanguage {
  const short = (code ?? "").split("-")[0].toLowerCase()
  return SUPPORTED_LANGUAGE_CODES.includes(short as AppLanguage)
    ? (short as AppLanguage)
    : DEFAULT_LANGUAGE
}

export function localeForLanguage(lang: string): string {
  const map: Record<AppLanguage, string> = {
    de: "de-DE",
    en: "en-GB",
    nl: "nl-NL",
    pl: "pl-PL",
    ru: "ru-RU",
    ro: "ro-RO",
    hi: "hi-IN",
    ar: "ar-SA",
    ku: "ku-IQ",
    tr: "tr-TR",
    ckb: "ckb-IQ"
  }
  return map[lang as AppLanguage] ?? "de-DE"
}

export function isRtlLanguage(lang: string): boolean {
  const short = lang.split("-")[0]
  return short === "ar" || short === "ckb"
}
