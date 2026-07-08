import React, { useId, useMemo } from "react"
import { useTranslation } from "react-i18next"
import PaymentMethodOption, { type PaymentMethodId } from "./PaymentMethodOption"
import {
  CHECKOUT_PAYMENT_METHOD_ORDER,
  listAvailablePaymentMethods,
  type PaymentMethodsMap
} from "./checkoutPaymentMethods"

type Props = {
  methods: PaymentMethodsMap
  selected: PaymentMethodId
  paymentLocked?: boolean
  methodOrder?: PaymentMethodId[]
  cashHint?: string
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

const HINT_KEYS: Partial<Record<PaymentMethodId, string>> = {
  card: "checkout.payCardHint",
  apple_pay: "checkout.payApplePayHint",
  google_pay: "checkout.payGooglePayHint",
  paypal: "checkout.payPayPalHint"
}

function defaultIsMethodEnabled(
  method: PaymentMethodId,
  methods: PaymentMethodsMap,
  paymentLocked: boolean
) {
  if (!methods[method]) return false
  return !paymentLocked
}

export default function PaymentMethodPicker({
  methods,
  selected,
  paymentLocked = false,
  methodOrder = CHECKOUT_PAYMENT_METHOD_ORDER,
  cashHint,
  isMethodEnabled,
  onSelect
}: Props) {
  const { t } = useTranslation()
  const groupId = useId()

  const resolveEnabled = (method: PaymentMethodId) =>
    isMethodEnabled
      ? isMethodEnabled(method)
      : defaultIsMethodEnabled(method, methods, paymentLocked)

  const available = useMemo(
    () => listAvailablePaymentMethods(methodOrder, methods),
    [methodOrder, methods]
  )

  if (available.length === 0) {
    return <p className="checkout-payment-empty">{t("checkout.paymentUnavailable")}</p>
  }

  const showTrustNote = available.some((method) => method !== "cash")

  return (
    <div className="checkout-payment-picker">
      <div
        className="checkout-payment-list"
        role="radiogroup"
        aria-labelledby={groupId}
      >
        <span id={groupId} className="visually-hidden">
          {t("checkout.paymentMethod")}
        </span>
        {available.map((method) => (
          <PaymentMethodOption
            key={method}
            method={method}
            name={`payment-${groupId}`}
            label={t(LABEL_KEYS[method])}
            hint={
              method === "cash"
                ? cashHint
                : HINT_KEYS[method]
                  ? t(HINT_KEYS[method]!)
                  : undefined
            }
            active={selected === method}
            enabled={resolveEnabled(method)}
            onSelect={() => onSelect(method)}
          />
        ))}
      </div>

      {showTrustNote && (
        <p className="checkout-payment-trust">
          <svg
            className="checkout-payment-trust__icon"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 1.5a6.5 6.5 0 00-6.5 6.5v2.25a2.25 2.25 0 01-2 2v6.75a.75.75 0 00.75.75h15.5a.75.75 0 00.75-.75v-6.75a2.25 2.25 0 01-2-2V8a6.5 6.5 0 00-6.5-6.5zm0 1.5a5 5 0 015 5v2.25h-10V8a5 5 0 015-5zm-3.75 8.25h7.5v5.25h-7.5v-5.25z"
              clipRule="evenodd"
            />
          </svg>
          {t("checkout.paymentSecureNote")}
        </p>
      )}
    </div>
  )
}
