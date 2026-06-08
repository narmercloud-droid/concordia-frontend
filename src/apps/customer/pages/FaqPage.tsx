import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import LegalCrossLinks from "@/apps/customer/components/LegalCrossLinks"

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"] as const

export default function FaqPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.faq.eyebrow")} title={t("pages.faq.title")}>
      <div className="info-block">
        <p>{t("pages.faq.lead")}</p>
      </div>
      <div className="info-faq">
        {FAQ_KEYS.map((key) => (
          <details key={key}>
            <summary>{t(`pages.faq.items.${key}.q`)}</summary>
            <p>{t(`pages.faq.items.${key}.a`)}</p>
          </details>
        ))}
      </div>
      <div className="info-block">
        <h2 className="info-block__title">{t("pages.faq.legalTitle")}</h2>
        <p>{t("pages.faq.legalLead")}</p>
        <LegalCrossLinks />
      </div>
    </InfoPageShell>
  )
}
