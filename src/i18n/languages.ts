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
