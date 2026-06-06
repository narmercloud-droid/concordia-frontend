import React from "react"

type Props = {
  variant?: "mark" | "full"
  size?: "sm" | "md" | "lg" | "hero"
  className?: string
}

const sizes = {
  sm: { mark: 28, word: "1rem" },
  md: { mark: 36, word: "1.15rem" },
  lg: { mark: 48, word: "1.35rem" },
  hero: { mark: 88, word: "clamp(2rem, 6vw, 2.75rem)" }
}

export default function ConcordiaLogo({
  variant = "full",
  size = "md",
  className = ""
}: Props) {
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
          {size === "hero" && <span className="concordia-logo__tagline">Restaurant</span>}
        </span>
      )}
    </span>
  )
}
