import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import LegalDocument from "@/apps/customer/components/LegalDocument"
import LegalCrossLinks from "@/apps/customer/components/LegalCrossLinks"

export default function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.privacy.eyebrow")} title={t("pages.privacy.title")}>
      <div className="info-block">
        <p>{t("pages.privacy.lead")}</p>
      </div>
      <LegalCrossLinks current="/datenschutz" />
      <LegalDocument doc="datenschutz" />
      <LegalCrossLinks current="/datenschutz" />
    </InfoPageShell>
  )
}
