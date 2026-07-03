import React from "react"

export type PaymentMethodId =
  | "cash"
  | "card"
  | "apple_pay"
  | "google_pay"
  | "paypal"
  | "klarna"
  | "sepa"

type Props = {
  method: PaymentMethodId
  label: string
  active: boolean
  enabled: boolean
  compact?: boolean
  comingSoon: string
  onSelect: () => void
}

export default function PaymentMethodOption({
  method,
  label,
  active,
  enabled,
  compact = false,
  comingSoon,
  onSelect
}: Props) {
  return (
    <button
      type="button"
      disabled={!enabled}
      className={[
        "checkout-payment-option",
        active ? "checkout-payment-option--active" : "",
        !enabled ? "checkout-payment-option--disabled" : "",
        compact ? "checkout-payment-option--compact" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onSelect}
      title={!enabled ? comingSoon : label}
      aria-label={label}
      aria-pressed={enabled ? active : undefined}
    >
      {active && enabled && (
        <span className="checkout-payment-option__check" aria-hidden="true">
          ✓
        </span>
      )}
      <span className="checkout-payment-option__icon-wrap">
        <PaymentMethodIcon method={method} />
      </span>
      <span className="checkout-payment-option__label">{label}</span>
      {!enabled && <small className="checkout-payment-option__soon">{comingSoon}</small>}
    </button>
  )
}

function PaymentMethodIcon({ method }: { method: PaymentMethodId }) {
  switch (method) {
    case "cash":
      return (
        <svg className="checkout-payment-icon checkout-payment-icon--cash" viewBox="0 0 56 36" aria-hidden="true">
          <defs>
            <linearGradient id="euro-coin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe066" />
              <stop offset="55%" stopColor="#f4b942" />
              <stop offset="100%" stopColor="#d4a017" />
            </linearGradient>
            <radialGradient id="euro-shine" cx="35%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#fff8dc" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fff8dc" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="28" cy="20" rx="22" ry="14" fill="#c9a227" opacity="0.35" />
          <circle cx="28" cy="18" r="15" fill="url(#euro-coin)" stroke="#b8860b" strokeWidth="1.5" />
          <circle cx="28" cy="18" r="15" fill="url(#euro-shine)" />
          <circle cx="28" cy="18" r="11" fill="none" stroke="#fff3bf" strokeWidth="1" opacity="0.7" />
          <text x="28" y="23" textAnchor="middle" fontSize="14" fontWeight="800" fill="#7a5c00" fontFamily="Arial,sans-serif">
            €
          </text>
        </svg>
      )
    case "card":
      return (
        <svg className="checkout-payment-icon" viewBox="0 0 56 36" aria-hidden="true">
          <rect x="2" y="4" width="52" height="28" rx="6" fill="#1a1f71" />
          <rect x="2" y="12" width="52" height="8" fill="#f7b600" />
          <rect x="8" y="24" width="18" height="4" rx="1.5" fill="#fff" opacity="0.92" />
          <circle cx="42" cy="24" r="5.5" fill="#eb001b" />
          <circle cx="46" cy="24" r="5.5" fill="#f79e1b" opacity="0.92" />
        </svg>
      )
    case "apple_pay":
      return (
        <svg className="checkout-payment-icon checkout-payment-icon--brand" viewBox="0 0 56 36" aria-hidden="true">
          <rect x="2" y="4" width="52" height="28" rx="6" fill="#000" />
          <path
            d="M18 14c-.8 1-2.1 1.7-3.4 1.6-.1-1.3.5-2.6 1.3-3.5.8-.9 2.2-1.6 3.3-1.7.1 1.1-.3 2.3-1.2 3.6zm-1.2 4.2c-1.9 0-3.4 1.1-4.3 1.1-.9 0-2.2-1-3.6-1-1.9 0-3.6 1.1-4.6 2.8-2 3.4-1.6 8.5.4 11.3 1 1.4 2.2 3 3.8 2.9 1.5-.1 2.1-.9 3.9-.9 1.8 0 2.3.9 3.9.9 1.6 0 2.6-1.4 3.6-2.8 1.1-1.6 1.6-3.2 1.6-3.3-.1 0-3.1-1.2-3.1-4.7 0-3 2.4-4.4 2.5-4.5-1.4-2-3.5-2.2-4.2-2.3"
            fill="#fff"
            transform="translate(12, 4) scale(1.15)"
          />
          <text x="34" y="23" fontSize="7" fontWeight="600" fill="#fff">
            Pay
          </text>
        </svg>
      )
    case "google_pay":
      return (
        <svg className="checkout-payment-icon checkout-payment-icon--brand" viewBox="0 0 56 36" aria-hidden="true">
          <rect x="2" y="4" width="52" height="28" rx="6" fill="#fff" stroke="#e2e8f0" strokeWidth="1" />
          <text x="14" y="18" fontSize="9" fontWeight="700" fill="#4285F4">
            G
          </text>
          <text x="22" y="18" fontSize="9" fontWeight="700" fill="#EA4335">
            o
          </text>
          <text x="28" y="18" fontSize="9" fontWeight="700" fill="#FBBC05">
            o
          </text>
          <text x="34" y="18" fontSize="9" fontWeight="700" fill="#4285F4">
            g
          </text>
          <text x="40" y="18" fontSize="9" fontWeight="700" fill="#34A853">
            l
          </text>
          <text x="46" y="18" fontSize="9" fontWeight="700" fill="#EA4335">
            e
          </text>
          <text x="28" y="28" textAnchor="middle" fontSize="6" fontWeight="600" fill="#5f6368">
            Pay
          </text>
        </svg>
      )
    case "paypal":
      return (
        <svg className="checkout-payment-icon checkout-payment-icon--brand" viewBox="0 0 56 36" aria-hidden="true">
          <rect x="2" y="4" width="52" height="28" rx="6" fill="#fff" stroke="#dbeafe" strokeWidth="1" />
          <path
            d="M18.5 10.5h6.8c3.2 0 5.4 2.1 4.9 5.5-.4 2.8-2.5 4.3-5.4 4.3h-2.7l-.9 5.7h-3.4l2.7-15.5z"
            fill="#003087"
          />
          <path
            d="M28.2 10.5h6.9c3.1 0 5.2 2 4.7 5.4-.5 3.1-2.8 4.4-5.8 4.4h-2.5l-.8 5.1h-3.2l2.7-15.5z"
            fill="#009cde"
          />
          <path
            d="M22.8 14.2h2.1c1.4 0 2.3.9 2.1 2.4-.2 1.3-1.1 2-2.4 2h-1.5l.7-4.4z"
            fill="#001c64"
            opacity="0.85"
          />
          <path
            d="M32.6 14.2h2.2c1.3 0 2.2.9 2 2.3-.2 1.2-1 1.9-2.3 1.9h-1.4l.7-4.2z"
            fill="#012169"
            opacity="0.75"
          />
        </svg>
      )
    case "klarna":
      return (
        <svg className="checkout-payment-icon checkout-payment-icon--brand" viewBox="0 0 56 36" aria-hidden="true">
          <rect x="2" y="4" width="52" height="28" rx="6" fill="#ffb3c7" />
          <text x="28" y="23" textAnchor="middle" fontSize="11" fontWeight="800" fill="#17120f" fontFamily="Arial, sans-serif">
            Klarna
          </text>
        </svg>
      )
    case "sepa":
      return (
        <svg className="checkout-payment-icon checkout-payment-icon--brand" viewBox="0 0 56 36" aria-hidden="true">
          <rect x="2" y="4" width="52" height="28" rx="6" fill="#0b4f8a" />
          <text x="28" y="16" textAnchor="middle" fontSize="8" fontWeight="800" fill="#ffcc00">
            SEPA
          </text>
          <text x="28" y="26" textAnchor="middle" fontSize="5.5" fill="#fff">
            Lastschrift
          </text>
        </svg>
      )
    default:
      return null
  }
}
