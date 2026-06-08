import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"

type LegalPageKey = "terms" | "loyaltyTerms"

const SECTION_KEYS: Record<LegalPageKey, string[]> = {
  terms: ["operator", "ordering", "prices", "delivery", "cancellation", "promotions", "liability", "privacy", "law"],
  loyaltyTerms: ["overview", "membership", "points", "tiers", "birthday", "promotions", "misuse", "changes"]
}

type Props = {
  pageKey: LegalPageKey
}

export default function LegalSectionsPage({ pageKey }: Props) {
  const { t } = useTranslation()
  const base = `pages.${pageKey}`

  return (
    <InfoPageShell eyebrow={t(`${base}.eyebrow`)} title={t(`${base}.title`)}>
      <div className="info-block">
        <p className="info-legal__updated">{t(`${base}.updated`)}</p>
        <p>{t(`${base}.lead`)}</p>
      </div>
      {SECTION_KEYS[pageKey].map((key) => (
        <div key={key} className="info-block info-legal__section">
          <h2 className="info-block__title">{t(`${base}.sections.${key}.title`)}</h2>
          <p>{t(`${base}.sections.${key}.body`)}</p>
        </div>
      ))}
      <div className="info-block info-legal__contact">
        <p>{t(`${base}.contact`)}</p>
      </div>
    </InfoPageShell>
  )
}
