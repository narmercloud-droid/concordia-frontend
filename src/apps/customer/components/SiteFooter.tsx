import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import ConcordiaLogo from "@/apps/customer/components/ConcordiaLogo"
import { INFO_PAGES, LEGAL_PAGES } from "@/lib/infoPages"
import { WEBSITE_ORDER_DISCOUNT_PCT } from "@/lib/websitePromo"
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
      <ConcordiaLogo size="sm" className="site-footer__logo" />
      <p className="site-footer__slogan">{t("home.slogan")}</p>
      <p>{t("home.footerCash")}</p>
      <p className="site-footer__promo">
        {t("home.websiteDiscountFooter", { percent: WEBSITE_ORDER_DISCOUNT_PCT })}
      </p>
      <p>{t("home.footerFreeDrink")}</p>
      <p className="site-footer__copy">© {new Date().getFullYear()} Concordia Restaurant</p>
    </footer>
  )
}
