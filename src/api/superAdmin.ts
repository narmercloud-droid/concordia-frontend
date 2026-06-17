import api from "./client.js"

function unwrap<T>(res: { data?: { data?: T } }): T {
  return (res.data?.data ?? res.data) as T
}

export const getSuperAdminPermissions = async () => {
  const res = await api.get("/api/v1/super-admin/permissions")
  return unwrap<{ permissions: Record<string, boolean>; keys: string[] }>(res)
}

export const updateSuperAdminPermissions = async (permissions: Record<string, boolean>) => {
  const res = await api.put("/api/v1/super-admin/permissions", { permissions })
  return unwrap<{ permissions: Record<string, boolean> }>(res)
}

export const getSuperAdminStaff = async () => {
  const res = await api.get("/api/v1/super-admin/staff")
  return unwrap<{ staff: any[] }>(res)
}

export const createSuperAdminStaff = async (data: {
  name: string
  email: string
  password: string
  role: "admin" | "manager"
  branchId?: string | null
}) => {
  const res = await api.post("/api/v1/super-admin/staff", data)
  return unwrap(res)
}

export const updateSuperAdminStaff = async (
  id: string,
  data: {
    name?: string
    email?: string
    password?: string
    role?: "admin" | "manager"
    branchId?: string | null
  }
) => {
  const res = await api.put(`/api/v1/super-admin/staff/${id}`, data)
  return unwrap(res)
}

export const deleteSuperAdminStaff = async (id: string) => {
  const res = await api.delete(`/api/v1/super-admin/staff/${id}`)
  return unwrap(res)
}

export type SuperAdminBranch = {
  id: string
  name: string
  status: "live" | "coming_soon"
  city?: string | null
  address?: string | null
}

export const getSuperAdminBranches = async () => {
  const res = await api.get("/api/v1/super-admin/branches")
  return unwrap<SuperAdminBranch[]>(res)
}

export const updateSuperAdminBranchStatus = async (
  branchId: string,
  status: "live" | "coming_soon"
) => {
  const res = await api.put(`/api/v1/super-admin/branches/${branchId}/status`, { status })
  return unwrap<SuperAdminBranch>(res)
}

export type PlatformSettings = {
  platform: {
    websiteOrderDiscountPct: number
    freeDrinkCheckoutEnabled: boolean
    showFreeDrinkCheckout: boolean
    showLoyaltyCheckout: boolean
    winbackPromoCode: string
    birthdayPromoCode: string
  }
  notifications: {
    id: string
    enableSms: boolean
    enablePush: boolean
    enableEmail: boolean
    smsProvider: string
    pushProvider: string
    emailProvider: string
    notifyOrderPlaced: boolean
    notifyOrderAccepted: boolean
    notifyOutForDelivery: boolean
    notifyDelivered: boolean
  }
  loyalty: {
    id: string
    pointsPerCurrency: number
    silverThreshold: number
    goldThreshold: number
    platinumThreshold: number
    allowPromoStacking: boolean
    pointsExpireMonths: number | null
  }
  permissions: Record<string, boolean>
}

export const getPlatformSettings = async () => {
  const res = await api.get("/api/v1/super-admin/platform-settings")
  return unwrap<PlatformSettings>(res)
}

export const updatePlatformSettings = async (data: {
  platform?: Partial<PlatformSettings["platform"]>
  notifications?: Partial<PlatformSettings["notifications"]>
  loyalty?: Partial<PlatformSettings["loyalty"]>
  permissions?: Record<string, boolean>
}) => {
  const res = await api.put("/api/v1/super-admin/platform-settings", data)
  return unwrap<PlatformSettings>(res)
}

export type BranchSettingsDetail = {
  id: string
  name: string
  printerType: string
  printerUrl: string | null
  avgPrepTimeBaseline: number
  status: string
  ordersPaused: boolean
  city: string
  address: string
  postalCode: string
  lat: number | null
  lng: number | null
  slug: string
  terminalCode: string
  supportsPickup: boolean
  supportsDelivery: boolean
  websiteUrl: string
  lieferandoUrl: string
  googlePlaceId: string
  lieferandoRestaurantId: string
  promotions: {
    freeDrinkMinOrder: number
    freeDrinkMessage: string
    websiteDiscountEnabled: boolean
    freeDrinkEnabled: boolean
  }
  printing: {
    printingMode: string
    autoPrint: boolean
    printCopies: number
    routingMode: string
  }
}

export const getSuperAdminBranchSettings = async (branchId: string) => {
  const res = await api.get(`/api/v1/super-admin/branches/${branchId}/settings`)
  return unwrap<BranchSettingsDetail>(res)
}

export const updateSuperAdminBranchSettings = async (
  branchId: string,
  data: Partial<BranchSettingsDetail> & {
    promotions?: Partial<BranchSettingsDetail["promotions"]>
    printing?: Partial<BranchSettingsDetail["printing"]>
  }
) => {
  const res = await api.put(`/api/v1/super-admin/branches/${branchId}/settings`, data)
  return unwrap<BranchSettingsDetail>(res)
}
