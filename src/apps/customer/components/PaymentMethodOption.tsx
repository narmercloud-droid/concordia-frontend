import React from "react"

export type PaymentMethodId = "cash" | "card" | "paypal" | "klarna" | "sepa"

type Props = {
  method: PaymentMethodId
  label: string
  active: boolean
  enabled: boolean
  comingSoon: string
  onSelect: () => void
}

export default function PaymentMethodOption({
  method,
  label,
  active,
  enabled,
  comingSoon,
  onSelect
}: Props) {
  return (
    <button
      type="button"
      disabled={!enabled}
      className={`checkout-payment-option${active ? " checkout-payment-option--active" : ""}${
        !enabled ? " checkout-payment-option--disabled" : ""
      }`}
      onClick={onSelect}
      title={!enabled ? comingSoon : label}
      aria-label={label}
    >
      <PaymentMethodIcon method={method} />
      <span>{label}</span>
      {!enabled && <small>{comingSoon}</small>}
    </button>
  )
}

function PaymentMethodIcon({ method }: { method: PaymentMethodId }) {
  switch (method) {
    case "cash":
      return (
        <svg className="checkout-payment-icon" viewBox="0 0 48 32" aria-hidden="true">
          <rect x="1" y="6" width="46" height="20" rx="3" fill="#2d6a4f" />
          <rect x="4" y="9" width="40" height="14" rx="2" fill="#40916c" />
          <circle cx="24" cy="16" r="5" fill="#d8f3dc" />
          <text x="24" y="18.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#1b4332">
            €
          </text>
        </svg>
      )
    case "card":
      return (
        <svg className="checkout-payment-icon" viewBox="0 0 48 32" aria-hidden="true">
          <rect x="1" y="4" width="46" height="24" rx="4" fill="#1a1f71" />
          <rect x="1" y="10" width="46" height="6" fill="#f7b600" />
          <rect x="6" y="20" width="14" height="3" rx="1" fill="#fff" opacity="0.9" />
          <rect x="6" y="25" width="8" height="2" rx="1" fill="#fff" opacity="0.6" />
          <circle cx="38" cy="22" r="5" fill="#eb001b" />
          <circle cx="42" cy="22" r="5" fill="#f79e1b" opacity="0.9" />
        </svg>
      )
    case "paypal":
      return (
        <svg className="checkout-payment-icon checkout-payment-icon--brand" viewBox="0 0 48 32" aria-hidden="true">
          <rect x="1" y="4" width="46" height="24" rx="4" fill="#fff" stroke="#e5e7eb" />
          <text x="10" y="21" fontSize="11" fontWeight="700" fill="#003087">
            Pay
          </text>
          <text x="28" y="21" fontSize="11" fontWeight="700" fill="#009cde">
            Pal
          </text>
        </svg>
      )
    case "klarna":
      return (
        <svg className="checkout-payment-icon checkout-payment-icon--brand" viewBox="0 0 48 32" aria-hidden="true">
          <rect x="1" y="4" width="46" height="24" rx="4" fill="#ffb3c7" />
          <text x="24" y="21" textAnchor="middle" fontSize="10" fontWeight="700" fill="#17120f">
            Klarna
          </text>
        </svg>
      )
    case "sepa":
      return (
        <svg className="checkout-payment-icon checkout-payment-icon--brand" viewBox="0 0 48 32" aria-hidden="true">
          <rect x="1" y="4" width="46" height="24" rx="4" fill="#0b4f8a" />
          <text x="24" y="14" textAnchor="middle" fontSize="7" fontWeight="700" fill="#ffcc00">
            SEPA
          </text>
          <text x="24" y="23" textAnchor="middle" fontSize="5" fill="#fff">
            Lastschrift
          </text>
        </svg>
      )
    default:
      return null
  }
}
