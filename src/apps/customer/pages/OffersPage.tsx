import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import { WEBSITE_ORDER_DISCOUNT_PCT } from "@/lib/websitePromo"

export default function OffersPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.offers.eyebrow")} title={t("pages.offers.title")}>
      <div className="info-highlight">
        <span className="info-highlight__badge">{t("home.websiteDiscountBadge")}</span>
        <h2 className="info-highlight__title">
          {WEBSITE_ORDER_DISCOUNT_PCT}% {t("pages.offers.discountTitle")}
        </h2>
        <p>{t("pages.offers.discountText")}</p>
      </div>

      <div className="info-highlight">
        <span className="info-highlight__badge">{t("common.free")}</span>
        <h2 className="info-highlight__title">{t("pages.offers.drinkTitle")}</h2>
        <p>{t("pages.offers.drinkText")}</p>
      </div>

      <div className="info-block">
        <h2 className="info-block__title">{t("pages.offers.howTitle")}</h2>
        <ul>
          <li>{t("pages.offers.how1")}</li>
          <li>{t("pages.offers.how2")}</li>
          <li>{t("pages.offers.how3")}</li>
        </ul>
        <Link to="/#order" className="info-cta">
          {t("home.orderNow")}
        </Link>
      </div>
    </InfoPageShell>
  )
}
