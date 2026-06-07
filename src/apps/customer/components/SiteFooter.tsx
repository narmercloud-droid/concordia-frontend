import React from "react"
import { useTranslation } from "react-i18next"
import ConcordiaLogo from "@/apps/customer/components/ConcordiaLogo"
import SiteNav from "@/apps/customer/components/SiteNav"
import { WEBSITE_ORDER_DISCOUNT_PCT } from "@/lib/websitePromo"
import "./InfoPages.css"

export default function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer className="site-footer">
      <SiteNav className="site-footer__nav" />
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
