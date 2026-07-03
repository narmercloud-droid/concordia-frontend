import api from "./client.js"

export type MarketingPreferences = {
  marketingConsent?: boolean
  marketingEmail?: boolean
  marketingSMS?: boolean
  marketingWhatsApp?: boolean
}

export function updateMarketingPreferences(prefs: MarketingPreferences) {
  return api.put("/customer/marketing-preferences", prefs)
}

export function exportMyData() {
  return api.get("/customer/me/export")
}

export function deleteMyAccount() {
  return api.delete("/customer/me")
}
