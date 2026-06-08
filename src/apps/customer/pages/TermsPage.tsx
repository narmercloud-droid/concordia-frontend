import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"

const WEBSITE_SECTIONS = [
  "operator",
  "ordering",
  "prices",
  "delivery",
  "cancellation",
  "promotions",
  "liability",
  "privacy",
  "law"
] as const

const LOYALTY_SECTIONS = [
  "overview",
  "membership",
  "points",
  "tiers",
  "birthday",
  "promotions",
  "misuse",
  "changes"
] as const

export default function TermsPage() {
  const { t } = useTranslation()
  const base = "pages.terms"

  return (
    <InfoPageShell eyebrow={t(`${base}.eyebrow`)} title={t(`${base}.title`)}>
      <div className="info-block">
        <p className="info-legal__updated">{t(`${base}.updated`)}</p>
        <p>{t(`${base}.lead`)}</p>
      </div>

      {WEBSITE_SECTIONS.map((key) => (
        <div key={key} className="info-block info-legal__section">
          <h2 className="info-block__title">{t(`${base}.sections.${key}.title`)}</h2>
          <p>{t(`${base}.sections.${key}.body`)}</p>
        </div>
      ))}

      <div className="info-legal__part-divider">
        <h2 className="info-legal__part-title">{t(`${base}.loyaltyPartTitle`)}</h2>
        <p>{t(`${base}.loyaltyPartLead`)}</p>
      </div>

      {LOYALTY_SECTIONS.map((key) => (
        <div key={`loyalty-${key}`} className="info-block info-legal__section">
          <h2 className="info-block__title">{t(`${base}.loyaltySections.${key}.title`)}</h2>
          <p>{t(`${base}.loyaltySections.${key}.body`)}</p>
        </div>
      ))}

      <div className="info-block info-legal__contact">
        <p>{t(`${base}.contact`)}</p>
      </div>
    </InfoPageShell>
  )
}
