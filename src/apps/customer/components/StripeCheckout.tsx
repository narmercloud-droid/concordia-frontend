import React, { useMemo, useState } from "react"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js"
import { useTranslation } from "react-i18next"
import { confirmGiftCardStripePayment, confirmStripePayment } from "@/api/payments"

type Props = {
  publishableKey: string
  stripeAccountId: string
  clientSecret: string
  customerSessionClientSecret?: string | null
  savePaymentMethodOffered?: boolean
  orderId?: string
  giftPurchaseId?: string
  onSuccess: (result?: { code?: string }) => void
  onError: (message: string) => void
}

function StripePaymentForm({
  orderId,
  giftPurchaseId,
  onSuccess,
  onError
}: Omit<Props, "publishableKey" | "stripeAccountId" | "clientSecret">) {
  const { t } = useTranslation()
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required"
      })

      if (result.error) {
        onError(result.error.message ?? t("checkout.paymentFailed"))
        return
      }

      const status = result.paymentIntent?.status
      if (status !== "succeeded") {
        onError(t("checkout.paymentFailed"))
        return
      }

      if (giftPurchaseId) {
        const confirmed = await confirmGiftCardStripePayment(giftPurchaseId)
        onSuccess({ code: confirmed.code })
        return
      }

      if (orderId) {
        await confirmStripePayment(orderId)
        onSuccess()
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        err?.message ??
        t("checkout.paymentFailed")
      onError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          wallets: {
            applePay: "auto",
            googlePay: "auto"
          }
        }}
      />
      <button
        type="submit"
        className="customer-btn customer-btn--primary"
        style={{ marginTop: 16 }}
        disabled={!stripe || !elements || submitting}
      >
        {submitting ? t("checkout.processingPayment") : t("checkout.payNow")}
      </button>
    </form>
  )
}

export default function StripeCheckout({
  publishableKey,
  stripeAccountId,
  clientSecret,
  customerSessionClientSecret,
  savePaymentMethodOffered,
  orderId,
  giftPurchaseId,
  onSuccess,
  onError
}: Props) {
  const { t } = useTranslation()

  const stripePromise = useMemo(
    () => loadStripe(publishableKey, { stripeAccount: stripeAccountId }),
    [publishableKey, stripeAccountId]
  )

  const options = useMemo<StripeElementsOptions>(
    () => ({
      clientSecret,
      ...(customerSessionClientSecret
        ? { customerSessionClientSecret }
        : {}),
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#2d6a4f"
        }
      }
    }),
    [clientSecret, customerSessionClientSecret]
  )

  if (!clientSecret || !publishableKey || !stripeAccountId) {
    return <p className="customer-hint">{t("checkout.paymentUnavailable")}</p>
  }

  return (
    <div className="customer-card stripe-checkout">
      <h3 className="customer-subtitle">{t("checkout.onlinePaymentTitle")}</h3>
      <p className="customer-hint">{t("checkout.stripePaymentHint")}</p>
      {savePaymentMethodOffered ? (
        <p className="customer-hint">{t("checkout.savePaymentMethodHint")}</p>
      ) : null}
      <Elements stripe={stripePromise} options={options}>
        <StripePaymentForm
          orderId={orderId}
          giftPurchaseId={giftPurchaseId}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Elements>
    </div>
  )
}
