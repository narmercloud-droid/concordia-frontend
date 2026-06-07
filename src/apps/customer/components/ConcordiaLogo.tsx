import React from "react"
import { useTranslation } from "react-i18next"
import { BRAND_LOGO_IMAGE } from "@/lib/branchBranding"

type Props = {
  size?: "sm" | "md" | "lg"
  className?: string
}

const widths = {
  sm: 120,
  md: 148,
  lg: 196
}

export default function ConcordiaLogo({ size = "md", className = "" }: Props) {
  const { t } = useTranslation()
  const width = widths[size]

  return (
    <span className={`concordia-logo concordia-logo--${size} ${className}`.trim()}>
      <img
        src={BRAND_LOGO_IMAGE}
        alt={t("common.logoAlt")}
        className="concordia-logo__image"
        width={width * 2}
        height={width}
        loading="lazy"
      />
    </span>
  )
}
