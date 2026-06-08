import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import { FOOD_IMAGES } from "@/lib/foodImagery"
import { WEBSITE_ORDER_DISCOUNT_PCT } from "@/lib/websitePromo"

const STEP_KEYS = ["step1", "step2", "step3"] as const

export default function OffersPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.offers.eyebrow")} title={t("pages.offers.title")}>
      <p className="offers-lead">{t("pages.offers.lead")}</p>

      <div className="offers-showcase">
        <article className="offers-card offers-card--discount">
          <div
            className="offers-card__bg"
            style={{ backgroundImage: `url(${FOOD_IMAGES.pizzaMargherita})` }}
            aria-hidden="true"
          />
          <div className="offers-card__overlay" aria-hidden="true" />
          <div className="offers-card__body">
            <span className="offers-card__badge">{t("home.websiteDiscountBadge")}</span>
            <p className="offers-card__percent" aria-hidden="true">
              {WEBSITE_ORDER_DISCOUNT_PCT}%
            </p>
            <h2 className="offers-card__title">{t("pages.offers.discountTitle")}</h2>
            <p>{t("pages.offers.discountText")}</p>
          </div>
        </article>

        <article className="offers-card offers-card--drink">
          <div className="offers-card__visual offers-card__visual--drink" aria-hidden="true">
            <span className="offers-card__drink-icon">🥤</span>
            <span className="offers-card__drink-tag">€35+</span>
          </div>
          <div className="offers-card__body offers-card__body--plain">
            <span className="offers-card__badge offers-card__badge--gold">
              {t("common.free")}
            </span>
            <h2 className="offers-card__title">{t("pages.offers.drinkTitle")}</h2>
            <p>{t("pages.offers.drinkText")}</p>
          </div>
        </article>
        <article className="offers-card offers-card--gift">
          <div className="offers-card__body offers-card__body--plain">
            <span className="offers-card__badge offers-card__badge--gold">{t("pages.offers.giftBadge")}</span>
            <h2 className="offers-card__title">{t("pages.offers.giftTitle")}</h2>
            <p>{t("pages.offers.giftText")}</p>
            <Link to="/gutschein" className="info-cta" style={{ marginTop: 12, display: "inline-block" }}>
              {t("pages.offers.giftCta")}
            </Link>
          </div>
        </article>
      </div>

      <div className="info-block">
        <h2 className="info-block__title">{t("pages.offers.howTitle")}</h2>
        <div className="offers-steps">
          {STEP_KEYS.map((key, index) => (
            <div key={key} className="offers-step">
              <span className="offers-step__num" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3>{t(`pages.offers.${key}Title`)}</h3>
                <p>{t(`pages.offers.${key}Text`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section
        className="offers-cta-banner"
        style={{ backgroundImage: `url(${FOOD_IMAGES.dining})` }}
      >
        <div className="offers-cta-banner__overlay" aria-hidden="true" />
        <div className="offers-cta-banner__copy">
          <p className="offers-cta-banner__note">{t("pages.offers.promoNote")}</p>
          <Link to="/#order" className="info-cta">
            {t("home.orderNow")}
          </Link>
        </div>
      </section>
    </InfoPageShell>
  )
}
