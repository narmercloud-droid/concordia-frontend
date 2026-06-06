import React from "react"
import { BRAND_LOGO_IMAGE } from "@/lib/branchBranding"

type Props = {
  size?: "sm" | "md" | "lg"
  className?: string
}

const widths = {
  sm: 132,
  md: 168,
  lg: 220
}

export default function ConcordiaLogo({ size = "md", className = "" }: Props) {
  const width = widths[size]

  return (
    <span className={`concordia-logo concordia-logo--${size} ${className}`.trim()}>
      <img
        src={BRAND_LOGO_IMAGE}
        alt="Concordia Restaurant"
        className="concordia-logo__image"
        width={width * 2}
        height={width}
        loading="lazy"
      />
    </span>
  )
}
