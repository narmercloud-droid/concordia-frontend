import React, { useMemo, useRef } from "react"
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer
} from "@paypal/react-paypal-js"
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

type ButtonProps = Omit<Props, "paypalClientId" | "paypalMode" | "currency">

function PayPalButtonsPanel({
  fundingSource,
  orderId,
  giftPurchaseId,
  payableAmount,
  onSuccess,
  onError
}: ButtonProps) {
  const { t } = useTranslation()
  const captureInFlightRef = useRef(false)
  const [{ isPending, isRejected, isResolved }] = usePayPalScriptReducer()

  if (isPending) {
    return (
      <div className="checkout-paypal-loading" role="status">
        <p className="customer-hint">{t("checkout.paypalLoading")}</p>
      </div>
    )
  }

  if (isRejected) {
    return (
      <div className="customer-alert customer-alert--error checkout-paypal-load-error" role="alert">
        {t("checkout.paypalLoadFailed")}
      </div>
    )
  }

  if (!isResolved) {
    return null
  }

  return (
    <>
      {payableAmount ? (
        <p className="customer-hint checkout-paypal-payable" role="note">
          {t("checkout.payNowPayable", { amount: payableAmount })}
        </p>
      ) : null}
      <div className="checkout-paypal-buttons">
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
      </div>
    </>
  )
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
      <PayPalButtonsPanel
        fundingSource={fundingSource}
        orderId={orderId}
        giftPurchaseId={giftPurchaseId}
        payableAmount={payableAmount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </PayPalScriptProvider>
  )
}
