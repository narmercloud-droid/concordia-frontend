import api from "./client.js"

function unwrap<T>(res: { data?: { data?: T } }): T {
  return (res.data?.data ?? res.data) as T
}

export type CouponCampaign = {
  id: string
  branchId: string | null
  scope: "branch" | "platform"
  title: string
  description: string | null
  discountType: string
  discountValue: number
  minOrder: number
  validFrom?: string | null
  validUntil: string | null
  newCustomersOnly: boolean
  sortOrder?: number
  claimed?: boolean
  customerCouponId?: string | null
  status?: string | null
}

export type CustomerCoupon = {
  id: string
  claimCode: string
  status: string
  activatedAt: string | null
  campaign: {
    id: string
    branchId: string | null
    scope: "branch" | "platform"
    title: string
    description: string | null
    discountType: string
    discountValue: number
    minOrder: number
    validUntil: string | null
  }
}

export const getBranchCouponCampaigns = async (branchId: string) => {
  const res = await api.get(`/api/branches/${branchId}/coupon-campaigns`)
  return unwrap<{ campaigns: CouponCampaign[] }>(res)
}

export const listMyCoupons = async (branchId?: string) => {
  const res = await api.get("/api/v1/customers/coupons", {
    params: branchId ? { branchId } : undefined
  })
  return unwrap<{ coupons: CustomerCoupon[]; activatedCouponId: string | null }>(res)
}

export const listAvailableCoupons = async (branchId: string) => {
  const res = await api.get("/api/v1/customers/coupons/available", {
    params: { branchId }
  })
  return unwrap<{ campaigns: CouponCampaign[] }>(res)
}

export const claimCouponCampaign = async (campaignId: string, branchId?: string) => {
  const res = await api.post(`/api/v1/customers/coupons/claim/${campaignId}`, {
    branchId
  })
  return unwrap<{ id: string; claimCode: string; status: string; alreadyClaimed: boolean }>(res)
}

export const activateCoupon = async (customerCouponId: string) => {
  const res = await api.post(`/api/v1/customers/coupons/${customerCouponId}/activate`)
  return unwrap<{ id: string; claimCode: string; status: string }>(res)
}

export type ManagerCouponCampaign = CouponCampaign & { isActive: boolean }

export const getManagerCouponCampaigns = async (branchId?: string) => {
  const res = await api.get("/api/v1/manager/coupon-campaigns", {
    params: branchId ? { branchId } : {}
  })
  return unwrap<{ campaigns: ManagerCouponCampaign[] }>(res)
}

export const createManagerCouponCampaign = async (
  input: {
    title: string
    description?: string
    discountType: string
    discountValue: number
    minOrder?: number
    scope?: "branch" | "platform"
    newCustomersOnly?: boolean
    validUntil?: string | null
    maxRedemptions?: number | null
  },
  branchId?: string
) => {
  const res = await api.post("/api/v1/manager/coupon-campaigns", { ...input, branchId })
  return unwrap<{ campaign: ManagerCouponCampaign }>(res)
}

export const updateManagerCouponCampaign = async (
  campaignId: string,
  input: Partial<{
    title: string
    description: string
    discountType: string
    discountValue: number
    minOrder: number
    newCustomersOnly: boolean
    isActive: boolean
    validUntil: string | null
  }>,
  branchId?: string
) => {
  const res = await api.patch(`/api/v1/manager/coupon-campaigns/${campaignId}`, {
    ...input,
    branchId
  })
  return unwrap<{ campaign: ManagerCouponCampaign }>(res)
}

export function formatCouponDiscount(
  discountType: string,
  discountValue: number,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  const type = discountType.toLowerCase()
  if (type === "free_delivery") return t("coupons.freeDelivery")
  if (type === "percent" || type === "percentage") {
    return t("coupons.percentOff", { value: discountValue })
  }
  return t("coupons.amountOff", { value: discountValue.toFixed(2).replace(".", ",") })
}
