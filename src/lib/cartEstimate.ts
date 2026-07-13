import { calcDiscountedSubtotal, calcWebsiteDiscount } from "@/lib/websitePromo"
import type { FulfillmentIntent } from "@/lib/fulfillmentIntent"

export type DeliveryZoneLike = {
  deliveryFee: number
  minimumOrder?: number
  freeDeliveryMinimum?: number
}

export function coerceRadiusZones(zones: unknown): DeliveryZoneLike[] {
  return Array.isArray(zones) ? zones : []
}

export function estimateCartDisplay(params: {
  subtotal: number
  discountPct: number
  fulfillment: FulfillmentIntent | null
  zones: unknown
}) {
  const { subtotal, discountPct, fulfillment, zones: rawZones } = params
  const zones = coerceRadiusZones(rawZones)
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
