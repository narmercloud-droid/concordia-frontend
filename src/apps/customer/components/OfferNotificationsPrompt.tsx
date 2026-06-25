import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  dismissOfferPushPrompt,
  enableOfferNotifications,
  getPushPermission,
  isOfferPushDismissed,
  isPushConfigured
} from "@/utils/pushNotifications"
import "./OfferNotificationsPrompt.css"

type Props = {
  branchId?: string | null
}

export default function OfferNotificationsPrompt({ branchId = null }: Props) {
  const { t } = useTranslation()
  const [hidden, setHidden] = useState(false)
  const [loading, setLoading] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState("")

  if (!isPushConfigured()) return null
  if (hidden || enabled) return null

  const permission = getPushPermission()
  if (permission === "unsupported" || permission === "denied") return null
  if (permission === "granted") return null
  if (isOfferPushDismissed()) return null

  const handleEnable = async () => {
    setLoading(true)
    setError("")
    try {
      const ok = await enableOfferNotifications(branchId)
      if (!ok) {
        setError(t("notifications.enableFailed"))
        return
      }
      setEnabled(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    dismissOfferPushPrompt()
    setHidden(true)
  }

  return (
    <section className="offer-notifications-prompt" aria-label={t("notifications.promptAria")}>
      <div className="offer-notifications-prompt__icon" aria-hidden="true">
        🔔
      </div>
      <div className="offer-notifications-prompt__copy">
        <h3 className="offer-notifications-prompt__title">{t("notifications.promptTitle")}</h3>
        <p className="offer-notifications-prompt__lead">{t("notifications.promptLead")}</p>
        {error ? <p className="offer-notifications-prompt__error">{error}</p> : null}
      </div>
      <div className="offer-notifications-prompt__actions">
        <button
          type="button"
          className="offer-notifications-prompt__cta"
          onClick={() => void handleEnable()}
          disabled={loading}
        >
          {loading ? t("notifications.enabling") : t("notifications.enable")}
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
