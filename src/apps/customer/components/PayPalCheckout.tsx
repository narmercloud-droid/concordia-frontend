import React, { useMemo, useRef } from "react"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { useTranslation } from "react-i18next"
import {
  captureGiftCardPayPalOrder,
  capturePayPalOrder,
  createGiftCardPayPalOrder,
  createPayPalOrder
} from "@/api/payments"

type Props = {
  paypalClientId: string
  paypalMode?: "live" | "sandbox"
  currency: string
  fundingSource?: "paypal" | "card"
  orderId?: string
  giftPurchaseId?: string
  payableAmount?: string
  onSuccess: (result?: { code?: string }) => void
  onError: (message: string) => void
}

export default function PayPalCheckout({
  paypalClientId,
  paypalMode = "live",
  currency,
  fundingSource,
  orderId,
  giftPurchaseId,
  payableAmount,
  onSuccess,
  onError
}: Props) {
  const { t } = useTranslation()
  const captureInFlightRef = useRef(false)

  const options = useMemo(
    () => ({
      clientId: paypalClientId,
      currency,
      intent: "capture" as const,
      locale: "de_DE",
      environment: (paypalMode === "live" ? "production" : "sandbox") as
        | "production"
        | "sandbox",
      components: "buttons" as const
    }),
    [paypalClientId, currency, paypalMode]
  )

  return (
    <PayPalScriptProvider options={options}>
      {payableAmount ? (
        <p className="customer-hint checkout-paypal-payable" role="note">
          {t("checkout.payNowPayable", { amount: payableAmount })}
        </p>
      ) : null}
      <PayPalButtons
        fundingSource={fundingSource}
        style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
        createOrder={async () => {
          try {
            if (giftPurchaseId) {
              const result = await createGiftCardPayPalOrder(giftPurchaseId)
              return result.paypalOrderId
            }
            if (!orderId) throw new Error("Missing payment target")
            const result = await createPayPalOrder(orderId)
            return result.paypalOrderId
          } catch (err: any) {
            const message =
              err?.response?.data?.error?.message ??
              err?.response?.data?.message ??
              t("checkout.paymentFailed")
            onError(message)
            throw err
          }
        }}
        onApprove={async () => {
          if (captureInFlightRef.current) return
          captureInFlightRef.current = true
          try {
            if (giftPurchaseId) {
              const result = await captureGiftCardPayPalOrder(giftPurchaseId)
              onSuccess({ code: result.code })
              return
            }
            if (!orderId) throw new Error("Missing payment target")
            await capturePayPalOrder(orderId)
            onSuccess()
          } catch (err: any) {
            const message =
              err?.response?.data?.error?.message ??
              err?.response?.data?.message ??
              t("checkout.paymentFailed")
            onError(message)
          } finally {
            captureInFlightRef.current = false
          }
        }}
        onCancel={() => onError(t("checkout.paymentCancelled"))}
        onError={() => onError(t("checkout.paymentFailed"))}
      />
    </PayPalScriptProvider>
  )
}
