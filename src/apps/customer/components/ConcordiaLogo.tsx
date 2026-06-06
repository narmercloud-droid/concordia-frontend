import React from "react"
import { useTranslation } from "react-i18next"

type Props = {
  variant?: "mark" | "full"
  size?: "sm" | "md" | "lg" | "hero"
  className?: string
  showSlogan?: boolean
}

const sizes = {
  sm: { mark: 32, word: "1.05rem" },
  md: { mark: 38, word: "1.2rem" },
  lg: { mark: 52, word: "1.4rem" },
  hero: { mark: 76, word: "clamp(2.1rem, 7vw, 3.1rem)" }
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
      <img
        src="/logo-concordia.svg"
        alt=""
        aria-hidden="true"
        className="concordia-logo__mark"
        width={dim}
        height={dim}
      />
      {variant === "full" && (
        <span className="concordia-logo__text">
          <span className="concordia-logo__name" style={{ fontSize: sizes[size].word }}>
            Concordia
          </span>
          {showSlogan && (
            <span className="concordia-logo__tagline">{t("home.slogan")}</span>
          )}
        </span>
      )}
    </span>
  )
}
