import i18n from "@/i18n"
import { localeForLanguage } from "@/i18n/languages"

export const formatCurrency = (value: number, lang?: string) => {
  const amount = Number.isFinite(value) ? value : 0
  const locale = localeForLanguage(lang ?? i18n.language)
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR"
    }).format(amount)
  } catch {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR"
    }).format(amount)
  }
}

export function formatDateTime(value: string | Date, lang?: string) {
  const date = typeof value === "string" ? new Date(value) : value
  return date.toLocaleString(localeForLanguage(lang ?? i18n.language))
}

export function formatTime(value: string | Date, lang?: string) {
  const date = typeof value === "string" ? new Date(value) : value
  return date.toLocaleTimeString(localeForLanguage(lang ?? i18n.language), {
    hour: "2-digit",
    minute: "2-digit"
  })
}
