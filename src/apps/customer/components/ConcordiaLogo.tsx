import React from "react"
import { useTranslation } from "react-i18next"
import ConcordiaMark from "@/apps/customer/components/ConcordiaMark"

type Props = {
  variant?: "mark" | "full"
  size?: "sm" | "md" | "lg" | "hero"
  className?: string
  showSlogan?: boolean
}

const sizes = {
  sm: { mark: 34, word: "1.15rem" },
  md: { mark: 40, word: "1.25rem" },
  lg: { mark: 54, word: "1.45rem" },
  hero: { mark: 72, word: "clamp(2.2rem, 7vw, 3.2rem)" }
}

export default function ConcordiaLogo({
  variant = "full",
  size = "md",
  className = "",
  showSlogan = false
}: Props) {
  const { t } = useTranslation()
  const dim = sizes[size].mark

  return (
    <span className={`concordia-logo concordia-logo--${size} ${className}`.trim()}>
      <ConcordiaMark size={dim} className="concordia-logo__mark" />
      {variant === "full" && (
        <span className="concordia-logo__text">
          <span className="concordia-logo__name" style={{ fontSize: sizes[size].word }}>
            Concordia
          </span>
          <span className="concordia-logo__restaurant">Restaurant</span>
          {showSlogan && (
            <span className="concordia-logo__tagline">{t("home.slogan")}</span>
          )}
        </span>
      )}
    </span>
  )
}
