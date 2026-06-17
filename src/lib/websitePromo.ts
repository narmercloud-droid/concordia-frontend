export const WEBSITE_ORDER_DISCOUNT_PCT = 10

export function calcWebsiteDiscount(subtotal: number, discountPct = WEBSITE_ORDER_DISCOUNT_PCT) {
  if (subtotal <= 0 || discountPct <= 0) return 0
  return Math.round(subtotal * discountPct) / 100
}

export function calcDiscountedSubtotal(subtotal: number, discountPct = WEBSITE_ORDER_DISCOUNT_PCT) {
  return Math.max(0, subtotal - calcWebsiteDiscount(subtotal, discountPct))
}
