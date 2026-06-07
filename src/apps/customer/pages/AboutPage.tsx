import React from "react"
import { useTranslation } from "react-i18next"
import InfoPageShell from "@/apps/customer/components/InfoPageShell"

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <InfoPageShell eyebrow={t("pages.about.eyebrow")} title={t("pages.about.title")}>
      <div className="info-block">
        <p>{t("pages.about.p1")}</p>
        <p>{t("pages.about.p2")}</p>
      </div>
      <div className="info-block">
        <h2 className="info-block__title">{t("pages.about.chefsTitle")}</h2>
        <p>{t("pages.about.chefsText")}</p>
        <p>
          <em>{t("branchOwner.signature")}</em>
        </p>
      </div>
      <div className="info-block">
        <h2 className="info-block__title">{t("pages.about.kitchenTitle")}</h2>
        <p>{t("pages.about.kitchenText")}</p>
      </div>
    </InfoPageShell>
  )
}
