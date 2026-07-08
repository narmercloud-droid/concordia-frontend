import type { PaymentMethodId } from "./PaymentMethodOption"

export const CHECKOUT_PAYMENT_METHOD_ORDER: PaymentMethodId[] = [
  "paypal",
  "card",
  "apple_pay",
  "google_pay",
  "cash"
]

export type PaymentMethodsMap = Partial<Record<PaymentMethodId, boolean>>

export const GIFT_VOUCHER_PAYMENT_METHOD_ORDER: PaymentMethodId[] = [
  "paypal",
  "card",
  "apple_pay",
  "google_pay",
  "cash"
]

export function listAvailablePaymentMethods(order: PaymentMethodId[], methods: PaymentMethodsMap) {
  return order.filter((method) => Boolean(methods[method]))
}
