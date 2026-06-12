import React from "react"
import { useTranslation } from "react-i18next"
import { translateOrderStatus } from "@/utils/translateStatus"

type Step = {
  key: string
  label: string
}

type Props = {
  status: string
  fulfillmentType?: string | null
}

function deliverySteps(t: (key: string) => string): Step[] {
  return [
    { key: "received", label: t("order.stepReceived") },
    { key: "preparing", label: t("order.stepPreparing") },
    { key: "onTheWay", label: t("order.stepOnTheWay") },
    { key: "delivered", label: t("order.stepDelivered") }
  ]
}

function pickupSteps(t: (key: string) => string): Step[] {
  return [
    { key: "received", label: t("order.stepReceived") },
    { key: "preparing", label: t("order.stepPreparing") },
    { key: "ready", label: t("order.stepReady") },
    { key: "done", label: t("order.stepDone") }
  ]
}

function activeStepIndex(status: string, fulfillmentType?: string | null): number {
  if (["cancelled"].includes(status)) return -1

  if (fulfillmentType === "pickup") {
    if (["pending", "accepted"].includes(status)) return 0
    if (["preparing"].includes(status)) return 1
    if (["ready_for_pickup"].includes(status)) return 2
    if (["picked_up", "delivered", "completed"].includes(status)) return 3
    return 0
  }

  if (["pending", "accepted"].includes(status)) return 0
  if (["preparing"].includes(status)) return 1
  if (["ready_for_pickup", "picked_up"].includes(status)) return 2
  if (["delivered", "completed"].includes(status)) return 3
  return 0
}

export default function OrderProgressStepper({ status, fulfillmentType }: Props) {
  const { t } = useTranslation()
  const steps = fulfillmentType === "pickup" ? pickupSteps(t) : deliverySteps(t)
  const active = activeStepIndex(status, fulfillmentType)
  const cancelled = status === "cancelled"

  if (cancelled) {
    return (
      <div className="order-progress order-progress--cancelled">
        {translateOrderStatus(status, t)}
      </div>
    )
  }

  return (
    <ol className="order-progress" aria-label={t("order.progressLabel")}>
      {steps.map((step, index) => {
        const done = index < active
        const current = index === active
        return (
          <li
            key={step.key}
            className={`order-progress__step${
              done ? " order-progress__step--done" : ""
            }${current ? " order-progress__step--active" : ""}`}
          >
            <span className="order-progress__dot" aria-hidden="true">
              {done ? "✓" : index + 1}
            </span>
            <span className="order-progress__label">{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}
