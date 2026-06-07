import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import { FOOD_IMAGES } from "@/lib/foodImagery"

const VALUE_KEYS = ["fresh", "family", "oven", "care"] as const

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.about.eyebrow")} title={t("pages.about.title")}>
      <section className="about-hero">
        <div className="about-hero__media">
          <img
            src="/images/owner-chefs-duo-cartoon.png"
            alt={t("branchOwner.photoAlt", { branch: "Kempen" })}
            className="about-hero__chefs"
            width={160}
            height={160}
            loading="eager"
          />
          <div
            className="about-hero__kitchen"
            style={{ backgroundImage: `url(${FOOD_IMAGES.hero})` }}
            aria-hidden="true"
          />
        </div>
        <blockquote className="about-hero__quote">
          <p>{t("pages.about.quote")}</p>
          <footer>{t("branchOwner.signature")}</footer>
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
        <article className="about-chef-card">
          <div className="about-chef-card__badge" aria-hidden="true">
            AA
          </div>
          <h3>{t("pages.about.alaanName")}</h3>
          <p>{t("pages.about.alaanBio")}</p>
        </article>
        <article className="about-chef-card">
          <div className="about-chef-card__badge" aria-hidden="true">
            JI
          </div>
          <h3>{t("pages.about.jiuanName")}</h3>
          <p>{t("pages.about.jiuanBio")}</p>
        </article>
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
        style={{ backgroundImage: `url(${FOOD_IMAGES.pizza})` }}
      >
        <div className="about-kitchen-banner__overlay" aria-hidden="true" />
        <div className="about-kitchen-banner__copy">
          <h2>{t("pages.about.kitchenTitle")}</h2>
          <p>{t("pages.about.kitchenText")}</p>
          <p className="about-kitchen-banner__address">{t("pages.about.kempenAddress")}</p>
        </div>
      </section>
    </InfoPageShell>
  )
}
