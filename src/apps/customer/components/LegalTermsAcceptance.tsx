import React from "react"
import { Link } from "react-router-dom"
import { Trans } from "react-i18next"

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  showLoyaltyLink?: boolean
}

export default function LegalTermsAcceptance({
  checked,
  onChange,
  showLoyaltyLink = false
}: Props) {
  return (
    <label className="checkout-terms-checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <Trans
          i18nKey={showLoyaltyLink ? "legal.acceptTermsWithLoyalty" : "legal.acceptTerms"}
          components={{
            agbLink: <Link to="/agb" className="checkout-terms-link" />,
            widerrufLink: <Link to="/widerruf" className="checkout-terms-link" />,
            termsLink: <Link to="/terms" className="checkout-terms-link" />
          }}
        />
      </span>
    </label>
  )
}
