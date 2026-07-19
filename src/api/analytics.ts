import api from "./client.js"

type ChartPayload = { labels: string[]; values: number[] }

export type OrderLocationPoint = {
  lat: number
  lng: number
  count: number
  revenue: number
  postalCode: string | null
}

export type OrderPostalArea = {
  postalCode: string
  count: number
  revenue: number
  lat: number | null
  lng: number | null
}

export type OrderLocationBranch = {
  id: string
  name: string
  lat: number | null
  lng: number | null
}

export type OrderLocationAnalytics = {
  points: OrderLocationPoint[]
  postalAreas: OrderPostalArea[]
  branches: OrderLocationBranch[]
  meta: {
    days: number
    deliveryOrders: number
    withCoords: number
    postalOnly: number
    totalRevenue: number
  }
}

function unwrap<T>(res: { data?: { data?: T } | T }): T {
  const body = res.data as { data?: T; success?: boolean } | T | undefined
  if (body && typeof body === "object" && "data" in body && body.data !== undefined) {
    return body.data as T
  }
  return body as T
}

const withBranch = (branchId?: string) => (branchId ? { branchId } : {})

export const getSalesAnalytics = async (branchId?: string) => {
  const res = await api.get("/api/admin/analytics/sales", { params: withBranch(branchId) })
  return unwrap<ChartPayload>(res)
}

export const getOrderVolumeAnalytics = async (branchId?: string) => {
  const res = await api.get("/api/admin/analytics/order-volume", { params: withBranch(branchId) })
  return unwrap<ChartPayload>(res)
}

export const getCategoryPerformance = async (branchId?: string) => {
  const res = await api.get("/api/admin/analytics/category-performance", {
    params: withBranch(branchId)
  })
  return unwrap<ChartPayload>(res)
}

export const getBranchPerformance = async (branchId?: string) => {
  const res = await api.get("/api/admin/analytics/branch-performance", {
    params: withBranch(branchId)
  })
  return unwrap<ChartPayload>(res)
}

export const getPeakHours = async (branchId?: string) => {
  const res = await api.get("/api/admin/analytics/peak-hours", { params: withBranch(branchId) })
  return unwrap<ChartPayload>(res)
}

export const getTopItems = async (branchId?: string) => {
  const res = await api.get("/api/admin/analytics/top-items", { params: withBranch(branchId) })
  return unwrap<ChartPayload>(res)
}

export const getOrderLocationAnalytics = async (branchId?: string, days = 90) => {
  const res = await api.get("/api/admin/analytics/order-locations", {
    params: { ...withBranch(branchId), days }
  })
  return unwrap<OrderLocationAnalytics>(res)
}
