import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import OrderNowLink from "@/apps/customer/components/OrderNowLink"
import { BRAND_LOGO_FANCY, OWNER_PHOTOS_DIR } from "@/lib/branchBranding"
import { FOOD_IMAGES } from "@/lib/foodImagery"

const VALUE_KEYS = ["fresh", "family", "oven", "care"] as const

const BRANCH_CHEFS = [
  {
    branchKey: "kempen",
    chefs: [
      { chefKey: "alaan", photo: `${OWNER_PHOTOS_DIR}/owner-2-logo-portrait.png` },
      { chefKey: "jiuan", photo: `${OWNER_PHOTOS_DIR}/owner-4-logo-portrait.png` }
    ]
  },
  {
    branchKey: "straelen",
    chefs: [
      { chefKey: "ahmad", photo: `${OWNER_PHOTOS_DIR}/owner-5-logo-portrait.png` },
      { chefKey: "siban", photo: `${OWNER_PHOTOS_DIR}/owner-1-logo-portrait.png` }
    ]
  }
] as const

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.about.eyebrow")} title={t("pages.about.title")}>
      <section className="about-hero">
        <div className="about-hero__logo-wrap">
          <img
            src={BRAND_LOGO_FANCY}
            alt={t("common.logoAlt")}
            className="about-hero__logo"
            width={640}
            height={420}
            loading="eager"
          />
        </div>
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

      <div className="about-chef-branches">
        {BRANCH_CHEFS.map(({ branchKey, chefs }) => (
          <section key={branchKey} className="about-chef-branch">
            <h2 className="about-chef-branch__title">
              {t(`pages.about.branches.${branchKey}.title`)}
            </h2>
            <div className="about-chef-branch__grid">
              {chefs.map(({ chefKey, photo }) => (
                <article key={chefKey} className="about-chef-tile">
                  <img
                    src={photo}
                    alt={t(`pages.about.branches.${branchKey}.chefs.${chefKey}.photoAlt`)}
                    className="about-chef-tile__photo"
                    width={120}
                    height={120}
                    loading="lazy"
                  />
                  <h3 className="about-chef-tile__name">
                    {t(`pages.about.branches.${branchKey}.chefs.${chefKey}.name`)}
                  </h3>
                </article>
              ))}
            </div>
          </section>
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
