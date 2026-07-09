import type { PaymentMethodId } from "./PaymentMethodOption"

export const CHECKOUT_PAYMENT_METHOD_ORDER: PaymentMethodId[] = [
  "cash",
  "paypal",
  "card",
  "apple_pay",
  "google_pay"
]

export type PaymentMethodsMap = Partial<Record<PaymentMethodId, boolean>>

export const GIFT_VOUCHER_PAYMENT_METHOD_ORDER: PaymentMethodId[] = [
  "cash",
  "paypal",
  "card",
  "apple_pay",
  "google_pay"
]

export function listAvailablePaymentMethods(order: PaymentMethodId[], methods: PaymentMethodsMap) {
  return order.filter((method) => Boolean(methods[method]))
}
