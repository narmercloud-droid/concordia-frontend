import { calcDiscountedSubtotal, calcWebsiteDiscount } from "@/lib/websitePromo"
import type { FulfillmentIntent } from "@/lib/fulfillmentIntent"

export type DeliveryZoneLike = {
  deliveryFee: number
  minimumOrder?: number
  freeDeliveryMinimum?: number
}

export function estimateCartDisplay(params: {
  subtotal: number
  discountPct: number
  fulfillment: FulfillmentIntent | null
  zones: DeliveryZoneLike[]
}) {
  const { subtotal, discountPct, fulfillment, zones } = params
  const websiteDiscount = calcWebsiteDiscount(subtotal, discountPct)
  const foodTotal = calcDiscountedSubtotal(subtotal, discountPct)

  if (fulfillment !== "delivery" || !zones.length) {
    return {
      foodTotal,
      websiteDiscount,
      estimatedDeliveryFee: null as number | null,
      estimatedTotal: foodTotal,
      deliveryFeeLabel: null as string | null
    }
  }

  const estimatedDeliveryFee = Math.min(...zones.map((z) => Number(z.deliveryFee) || 0))
  return {
    foodTotal,
    websiteDiscount,
    estimatedDeliveryFee,
    estimatedTotal: foodTotal + estimatedDeliveryFee,
    deliveryFeeLabel: String(estimatedDeliveryFee)
  }
}
