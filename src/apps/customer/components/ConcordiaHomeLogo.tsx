import React from "react"
import ConcordiaMark from "@/apps/customer/components/ConcordiaMark"

/** Homepage hero logo — harmony emblem with refined wordmark. */
export default function ConcordiaHomeLogo() {
  return (
    <div className="concordia-home-logo">
      <ConcordiaMark size={112} className="concordia-home-logo__mark" />
      <div className="concordia-home-logo__wordmark">
        <h1 className="concordia-home-logo__name">
          <span className="concordia-home-logo__c">C</span>oncordia
        </h1>
        <p className="concordia-home-logo__sub">Restaurant</p>
        <div className="concordia-home-logo__ornament" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
