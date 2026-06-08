import React from "react"
import { Link } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import LegalDocument from "@/apps/customer/components/LegalDocument"
import LegalCrossLinks from "@/apps/customer/components/LegalCrossLinks"

export default function AgbPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.agb.eyebrow")} title={t("pages.agb.title")}>
      <div className="info-block">
        <p>{t("pages.agb.lead")}</p>
        <p>
          <Trans
            i18nKey="pages.agb.loyaltyNote"
            components={{
              termsLink: <Link to="/terms" className="checkout-terms-link" />
            }}
          />
        </p>
      </div>
      <LegalCrossLinks current="/agb" />
      <LegalDocument doc="agb" />
      <LegalCrossLinks current="/agb" />
    </InfoPageShell>
  )
}
