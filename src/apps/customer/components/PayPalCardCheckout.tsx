import React, { useMemo } from "react"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { useTranslation } from "react-i18next"
import { capturePayPalOrder, createPayPalOrder } from "@/api/payments"

type Props = {
  orderId: string
  paypalClientId: string
  currency: string
  onSuccess: () => void
  onError: (message: string) => void
}

export default function PayPalCardCheckout({
  orderId,
  paypalClientId,
  currency,
  onSuccess,
  onError
}: Props) {
  const { t } = useTranslation()

  const options = useMemo(
    () => ({
      clientId: paypalClientId,
      currency,
      intent: "capture" as const,
      components: "buttons" as const
    }),
    [paypalClientId, currency]
  )

  return (
    <div className="customer-card" style={{ marginTop: 16 }}>
      <h3 className="customer-subtitle">{t("checkout.cardPaymentTitle")}</h3>
      <p className="customer-hint">{t("checkout.cardPaymentHint")}</p>

      <PayPalScriptProvider options={options}>
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
          createOrder={async () => {
            try {
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
            try {
              await capturePayPalOrder(orderId)
              onSuccess()
            } catch (err: any) {
              const message =
                err?.response?.data?.error?.message ??
                err?.response?.data?.message ??
                t("checkout.paymentFailed")
              onError(message)
            }
          }}
          onCancel={() => onError(t("checkout.paymentCancelled"))}
          onError={() => onError(t("checkout.paymentFailed"))}
        />
      </PayPalScriptProvider>
    </div>
  )
}
