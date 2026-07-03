import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

const STORAGE_KEY = "concordia_cookie_consent_v1"
export const COOKIE_SETTINGS_EVENT = "concordia:open-cookie-settings"

type Consent = "all" | "essential"

function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === "all" || v === "essential" ? v : null
  } catch {
    return null
  }
}

function writeConsent(value: Consent) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
}

export function hasMarketingConsent() {
  return readConsent() === "all"
}

export function requestCookieSettings() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT))
}

export default function CookieConsent() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(readConsent() === null)
  }, [])

  useEffect(() => {
    const open = () => setVisible(true)
    window.addEventListener(COOKIE_SETTINGS_EVENT, open)
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, open)
  }, [])

  if (!visible) return null

  const accept = (value: Consent) => {
    writeConsent(value)
    setVisible(false)
  }

  return (
    <div className="cookie-consent" role="dialog" aria-labelledby="cookie-consent-title">
      <div className="cookie-consent__inner">
        <h2 id="cookie-consent-title" className="cookie-consent__title">
          {t("legal.cookie.title")}
        </h2>
        <p className="cookie-consent__text">{t("legal.cookie.body")}</p>
        <p className="cookie-consent__links">
          <Link to="/datenschutz">{t("pages.nav.privacy")}</Link>
          {" · "}
          <Link to="/impressum">{t("pages.nav.impressum")}</Link>
        </p>
        <div className="cookie-consent__actions">
          <button
            type="button"
            className="customer-btn"
            onClick={() => accept("essential")}
          >
            {t("legal.cookie.essentialOnly")}
          </button>
          <button
            type="button"
            className="customer-btn customer-btn--primary"
            onClick={() => accept("all")}
          >
            {t("legal.cookie.acceptAll")}
          </button>
        </div>
      </div>
    </div>
  )
}
