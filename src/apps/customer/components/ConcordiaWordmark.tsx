import React from "react"
import { useTranslation } from "react-i18next"

type Props = {
  variant?: "hero" | "header" | "footer"
  className?: string
}

export default function ConcordiaWordmark({ variant = "hero", className = "" }: Props) {
  const { t } = useTranslation()

  return (
    <span className={`concordia-wordmark concordia-wordmark--${variant} ${className}`.trim()}>
      <span className="concordia-wordmark__script">{t("common.brand")}</span>
      <span className="concordia-wordmark__restaurant">Restaurant</span>
      <span className="concordia-wordmark__rule" aria-hidden="true" />
      <span className="concordia-wordmark__tagline">{t("home.tagline")}</span>
    </span>
  )
}
