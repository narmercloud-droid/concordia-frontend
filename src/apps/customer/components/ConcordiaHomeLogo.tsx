import React from "react"
import { useTranslation } from "react-i18next"
import ConcordiaWordmark from "@/apps/customer/components/ConcordiaWordmark"

export default function ConcordiaHomeLogo() {
  const { t } = useTranslation()

  return (
    <h1 className="concordia-home-logo">
      <ConcordiaWordmark variant="hero" />
      <span className="visually-hidden">{t("common.logoHomeAlt")}</span>
    </h1>
  )
}
