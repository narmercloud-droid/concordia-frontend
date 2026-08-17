import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { hasMarketingConsent } from "@/apps/customer/components/CookieConsent"
import {
  applyAnalyticsConsent,
  COOKIE_CONSENT_CHANGED_EVENT,
  trackPageView
} from "@/lib/googleAnalytics"

/** Enables GA4 after cookie consent and records SPA page views. */
export function useGoogleAnalytics() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    const syncAndTrack = () => {
      const granted = hasMarketingConsent()
      applyAnalyticsConsent(granted)
      if (granted) trackPageView(pathname, search)
    }
    syncAndTrack()
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncAndTrack)
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, syncAndTrack)
  }, [pathname, search])
}
