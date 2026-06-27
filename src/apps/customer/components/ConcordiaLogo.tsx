import React from "react"
import { useTranslation } from "react-i18next"
import {
  BRAND_LOGO_HEADER,
  BRAND_LOGO_HERO,
  BRAND_LOGO_ICON
} from "@/lib/branchBranding"

type Props = {
  size?: "sm" | "md" | "lg"
  className?: string
  /** Circular crop — footer & compact spots */
  round?: boolean
  /** lockup = navbar; hero = homepage; icon = round source */
  variant?: "lockup" | "hero" | "icon"
}

const roundSizes = {
  sm: 48,
  md: 72,
  lg: 88
}

export default function ConcordiaLogo({
  size = "md",
  className = "",
  round = false,
  variant = "lockup"
}: Props) {
  const { t } = useTranslation()
  const resolvedVariant = round ? "icon" : variant

  if (resolvedVariant === "icon") {
    const edge = roundSizes[size]
    return (
      <span
        className={`concordia-logo concordia-logo--round concordia-logo--${size} ${className}`.trim()}
      >
        <img
          src={BRAND_LOGO_ICON}
          alt={t("common.logoAlt")}
          className="concordia-logo__round-image"
          width={edge}
          height={edge}
          loading="lazy"
        />
      </span>
    )
  }

  const src = resolvedVariant === "hero" ? BRAND_LOGO_HERO : BRAND_LOGO_HEADER
  const modifier = resolvedVariant === "hero" ? "hero" : "lockup"

  return (
    <span
      className={`concordia-logo concordia-logo--${modifier} concordia-logo--${size} ${className}`.trim()}
    >
      <img
        src={src}
        alt={t("common.logoAlt")}
        className="concordia-logo__image"
        width={resolvedVariant === "hero" ? 360 : 240}
        height={resolvedVariant === "hero" ? 220 : 52}
        loading={resolvedVariant === "hero" ? "eager" : "lazy"}
        decoding="async"
      />
    </span>
  )
}
