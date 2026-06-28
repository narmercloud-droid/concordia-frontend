import React from "react"
import { Navigate, useSearchParams } from "react-router-dom"

/** Legacy route — merged into /offers */
export default function CouponsPage() {
  const [searchParams] = useSearchParams()
  const branchId = searchParams.get("branchId")
  const hash = searchParams.get("campaignId") ? "#coupons" : "#coupons"
  const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : ""
  return <Navigate to={`/offers${query}${hash}`} replace />
}
