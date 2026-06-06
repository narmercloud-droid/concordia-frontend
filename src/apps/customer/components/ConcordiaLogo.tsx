import React from "react"
import ConcordiaArtisanLogo from "@/apps/customer/components/ConcordiaArtisanLogo"

type Props = {
  size?: "sm" | "md" | "lg"
  className?: string
}

const widths = {
  sm: 128,
  md: 156,
  lg: 200
}

export default function ConcordiaLogo({ size = "md", className = "" }: Props) {
  return (
    <span className={`concordia-logo concordia-logo--${size} ${className}`.trim()}>
      <ConcordiaArtisanLogo width={widths[size]} className="concordia-logo__svg" />
    </span>
  )
}
