export type OrderCheckoutTag =
  | "customer_abandoned"
  | "payment_failed"
  | "unpaid_incomplete"

export function checkoutTagBadgeClass(tag: OrderCheckoutTag) {
  switch (tag) {
    case "customer_abandoned":
      return "orders-page__badge orders-page__badge--checkout-cancelled"
    case "payment_failed":
      return "orders-page__badge orders-page__badge--checkout-failed"
    case "unpaid_incomplete":
      return "orders-page__badge orders-page__badge--checkout-unpaid"
    default:
      return "orders-page__badge"
  }
}
