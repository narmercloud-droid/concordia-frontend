import type { TFunction } from "i18next"

export function translateOrderStatus(status: string, t: TFunction): string {
  const key = `status.${status}`
  const translated = t(key)
  return translated === key ? status.replace(/_/g, " ") : translated
}

export function translateFulfillmentType(type: string, t: TFunction): string {
  const key = `status.${type}`
  const translated = t(key)
  return translated === key ? type : translated
}
