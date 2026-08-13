import React, { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import OrderNotificationsPrompt, {
  shouldShowOrderNotificationPrompt
} from "@/apps/customer/components/OrderNotificationsPrompt"
import {
  getPushPermission,
  isPushConfigured
} from "@/utils/pushNotifications"

type Props = {
  orderId: string
  branchId?: string | null
  justPlaced: boolean
  status?: string | null
}

export default function OrderTrackingStayUpdated({
  orderId,
  branchId = null,
  justPlaced,
  status
}: Props) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [pushPermission, setPushPermission] = useState(getPushPermission())

  useEffect(() => {
    setPushPermission(getPushPermission())
  }, [orderId, status])

  const active = shouldShowOrderNotificationPrompt(justPlaced, status)
  if (!active) return null

  const pushConfigured = isPushConfigured()
  const showNotificationPrompt = pushConfigured && pushPermission !== "unsupported" && pushPermission !== "denied"
  const notificationsEnabled = pushPermission === "granted"

  const copyTrackingLink = useCallback(async () => {
    setCopyFailed(false)
    const url = window.location.href
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const input = document.createElement("textarea")
        input.value = url
        input.setAttribute("readonly", "")
        input.style.position = "absolute"
        input.style.left = "-9999px"
        document.body.appendChild(input)
        input.select()
        const ok = document.execCommand("copy")
        document.body.removeChild(input)
        if (!ok) throw new Error("copy failed")
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopyFailed(true)
    }
  }, [])

  return (
    <section className="order-stay-updated" aria-label={t("order.stayUpdatedTitle")}>
      <h3 className="order-stay-updated__title">{t("order.stayUpdatedTitle")}</h3>
      <p className="order-stay-updated__intro">{t("order.stayUpdatedIntro")}</p>

      <ol className="order-stay-updated__options">
        {pushConfigured && pushPermission !== "unsupported" ? (
          <li className="order-stay-updated__option">
            <p className="order-stay-updated__option-title">
              {t("order.stayUpdatedNotifyTitle")}
            </p>
            <p className="order-stay-updated__option-hint">
              {notificationsEnabled
                ? t("order.stayUpdatedNotifyEnabled")
                : t("order.stayUpdatedNotifyHint")}
            </p>
            {showNotificationPrompt && !notificationsEnabled ? (
              <OrderNotificationsPrompt
                orderId={orderId}
                branchId={branchId}
                active={active}
              />
            ) : null}
          </li>
        ) : null}

        <li className="order-stay-updated__option">
          <p className="order-stay-updated__option-title">
            {t("order.stayUpdatedLinkTitle")}
          </p>
          <p className="order-stay-updated__option-hint">
            {t("order.stayUpdatedLinkHint")}
          </p>
          <button
            type="button"
            className="order-stay-updated__copy-btn"
            onClick={() => void copyTrackingLink()}
          >
            {copied ? t("order.copyTrackingLinkDone") : t("order.copyTrackingLink")}
          </button>
          {copyFailed ? (
            <p className="order-stay-updated__copy-error">{t("order.copyTrackingLinkFailed")}</p>
          ) : null}
        </li>
      </ol>
    </section>
  )
}
