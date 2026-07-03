import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function CheckoutLegalFooter() {
  const { t } = useTranslation()

  return (
    <footer className="checkout-legal-footer" aria-label={t("pages.legalNavLabel")}>
      <Link to="/impressum">{t("pages.nav.impressum")}</Link>
      <span aria-hidden="true">·</span>
      <Link to="/datenschutz">{t("pages.nav.privacy")}</Link>
      <span aria-hidden="true">·</span>
      <Link to="/agb">{t("pages.nav.agb")}</Link>
      <span aria-hidden="true">·</span>
      <Link to="/widerruf">{t("pages.nav.widerruf")}</Link>
    </footer>
  )
}
