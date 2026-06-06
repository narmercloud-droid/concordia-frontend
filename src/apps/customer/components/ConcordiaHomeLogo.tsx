import React from "react"
import ConcordiaArtisanLogo from "@/apps/customer/components/ConcordiaArtisanLogo"

/** Homepage hero — transparent artisan logo. */
export default function ConcordiaHomeLogo() {
  return (
    <h1 className="concordia-home-logo">
      <ConcordiaArtisanLogo className="concordia-home-logo__svg" width={440} />
    </h1>
  )
}
