import React from "react"
import { useTranslation } from "react-i18next"
import ConcordiaLogo from "@/apps/customer/components/ConcordiaLogo"

export default function ConcordiaHomeLogo() {
  const { t } = useTranslation()

  return (
    <h1 className="concordia-home-logo">
      <ConcordiaLogo variant="hero" size="lg" />
      <span className="visually-hidden">{t("common.logoHomeAlt")}</span>
    </h1>
  )
}
