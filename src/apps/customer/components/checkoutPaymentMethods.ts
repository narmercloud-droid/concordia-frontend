import type { PaymentMethodId } from "./PaymentMethodOption"

export const CHECKOUT_PAYMENT_METHOD_ORDER: PaymentMethodId[] = [
  "paypal",
  "cash",
  "card",
  "apple_pay",
  "google_pay",
  "klarna",
  "sepa"
]

export type PaymentMethodsMap = Partial<Record<PaymentMethodId, boolean>>

export const GIFT_VOUCHER_PAYMENT_METHOD_ORDER: PaymentMethodId[] = [
  "paypal",
  "card",
  "apple_pay",
  "google_pay",
  "cash"
]

export function partitionPaymentMethods(order: PaymentMethodId[], methods: PaymentMethodsMap) {
  const available: PaymentMethodId[] = []
  const comingSoon: PaymentMethodId[] = []

  for (const method of order) {
    if (methods[method]) {
      available.push(method)
    } else {
      comingSoon.push(method)
    }
  }

  return { available, comingSoon }
}
