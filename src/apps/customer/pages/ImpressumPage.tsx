import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import LegalDocument from "@/apps/customer/components/LegalDocument"
import LegalCrossLinks from "@/apps/customer/components/LegalCrossLinks"

export default function ImpressumPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.impressum.eyebrow")} title={t("pages.impressum.title")}>
      <div className="info-block">
        <p>{t("pages.impressum.lead")}</p>
      </div>
      <LegalCrossLinks current="/impressum" />
      <LegalDocument doc="impressum" />
      <LegalCrossLinks current="/impressum" />
    </InfoPageShell>
  )
}
