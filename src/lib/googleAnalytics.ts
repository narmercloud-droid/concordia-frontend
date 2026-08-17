export const GA_MEASUREMENT_ID = "G-R933CRPDVP"
export const COOKIE_CONSENT_CHANGED_EVENT = "concordia:cookie-consent-changed"

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function gtag(...args: unknown[]) {
  window.gtag?.(...args)
}

export function applyAnalyticsConsent(granted: boolean) {
  if (typeof window === "undefined" || !window.gtag) return
  gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  })
}

export function notifyCookieConsentChanged() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT))
}

export function shouldSkipAnalyticsPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/courier")
}

export function trackPageView(pathname: string, search = "") {
  if (typeof window === "undefined" || !window.gtag) return
  if (shouldSkipAnalyticsPath(pathname)) return
  const pagePath = `${pathname}${search}`
  gtag("event", "page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title
  })
}
