import React from "react"
import { Link } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import LegalCrossLinks from "@/apps/customer/components/LegalCrossLinks"

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

const COUPON_SECTIONS = [
  "overview",
  "wallet",
  "platformPerks",
  "stacking",
  "marketing",
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
        <p>
          <Trans
            i18nKey={`${base}.relatedLegal`}
            components={{
              impressumLink: <Link to="/impressum" className="checkout-terms-link" />,
              privacyLink: <Link to="/datenschutz" className="checkout-terms-link" />,
              agbLink: <Link to="/agb" className="checkout-terms-link" />
            }}
          />
        </p>
      </div>

      <LegalCrossLinks current="/terms" />

      {WEBSITE_SECTIONS.map((key) => (
        <div key={key} className="info-block info-legal__section">
          <h2 className="info-block__title">{t(`${base}.sections.${key}.title`)}</h2>
          {key === "privacy" ? (
            <p>
              <Trans
                i18nKey={`${base}.sections.privacy.body`}
                components={{
                  privacyLink: <Link to="/datenschutz" className="checkout-terms-link" />
                }}
              />
            </p>
          ) : (
            <p>{t(`${base}.sections.${key}.body`)}</p>
          )}
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

      <div className="info-legal__part-divider">
        <h2 className="info-legal__part-title">{t(`${base}.couponsPartTitle`)}</h2>
        <p>{t(`${base}.couponsPartLead`)}</p>
      </div>

      {COUPON_SECTIONS.map((key) => (
        <div key={`coupon-${key}`} className="info-block info-legal__section">
          <h2 className="info-block__title">{t(`${base}.couponSections.${key}.title`)}</h2>
          <p>{t(`${base}.couponSections.${key}.body`)}</p>
        </div>
      ))}

      <div className="info-block info-legal__contact">
        <p>{t(`${base}.contact`)}</p>
      </div>

      <LegalCrossLinks current="/terms" />
    </InfoPageShell>
  )
}
