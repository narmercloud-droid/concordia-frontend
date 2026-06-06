export type AppLanguage = "de" | "en" | "nl" | "pl" | "ru" | "ro" | "hi"

export const LANGUAGES: Array<{ code: AppLanguage; label: string; native: string }> = [
  { code: "de", label: "German", native: "Deutsch" },
  { code: "en", label: "English", native: "English" },
  { code: "nl", label: "Dutch", native: "Nederlands" },
  { code: "pl", label: "Polish", native: "Polski" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "ro", label: "Romanian", native: "Română" },
  { code: "hi", label: "Hindi", native: "हिन्दी" }
]

export const DEFAULT_LANGUAGE: AppLanguage = "de"

export function localeForLanguage(lang: string): string {
  const map: Record<AppLanguage, string> = {
    de: "de-DE",
    en: "en-GB",
    nl: "nl-NL",
    pl: "pl-PL",
    ru: "ru-RU",
    ro: "ro-RO",
    hi: "hi-IN"
  }
  return map[lang as AppLanguage] ?? "de-DE"
}
