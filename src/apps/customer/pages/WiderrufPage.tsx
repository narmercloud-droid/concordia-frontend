import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"
import LegalDocument from "@/apps/customer/components/LegalDocument"
import LegalCrossLinks from "@/apps/customer/components/LegalCrossLinks"

export default function WiderrufPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.widerruf.eyebrow")} title={t("pages.widerruf.title")}>
      <div className="info-block">
        <p>{t("pages.widerruf.lead")}</p>
      </div>
      <LegalCrossLinks current="/widerruf" />
      <LegalDocument doc="widerruf" />
      <LegalCrossLinks current="/widerruf" />
    </InfoPageShell>
  )
}
