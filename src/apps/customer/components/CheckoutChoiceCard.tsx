import React from "react"

type Props = {
  active: boolean
  disabled?: boolean
  icon: React.ReactNode
  title: string
  hint: string
  onClick: () => void
}

export default function CheckoutChoiceCard({
  active,
  disabled = false,
  icon,
  title,
  hint,
  onClick
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        "checkout-choice-card",
        active ? "checkout-choice-card--active" : "",
        disabled ? "checkout-choice-card--disabled" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      aria-pressed={disabled ? undefined : active}
    >
      <span className="checkout-choice-card__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="checkout-choice-card__title">{title}</span>
      <span className="checkout-choice-card__hint">{hint}</span>
      {active && (
        <span className="checkout-choice-card__check" aria-hidden="true">
          ✓
        </span>
      )}
    </button>
  )
}
