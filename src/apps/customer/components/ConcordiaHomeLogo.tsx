import React from "react"
import { HOMEPAGE_LOGO_IMAGE } from "@/lib/branchBranding"

/** Homepage hero — official Concordia Restaurant logo artwork. */
export default function ConcordiaHomeLogo() {
  return (
    <h1 className="concordia-home-logo">
      <img
        src={HOMEPAGE_LOGO_IMAGE}
        alt="Concordia Restaurant — Pizza, Pasta, Grill"
        className="concordia-home-logo__image"
        width={840}
        height={420}
        fetchPriority="high"
      />
    </h1>
  )
}
