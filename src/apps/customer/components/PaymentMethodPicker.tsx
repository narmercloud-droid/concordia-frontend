import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import PaymentMethodOption, { type PaymentMethodId } from "./PaymentMethodOption"
import {
  CHECKOUT_PAYMENT_METHOD_ORDER,
  partitionPaymentMethods,
  type PaymentMethodsMap
} from "./checkoutPaymentMethods"

type Props = {
  methods: PaymentMethodsMap
  selected: PaymentMethodId
  paymentLocked?: boolean
  methodOrder?: PaymentMethodId[]
  isMethodEnabled?: (method: PaymentMethodId) => boolean
  onSelect: (method: PaymentMethodId) => void
}

const LABEL_KEYS: Record<PaymentMethodId, string> = {
  cash: "checkout.payCash",
  card: "checkout.payCard",
  apple_pay: "checkout.payApplePay",
  google_pay: "checkout.payGooglePay",
  paypal: "checkout.payPayPal",
  klarna: "checkout.payKlarna",
  sepa: "checkout.paySepa"
}

function defaultIsMethodEnabled(
  method: PaymentMethodId,
  methods: PaymentMethodsMap,
  paymentLocked: boolean
) {
  if (!methods[method]) return false
  if (method === "klarna" || method === "sepa") return true
  return !paymentLocked
}

export default function PaymentMethodPicker({
  methods,
  selected,
  paymentLocked = false,
  methodOrder = CHECKOUT_PAYMENT_METHOD_ORDER,
  isMethodEnabled,
  onSelect
}: Props) {
  const { t } = useTranslation()

  const resolveEnabled = (method: PaymentMethodId) =>
    isMethodEnabled
      ? isMethodEnabled(method)
      : defaultIsMethodEnabled(method, methods, paymentLocked)

  const { available, comingSoon } = useMemo(
    () => partitionPaymentMethods(methodOrder, methods),
    [methodOrder, methods]
  )

  return (
    <div className="checkout-payment-picker">
      {available.length > 0 && (
        <div
          className="checkout-payment-grid checkout-payment-grid--available"
          role="radiogroup"
          aria-label={t("checkout.paymentMethod")}
        >
          {available.map((method) => (
            <PaymentMethodOption
              key={method}
              method={method}
              label={t(LABEL_KEYS[method])}
              active={selected === method}
              enabled={resolveEnabled(method)}
              comingSoon={t("checkout.comingSoon")}
              onSelect={() => onSelect(method)}
            />
          ))}
        </div>
      )}

      {comingSoon.length > 0 && (
        <div className="checkout-payment-coming-soon">
          <p className="checkout-payment-coming-soon__label">{t("checkout.paymentComingSoon")}</p>
          <div className="checkout-payment-grid checkout-payment-grid--soon">
            {comingSoon.map((method) => (
              <PaymentMethodOption
                key={method}
                method={method}
                label={t(LABEL_KEYS[method])}
                active={false}
                enabled={false}
                compact
                comingSoon={t("checkout.comingSoon")}
                onSelect={() => onSelect(method)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
