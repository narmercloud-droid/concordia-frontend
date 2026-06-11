import React from "react"
import { useTranslation } from "react-i18next"
import { BRAND_LOGO_FANCY, BRAND_LOGO_IMAGE } from "@/lib/branchBranding"

type Props = {
  size?: "sm" | "md" | "lg"
  className?: string
  /** Circular crop — header & footer */
  round?: boolean
}

const widths = {
  sm: 120,
  md: 148,
  lg: 196
}

const roundSizes = {
  sm: 48,
  md: 72,
  lg: 88
}

export default function ConcordiaLogo({ size = "md", className = "", round = false }: Props) {
  const { t } = useTranslation()

  if (round) {
    const edge = roundSizes[size]
    return (
      <span
        className={`concordia-logo concordia-logo--round concordia-logo--${size} ${className}`.trim()}
      >
        <img
          src={BRAND_LOGO_FANCY}
          alt={t("common.logoAlt")}
          className="concordia-logo__round-image"
          width={edge}
          height={edge}
          loading="lazy"
          style={{ objectPosition: "50% 18%" }}
        />
      </span>
    )
  }

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
