import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"

const REVIEW_KEYS = ["r1", "r2", "r3", "r4", "r5"] as const

export default function ReviewsPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.reviews.eyebrow")} title={t("pages.reviews.title")}>
      <div className="info-block">
        <p>{t("pages.reviews.lead")}</p>
      </div>
      {REVIEW_KEYS.map((key) => (
        <article key={key} className="info-review">
          <p className="info-review__stars" aria-hidden="true">
            ★★★★★
          </p>
          <p className="info-review__text">"{t(`pages.reviews.items.${key}.text`)}"</p>
          <p className="info-review__author">— {t(`pages.reviews.items.${key}.author`)}</p>
        </article>
      ))}
    </InfoPageShell>
  )
}
