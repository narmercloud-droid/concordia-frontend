import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  dismissOrderPushPrompt,
  enableOrderNotifications,
  getPushPermission,
  getStoredPushToken,
  isOrderPushDismissed,
  isPushConfigured,
  subscribeToPush
} from "@/utils/pushNotifications"
import { attachOrderPushSubscription } from "@/api/customer"
import "./OfferNotificationsPrompt.css"

type Props = {
  orderId: string
  branchId?: string | null
  /** Show after checkout or while the order is still early in the kitchen flow. */
  active?: boolean
}

const EARLY_STATUSES = new Set(["pending", "accepted", "preparing"])

export default function OrderNotificationsPrompt({
  orderId,
  branchId = null,
  active = true
}: Props) {
  const { t } = useTranslation()
  const [hidden, setHidden] = useState(false)
  const [loading, setLoading] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState("")

  // Already granted: silently attach this order so status pushes work.
  useEffect(() => {
    if (!active || !orderId || !isPushConfigured()) return
    if (getPushPermission() !== "granted") return

    let cancelled = false
    void (async () => {
      try {
        const token =
          getStoredPushToken() ||
          (await subscribeToPush({
            allowOrders: true,
            branchId,
            syncBackend: true
          }))
        if (!token || cancelled) return
        await attachOrderPushSubscription(orderId, token)
        if (!cancelled) setEnabled(true)
      } catch {
        // ignore — prompt stays hidden when already granted
      }
    })()

    return () => {
      cancelled = true
    }
  }, [active, orderId, branchId])

  if (!active || !orderId) return null
  if (!isPushConfigured()) return null
  if (hidden || enabled) return null
  if (isOrderPushDismissed(orderId)) return null

  const permission = getPushPermission()
  if (permission === "unsupported" || permission === "denied") return null
  if (permission === "granted") return null

  const handleEnable = async () => {
    setLoading(true)
    setError("")
    try {
      const ok = await enableOrderNotifications(orderId, branchId)
      if (!ok) {
        setError(t("notifications.orderEnableFailed"))
        return
      }
      setEnabled(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    dismissOrderPushPrompt(orderId)
    setHidden(true)
  }

  return (
    <section
      className="offer-notifications-prompt"
      aria-label={t("notifications.orderPromptAria")}
    >
      <div className="offer-notifications-prompt__icon" aria-hidden="true">
        🔔
      </div>
      <div className="offer-notifications-prompt__copy">
        <h3 className="offer-notifications-prompt__title">
          {t("notifications.orderPromptTitle")}
        </h3>
        <p className="offer-notifications-prompt__lead">
          {t("notifications.orderPromptLead")}
        </p>
        {error ? <p className="offer-notifications-prompt__error">{error}</p> : null}
      </div>
      <div className="offer-notifications-prompt__actions">
        <button
          type="button"
          className="offer-notifications-prompt__cta"
          onClick={() => void handleEnable()}
          disabled={loading}
        >
          {loading ? t("notifications.enabling") : t("notifications.orderEnable")}
        </button>
        <button
          type="button"
          className="offer-notifications-prompt__dismiss"
          onClick={handleDismiss}
          disabled={loading}
        >
          {t("notifications.notNow")}
        </button>
      </div>
    </section>
  )
}

export function shouldShowOrderNotificationPrompt(
  justPlaced: boolean,
  status?: string | null
) {
  if (justPlaced) return true
  if (!status) return false
  return EARLY_STATUSES.has(status)
}
