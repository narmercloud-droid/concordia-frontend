import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import OrderNowLink from "@/apps/customer/components/OrderNowLink"
import { BRAND_LOGO_FANCY, OWNER_PHOTOS_DIR } from "@/lib/branchBranding"
import { FOOD_IMAGES } from "@/lib/foodImagery"

const VALUE_KEYS = ["fresh", "family", "oven", "care"] as const

const CHEF_KEYS = ["kempen", "straelenAA", "straelenSiban"] as const

const CHEF_PHOTOS: Record<(typeof CHEF_KEYS)[number], string> = {
  kempen: `${OWNER_PHOTOS_DIR}/owner-3-ceo.png`,
  straalenAA: `${OWNER_PHOTOS_DIR}/owner-2-logo-portrait.png`,
  straalenSiban: `${OWNER_PHOTOS_DIR}/owner-4-logo-portrait.png`
}

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.about.eyebrow")} title={t("pages.about.title")}>
      <section className="about-hero">
        <img
          src={BRAND_LOGO_FANCY}
          alt={t("common.logoAlt")}
          className="about-hero__logo"
          width={640}
          height={420}
          loading="eager"
        />
        <blockquote className="about-hero__quote">
          <p>{t("pages.about.quote")}</p>
          <footer>{t("pages.about.familySignature")}</footer>
        </blockquote>
      </section>

      <div className="info-block about-story">
        <p>{t("pages.about.p1")}</p>
        <p>{t("pages.about.p2")}</p>
        <p>{t("pages.about.p3")}</p>
      </div>

      <div className="info-block">
        <h2 className="info-block__title">{t("pages.about.originTitle")}</h2>
        <p>{t("pages.about.originText")}</p>
      </div>

      <h2 className="about-section-title">{t("pages.about.chefsTitle")}</h2>
      <div className="about-chefs">
        {CHEF_KEYS.map((key) => (
          <article key={key} className="about-chef-card">
            <img
              src={CHEF_PHOTOS[key]}
              alt={t(`pages.about.chefs.${key}.photoAlt`)}
              className="about-chef-card__photo"
              width={120}
              height={120}
              loading="lazy"
            />
            <div className="about-chef-card__body">
              <h3>{t(`pages.about.chefs.${key}.name`)}</h3>
              <p className="about-chef-card__role">{t(`pages.about.chefs.${key}.role`)}</p>
              <p>{t(`pages.about.chefs.${key}.bio`)}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="info-block">
        <h2 className="info-block__title">{t("pages.about.valuesTitle")}</h2>
        <div className="about-values">
          {VALUE_KEYS.map((key) => (
            <div key={key} className={`about-value about-value--${key}`}>
              <span className="about-value__icon" aria-hidden="true" />
              <h3>{t(`pages.about.values.${key}.title`)}</h3>
              <p>{t(`pages.about.values.${key}.text`)}</p>
            </div>
          ))}
        </div>
      </div>

      <section
        className="about-kitchen-banner"
        style={{ backgroundImage: `url(${FOOD_IMAGES.pizzaMargherita})` }}
      >
        <div className="about-kitchen-banner__overlay" aria-hidden="true" />
        <div className="about-kitchen-banner__copy">
          <h2>{t("pages.about.kitchenTitle")}</h2>
          <p>{t("pages.about.kitchenText")}</p>
          <p className="about-kitchen-banner__cta-lead">{t("pages.about.kitchenCta")}</p>
          <OrderNowLink className="about-kitchen-banner__cta">{t("home.orderNow")}</OrderNowLink>
        </div>
      </section>
    </InfoPageShell>
  )
}
