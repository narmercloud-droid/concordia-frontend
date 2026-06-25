import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { WEBSITE_ORDER_DISCOUNT_PCT } from "@/lib/websitePromo"
import { isNativeApp } from "@/lib/nativeApp"

export default function NativePromoStrip() {
  const { t } = useTranslation()

  if (!isNativeApp()) return null

  return (
    <div className="native-promo-strip" role="region" aria-label={t("nativeApp.promoAria")}>
      <div className="native-promo-strip__shine" aria-hidden="true" />
      <span className="native-promo-strip__pct">{WEBSITE_ORDER_DISCOUNT_PCT}%</span>
      <p className="native-promo-strip__copy">{t("nativeApp.promoStrip")}</p>
      <Link to={{ pathname: "/", hash: "order" }} className="native-promo-strip__cta">
        {t("home.orderNow")}
      </Link>
    </div>
  )
}
