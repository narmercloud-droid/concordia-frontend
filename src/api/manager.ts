import api from "./client.js"

function unwrap<T>(res: { data?: { data?: T } }): T {
  return (res.data?.data ?? res.data) as T
}

export type ManagerBranch = {
  id?: string
  name?: string
  status?: string
  terminalCode?: string
}

export type ManagerMenuItemDetail = {
  name?: string
  description?: string | null
  price?: number
  kitchen?: string
  categoryId?: number
  sortOrder?: number
  isAvailable?: boolean
  imageUrl?: string | null
  variantGroups?: Array<Record<string, unknown>>
  presetAddOnGroups?: Array<Record<string, unknown>>
  addOnGroups?: Array<Record<string, unknown>>
}

export const getManagerBranch = async (branchId?: string): Promise<ManagerBranch> => {
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

export const updateManagerBranchStatus = async (
  status: "live" | "coming_soon",
  branchId?: string
) => {
  const res = await api.patch("/api/v1/manager/branch/status", { status, branchId })
  return unwrap(res)
}

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

const withBranch = (branchId?: string) => (branchId ? { branchId } : {})

export const getManagerMenuItemDetail = async (
  menuItemId: number,
  branchId?: string
): Promise<ManagerMenuItemDetail> => {
  const res = await api.get(`/api/v1/manager/menu/items/${menuItemId}/detail`, {
    params: withBranch(branchId)
  })
  return unwrap<ManagerMenuItemDetail>(res)
}

export const createManagerCategory = (
  data: { name: string; description?: string; sortOrder?: number },
  branchId?: string
) => api.post("/api/v1/manager/menu/categories", { ...data, ...withBranch(branchId) })

export const updateManagerCategory = (
  id: number,
  data: { name?: string; description?: string; sortOrder?: number },
  branchId?: string
) => api.patch(`/api/v1/manager/menu/categories/${id}`, { ...data, ...withBranch(branchId) })

export const deleteManagerCategory = (id: number, branchId?: string) =>
  api.delete(`/api/v1/manager/menu/categories/${id}`, { params: withBranch(branchId) })

export const createManagerMenuItem = (
  data: {
    categoryId: number
    name: string
    description?: string
    price: number
    kitchen?: string
    itemNumber?: string
    sortOrder?: number
    isAvailable?: boolean
  },
  branchId?: string
) => api.post("/api/v1/manager/menu/items", { ...data, ...withBranch(branchId) })

export const updateManagerMenuItemFull = (
  branchMenuItemId: number,
  data: Record<string, unknown>,
  branchId?: string
) =>
  api.patch(`/api/v1/manager/menu/items/${branchMenuItemId}/full`, {
    ...data,
    ...withBranch(branchId)
  })

export const deleteManagerMenuItem = (branchMenuItemId: number, branchId?: string) =>
  api.delete(`/api/v1/manager/menu/branch-items/${branchMenuItemId}`, {
    params: withBranch(branchId)
  })

export const uploadManagerMenuItemImage = async (
  branchMenuItemId: number,
  file: File,
  branchId?: string
) => {
  const fd = new FormData()
  fd.append("image", file)
  if (branchId) fd.append("branchId", branchId)
  const res = await api.post(`/api/v1/manager/menu/items/${branchMenuItemId}/image`, fd, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return unwrap<{ imageUrl?: string | null }>(res)
}

export const clearManagerMenuItemImage = async (branchMenuItemId: number, branchId?: string) => {
  const res = await api.delete(`/api/v1/manager/menu/items/${branchMenuItemId}/image`, {
    params: withBranch(branchId)
  })
  return unwrap(res)
}

export const createManagerVariantGroup = (
  menuItemId: number,
  data: Record<string, unknown>,
  branchId?: string
) =>
  api.post(`/api/v1/manager/menu/items/${menuItemId}/variant-groups`, {
    ...data,
    ...withBranch(branchId)
  })

export const updateManagerVariantGroupFull = (
  groupId: string,
  data: Record<string, unknown>,
  branchId?: string
) =>
  api.patch(`/api/v1/manager/menu/variant-groups/${groupId}/full`, {
    ...data,
    ...withBranch(branchId)
  })

export const deleteManagerVariantGroup = (groupId: string, branchId?: string) =>
  api.delete(`/api/v1/manager/menu/variant-groups/${groupId}`, { params: withBranch(branchId) })

export const createManagerVariant = (
  groupId: string,
  data: { name: string; price: number },
  branchId?: string
) =>
  api.post(`/api/v1/manager/menu/variant-groups/${groupId}/variants`, {
    ...data,
    ...withBranch(branchId)
  })

export const updateManagerVariant = (
  variantId: string,
  data: { name?: string; price?: number },
  branchId?: string
) =>
  api.patch(`/api/v1/manager/menu/variants/${variantId}`, { ...data, ...withBranch(branchId) })

export const deleteManagerVariant = (variantId: string, branchId?: string) =>
  api.delete(`/api/v1/manager/menu/variants/${variantId}`, { params: withBranch(branchId) })

export const createManagerAddOnGroup = (
  menuItemId: number,
  data: Record<string, unknown>,
  branchId?: string
) =>
  api.post(`/api/v1/manager/menu/items/${menuItemId}/addon-groups`, {
    ...data,
    ...withBranch(branchId)
  })

export const updateManagerAddOnGroup = (
  groupId: string,
  data: Record<string, unknown>,
  branchId?: string
) =>
  api.patch(`/api/v1/manager/menu/addon-groups/${groupId}`, { ...data, ...withBranch(branchId) })

export const deleteManagerAddOnGroup = (groupId: string, branchId?: string) =>
  api.delete(`/api/v1/manager/menu/addon-groups/${groupId}`, { params: withBranch(branchId) })

export const createManagerAddOn = (
  groupId: string,
  data: { name: string; price: number },
  branchId?: string
) =>
  api.post(`/api/v1/manager/menu/addon-groups/${groupId}/addons`, {
    ...data,
    ...withBranch(branchId)
  })

export const updateManagerAddOn = (
  addOnId: string,
  data: { name?: string; price?: number },
  branchId?: string
) =>
  api.patch(`/api/v1/manager/menu/addons/${addOnId}`, { ...data, ...withBranch(branchId) })

export const deleteManagerAddOn = (addOnId: string, branchId?: string) =>
  api.delete(`/api/v1/manager/menu/addons/${addOnId}`, { params: withBranch(branchId) })

export const getManagerExtraPresets = async (branchId?: string) => {
  const res = await api.get("/api/v1/manager/menu/extra-presets", {
    params: withBranch(branchId)
  })
  return unwrap<any[]>(res)
}

export const createManagerExtraPreset = (
  data: {
    name: string
    required?: boolean
    minSelect?: number
    maxSelect?: number
    categoryIds?: number[]
    options?: Array<{ name: string; price: number }>
  },
  branchId?: string
) => api.post("/api/v1/manager/menu/extra-presets", { ...data, ...withBranch(branchId) })

export const updateManagerExtraPreset = (
  presetId: string,
  data: {
    name?: string
    required?: boolean
    minSelect?: number
    maxSelect?: number
    categoryIds?: number[]
  },
  branchId?: string
) =>
  api.patch(`/api/v1/manager/menu/extra-presets/${presetId}`, { ...data, ...withBranch(branchId) })

export const deleteManagerExtraPreset = (presetId: string, branchId?: string) =>
  api.delete(`/api/v1/manager/menu/extra-presets/${presetId}`, { params: withBranch(branchId) })

export const addManagerPresetOption = (
  presetId: string,
  data: { name: string; price: number },
  branchId?: string
) =>
  api.post(`/api/v1/manager/menu/extra-presets/${presetId}/options`, {
    ...data,
    ...withBranch(branchId)
  })

export const updateManagerPresetOption = (
  optionId: string,
  data: { name?: string; price?: number },
  branchId?: string
) =>
  api.patch(`/api/v1/manager/menu/extra-presets/options/${optionId}`, {
    ...data,
    ...withBranch(branchId)
  })

export const deleteManagerPresetOption = (optionId: string, branchId?: string) =>
  api.delete(`/api/v1/manager/menu/extra-presets/options/${optionId}`, {
    params: withBranch(branchId)
  })

export const importManagerDefaultPresets = async (branchId?: string) => {
  const res = await api.post("/api/v1/manager/menu/extra-presets/import-defaults", withBranch(branchId))
  return unwrap(res)
}

export type ManagerOrderItem = {
  id: string
  name: string
  quantity: number
  price: number
  notes?: string | null
  variants: Array<{ name: string; price: number }>
  extras: Array<{ name: string; price: number }>
}

export type ManagerOrder = {
  id: string
  trackingToken: string | null
  status: string
  courierStatus?: string | null
  kitchenStatus?: string | null
  fulfillmentType?: string | null
  customerName?: string | null
  customerPhone?: string | null
  customerEmail?: string | null
  deliveryAddress?: string | null
  postalCode?: string | null
  orderTotal?: number | null
  deliveryFee?: number | null
  discount?: number | null
  giftCardAmount?: number | null
  paymentMethod?: string | null
  paymentStatus?: string | null
  notes?: string | null
  scheduledFor?: string | null
  createdAt: string
  confirmedAt?: string | null
  preparingAt?: string | null
  readyAt?: string | null
  pickedUpAt?: string | null
  deliveredAt?: string | null
  estimatedPrepTime?: number | null
  estimatedTotalTime?: number | null
  isGuest?: boolean | null
  items: ManagerOrderItem[]
  timeline: Array<{ status: string; timestamp: string }>
}

export type ManagerOrdersResult = {
  orders: ManagerOrder[]
  total: number
  limit: number
  offset: number
}

function normalizeManagerOrderItem(
  item: Partial<ManagerOrderItem> & { name?: string; quantity?: number; price?: number }
): ManagerOrderItem {
  return {
    id: item.id ?? "",
    name: item.name ?? "Item",
    quantity: item.quantity ?? 1,
    price: Number(item.price ?? 0),
    notes: item.notes ?? null,
    variants: Array.isArray(item.variants) ? item.variants : [],
    extras: Array.isArray(item.extras) ? item.extras : []
  }
}

function normalizeManagerOrder(order: Partial<ManagerOrder> & { id: string }): ManagerOrder {
  return {
    id: order.id,
    trackingToken: order.trackingToken ?? null,
    status: order.status ?? "unknown",
    courierStatus: order.courierStatus ?? null,
    kitchenStatus: order.kitchenStatus ?? null,
    fulfillmentType: order.fulfillmentType ?? null,
    customerName: order.customerName ?? null,
    customerPhone: order.customerPhone ?? null,
    customerEmail: order.customerEmail ?? null,
    deliveryAddress: order.deliveryAddress ?? null,
    postalCode: order.postalCode ?? null,
    orderTotal: order.orderTotal ?? null,
    deliveryFee: order.deliveryFee ?? null,
    discount: order.discount ?? null,
    giftCardAmount: order.giftCardAmount ?? null,
    paymentMethod: order.paymentMethod ?? null,
    paymentStatus: order.paymentStatus ?? null,
    notes: order.notes ?? null,
    scheduledFor: order.scheduledFor ?? null,
    createdAt: order.createdAt ?? new Date(0).toISOString(),
    confirmedAt: order.confirmedAt ?? null,
    preparingAt: order.preparingAt ?? null,
    readyAt: order.readyAt ?? null,
    pickedUpAt: order.pickedUpAt ?? null,
    deliveredAt: order.deliveredAt ?? null,
    estimatedPrepTime: order.estimatedPrepTime ?? null,
    estimatedTotalTime: order.estimatedTotalTime ?? null,
    isGuest: order.isGuest ?? null,
    items: Array.isArray(order.items) ? order.items.map(normalizeManagerOrderItem) : [],
    timeline: Array.isArray(order.timeline) ? order.timeline : []
  }
}

function normalizeManagerOrdersResult(
  payload: unknown,
  fallbackLimit = 50,
  fallbackOffset = 0
): ManagerOrdersResult {
  if (Array.isArray(payload)) {
    const orders = payload.map((order) => normalizeManagerOrder(order as ManagerOrder))
    return {
      orders,
      total: orders.length,
      limit: fallbackLimit,
      offset: fallbackOffset
    }
  }

  const data = (payload ?? {}) as Partial<ManagerOrdersResult>
  const orders = Array.isArray(data.orders)
    ? data.orders.map((order) => normalizeManagerOrder(order))
    : []

  return {
    orders,
    total: typeof data.total === "number" ? data.total : orders.length,
    limit: typeof data.limit === "number" ? data.limit : fallbackLimit,
    offset: typeof data.offset === "number" ? data.offset : fallbackOffset
  }
}

export const getManagerOrders = async (
  branchId?: string,
  params?: { search?: string; limit?: number; offset?: number }
) => {
  const res = await api.get("/api/v1/manager/orders", {
    params: {
      branchId,
      search: params?.search || undefined,
      limit: params?.limit,
      offset: params?.offset
    }
  })
  return normalizeManagerOrdersResult(unwrap(res), params?.limit ?? 50, params?.offset ?? 0)
}

export const getManagerOrder = async (orderId: string, branchId?: string) => {
  const res = await api.get(`/api/v1/manager/orders/${orderId}`, {
    params: branchId ? { branchId } : {}
  })
  return normalizeManagerOrder(unwrap<ManagerOrder>(res))
}

export type ManagerBranchCustomer = {
  id: string
  branchId: string
  phone: string
  name: string | null
  email: string | null
  birthday: string | null
  orderCount: number
  totalSpent: number
  totalSaved: number
  firstOrderAt: string | null
  lastOrderAt: string | null
  preferredChannel: string | null
  marketingEmail: boolean
  marketingSMS: boolean
  marketingWhatsApp: boolean
}

export type ManagerCustomerStats = {
  total: number
  marketingOptIn: number
  repeatCustomers: number
  totalOrders: number
  totalSpent: number
  totalSaved: number
}

export const getManagerCustomers = async (
  branchId?: string,
  params?: { marketingOnly?: boolean; search?: string }
) => {
  const res = await api.get("/api/v1/manager/customers", {
    params: { branchId, ...params }
  })
  return unwrap<{ customers: ManagerBranchCustomer[]; stats: ManagerCustomerStats }>(res)
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

export type ManagerOrderReview = {
  id: string
  orderId: string
  branchId: string
  foodRating: number
  deliveryRating: number | null
  rating: number | null
  comment: string | null
  createdAt: string
  customerName: string
  customerEmail: string | null
  order: {
    id: string
    customerName: string | null
    fulfillmentType: string | null
    createdAt: string
    status: string
  }
}

export type ManagerReviewsSummary = {
  reviewCount: number
  averageFoodRating: number | null
  averageDeliveryRating: number | null
  averageOverallRating: number | null
  deliveryReviewCount: number
}

export const getManagerReviews = async (
  branchId?: string,
  filters?: { from?: string; to?: string; lowRatingsOnly?: boolean }
) => {
  const res = await api.get("/api/v1/manager/reviews", {
    params: {
      ...(branchId ? { branchId } : {}),
      ...(filters?.from ? { from: filters.from } : {}),
      ...(filters?.to ? { to: filters.to } : {}),
      ...(filters?.lowRatingsOnly ? { lowRatingsOnly: true } : {})
    }
  })
  return unwrap<{ reviews: ManagerOrderReview[]; summary: ManagerReviewsSummary }>(res)
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
