import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import ConcordiaLogo from "@/apps/customer/components/ConcordiaLogo"
import { INFO_PAGES, LEGAL_PAGES } from "@/lib/infoPages"
import "./InfoPages.css"

export default function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer className="site-footer">
      <nav className="site-footer__links" aria-label={t("pages.navLabel")}>
        <Link to="/">{t("pages.nav.home")}</Link>
        {INFO_PAGES.map((page) => (
          <Link key={page.path} to={page.path}>
            {t(`pages.nav.${page.key}`)}
          </Link>
        ))}
      </nav>
      <nav className="site-footer__legal" aria-label={t("pages.legalNavLabel")}>
        {LEGAL_PAGES.map((page) => (
          <Link key={page.path} to={page.path}>
            {t(`pages.nav.${page.key}`)}
          </Link>
        ))}
      </nav>
      <ConcordiaLogo size="md" round className="site-footer__logo" />
      <p className="site-footer__tagline">{t("home.tagline")}</p>
      <p className="site-footer__copy">© {new Date().getFullYear()} Concordia Restaurant</p>
    </footer>
  )
}
