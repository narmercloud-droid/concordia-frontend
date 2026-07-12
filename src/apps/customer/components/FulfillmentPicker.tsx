import React from "react"
import { useTranslation } from "react-i18next"
import type { FulfillmentIntent } from "@/lib/fulfillmentIntent"

type Props = {
  value: FulfillmentIntent
  onChange: (value: FulfillmentIntent) => void
  supportsDelivery?: boolean
  supportsPickup?: boolean
  compact?: boolean
  className?: string
}

export default function FulfillmentPicker({
  value,
  onChange,
  supportsDelivery = true,
  supportsPickup = true,
  compact = false,
  className = ""
}: Props) {
  const { t } = useTranslation()

  if (!supportsDelivery && !supportsPickup) return null

  const deliveryOnly = supportsDelivery && !supportsPickup
  const pickupOnly = supportsPickup && !supportsDelivery

  if (deliveryOnly || pickupOnly) {
    const locked = deliveryOnly ? "delivery" : "pickup"
    return (
      <p className={`fulfillment-picker fulfillment-picker--locked${className ? ` ${className}` : ""}`}>
        {locked === "delivery" ? t("checkout.delivery") : t("checkout.pickup")}
      </p>
    )
  }

  return (
    <div
      className={`fulfillment-picker${compact ? " fulfillment-picker--compact" : ""}${
        className ? ` ${className}` : ""
      }`}
      role="group"
      aria-label={t("checkout.orderType")}
    >
      <button
        type="button"
        className={`fulfillment-picker__btn${
          value === "delivery" ? " fulfillment-picker__btn--active" : ""
        }`}
        onClick={() => onChange("delivery")}
      >
        <span className="fulfillment-picker__title">{t("checkout.delivery")}</span>
        {!compact && (
          <span className="fulfillment-picker__hint">{t("checkout.deliveryHint")}</span>
        )}
      </button>
      <button
        type="button"
        className={`fulfillment-picker__btn${
          value === "pickup" ? " fulfillment-picker__btn--active" : ""
        }`}
        onClick={() => onChange("pickup")}
      >
        <span className="fulfillment-picker__title">{t("checkout.pickup")}</span>
        {!compact && (
          <span className="fulfillment-picker__hint">{t("checkout.pickupHint")}</span>
        )}
      </button>
    </div>
  )
}
