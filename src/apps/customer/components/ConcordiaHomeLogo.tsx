import React from "react"
import { BRAND_LOGO_IMAGE } from "@/lib/branchBranding"

export default function ConcordiaHomeLogo() {
  return (
    <h1 className="concordia-home-logo">
      <img
        src={BRAND_LOGO_IMAGE}
        alt="Concordia Restaurant — Pizza, Pasta, Grill"
        className="concordia-home-logo__image"
        width={720}
        height={360}
        fetchPriority="high"
      />
    </h1>
  )
}
