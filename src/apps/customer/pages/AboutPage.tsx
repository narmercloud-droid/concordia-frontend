import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import OrderNowLink from "@/apps/customer/components/OrderNowLink"
import { FOOD_IMAGES } from "@/lib/foodImagery"

const VALUE_KEYS = ["fresh", "family", "oven", "care"] as const

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.about.eyebrow")} title={t("pages.about.title")}>
      <div className="info-block about-story">
        <p>{t("pages.about.p1")}</p>
        <p>{t("pages.about.p2")}</p>
        <p>{t("pages.about.p3")}</p>
      </div>

      <div className="info-block">
        <h2 className="info-block__title">{t("pages.about.originTitle")}</h2>
        <p>{t("pages.about.originText")}</p>
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
