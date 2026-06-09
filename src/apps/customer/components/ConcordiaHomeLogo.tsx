import React from "react"
import { useTranslation } from "react-i18next"
import { BRAND_LOGO_HERO } from "@/lib/branchBranding"

export default function ConcordiaHomeLogo() {
  const { t } = useTranslation()

  return (
    <h1 className="concordia-home-logo">
      <img
        src={BRAND_LOGO_HERO}
        alt={t("common.logoHomeAlt")}
        className="concordia-home-logo__image"
        width={720}
        height={360}
        fetchPriority="high"
      />
    </h1>
  )
}
