import api from "./client.js"

function unwrap<T>(res: { data?: { data?: T } }): T {
  return (res.data?.data ?? res.data) as T
}

export const getManagerBranch = async (branchId?: string) => {
  const res = await api.get("/api/v1/manager/branch", {
    params: branchId ? { branchId } : {}
  })
  return unwrap(res)
}

export const getManagerDashboard = (branchId?: string) =>
  api.get("/api/v1/manager/dashboard", { params: branchId ? { branchId } : {} })

export const getManagerHours = (branchId?: string) =>
  api.get("/api/v1/manager/hours", { params: branchId ? { branchId } : {} })

export const updateManagerHours = (hours: any[], branchId?: string) =>
  api.put("/api/v1/manager/hours", { hours, branchId })

export const getManagerDeliverySettings = async (branchId?: string) => {
  const res = await api.get("/api/v1/manager/config", {
    params: branchId ? { branchId } : {}
  })
  return unwrap<Record<string, unknown>>(res)
}

export const updateManagerDeliverySettings = async (
  settings: {
    deliveryMode: "postcodes" | "radius" | "both"
    freeDeliveryAtMinimum: boolean
    deliveryAreas: any[]
    deliveryRadiusZones: Array<{
      maxDistanceKm: number
      minimumOrder: number
      deliveryFee: number
      label?: string
    }>
  },
  branchId?: string
) => {
  const res = await api.patch("/api/v1/manager/config/delivery-settings", {
    ...settings,
    branchId
  })
  return unwrap(res)
}

export const getManagerMenu = (branchId?: string) =>
  api.get("/api/v1/manager/menu", { params: branchId ? { branchId } : {} })

export const updateManagerMenuItem = (
  id: number,
  data: { price?: number; isAvailable?: boolean },
  branchId?: string
) => api.patch(`/api/v1/manager/menu/items/${id}`, { ...data, branchId })

export const updateManagerVariantGroup = (
  groupId: string,
  data: { includedChoice: boolean },
  branchId?: string
) => api.patch(`/api/v1/manager/menu/variant-groups/${groupId}`, { ...data, branchId })

export const getManagerOrders = (branchId?: string) =>
  api.get("/api/v1/manager/orders", { params: branchId ? { branchId } : {} })

export const getManagerCustomers = async (
  branchId?: string,
  params?: { marketingOnly?: boolean; search?: string }
) => {
  const res = await api.get("/api/v1/manager/customers", {
    params: { branchId, ...params }
  })
  return unwrap<{ customers: any[]; stats: any }>(res)
}

export const exportManagerCustomers = async (
  branchId?: string,
  marketingOnly = false
) => {
  const res = await api.get("/api/v1/manager/customers/export", {
    params: { branchId, marketingOnly: marketingOnly ? "true" : undefined }
  })
  return unwrap<{ csv: string; filename: string }>(res)
}

export const getManagerCustomerOrders = async (phone: string, branchId?: string) => {
  const res = await api.get(
    `/api/v1/manager/customers/${encodeURIComponent(phone)}/orders`,
    { params: branchId ? { branchId } : {} }
  )
  return unwrap<{ orders: any[] }>(res)
}

export const runManagerAutomation = (branchId?: string) =>
  api.post("/api/v1/manager/customers/automation/run", { branchId })

export const getManagerSession = async () => {
  const res = await api.get("/api/v1/manager/session")
  return unwrap<{
    user: any
    permissions: Record<string, boolean> | null
    isSuperAdmin: boolean
  }>(res)
}

export const getManagerPromotions = async (branchId?: string) => {
  const res = await api.get("/api/v1/manager/promotions", {
    params: branchId ? { branchId } : {}
  })
  return unwrap<{
    freeDrinkMinOrder: number
    freeDrinkMessage: string
    websiteDiscountEnabled: boolean
  }>(res)
}

export const updateManagerPromotions = async (
  data: {
    freeDrinkMinOrder?: number
    freeDrinkMessage?: string
    websiteDiscountEnabled?: boolean
  },
  branchId?: string
) => {
  const res = await api.patch("/api/v1/manager/promotions", { ...data, branchId })
  return unwrap(res)
}
