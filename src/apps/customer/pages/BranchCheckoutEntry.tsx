import { useEffect } from "react"
import { Navigate, useParams, useSearchParams } from "react-router-dom"
import { useCartStore } from "@/store/cartStore"
import {
  parseFulfillmentParam,
  saveFulfillmentIntent
} from "@/lib/fulfillmentIntent"

/**
 * Entry point for Google Maps pickup/delivery links.
 * Stores fulfillment intent, then sends guests to menu or checkout.
 */
export default function BranchCheckoutEntry() {
  const { branchId = "" } = useParams<{ branchId: string }>()
  const [searchParams] = useSearchParams()
  const fulfillment = parseFulfillmentParam(searchParams.get("fulfillment"))
  const items = useCartStore((s) => s.items)
  const hasBranchCart = items.length > 0 && items[0]?.branchId === branchId

  useEffect(() => {
    if (branchId && fulfillment) {
      saveFulfillmentIntent(branchId, fulfillment)
    }
  }, [branchId, fulfillment])

  if (!branchId) {
    return <Navigate to="/" replace />
  }

  if (hasBranchCart) {
    const query = fulfillment ? `?fulfillment=${fulfillment}` : ""
    return <Navigate to={`/customer/checkout${query}`} replace />
  }

  const menuQuery = fulfillment ? `?fulfillment=${fulfillment}` : ""
  return <Navigate to={`/branch/${branchId}${menuQuery}`} replace />
}
