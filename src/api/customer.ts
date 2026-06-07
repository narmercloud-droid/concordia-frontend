import api from "./client.js"

function unwrap<T>(res: { data?: { data?: T; success?: boolean } & T }): T {
  if (res.data && "data" in res.data && res.data.data !== undefined) {
    return res.data.data as T
  }
  return res.data as T
}

export const getBranches = async () => {
  const res = await api.get("/api/branches")
  return unwrap<any[]>(res)
}

export const getBranchMenu = async (branchId: string) => {
  const res = await api.get(`/api/branches/${branchId}/menu`)
  return unwrap<{ categories: any[] }>(res)
}

export const getBranchBestsellers = async (branchId: string, limit = 6) => {
  const res = await api.get(`/api/branches/${branchId}/bestsellers`, { params: { limit } })
  return unwrap<{
    periodDays: number
    hasSalesData: boolean
    itemIds: number[]
    items: Array<{
      id: number
      itemNumber?: string | null
      name: string
      description?: string | null
      price: number
      imageUrl?: string | null
    }>
  }>(res)
}

export const getAlsoPopular = async (branchId: string, itemId: number) => {
  const res = await api.get(`/api/branches/${branchId}/items/${itemId}/also-popular`)
  return unwrap<{
    items: Array<{
      id: number
      itemNumber?: string | null
      name: string
      description?: string | null
      price: number
      imageUrl?: string | null
    }>
  }>(res)
}

export const getBranchTimeSlots = async (branchId: string) => {
  const res = await api.get(`/api/branches/${branchId}/time-slots`)
  return unwrap<{ slots: Array<{ label: string; value: string }> }>(res)
}

export const getItemDetails = async (branchId: string, itemId: string) => {
  const res = await api.get(`/api/branches/${branchId}/items/${itemId}`)
  return unwrap<any>(res)
}

export const createOrder = (data: {
  branchId: string
  items: Array<{
    id: number
    quantity: number
    unitPrice: number
    name?: string
    variants?: Array<{ id: string; name: string; price: number }>
    addOns?: Array<{ id: string; name: string; price: number }>
    notes?: string
  }>
  customerName: string
  customerPhone: string
  fulfillmentType: "pickup" | "delivery"
  deliveryAddress?: string
  scheduledFor?: string | null
  paymentMethod?: string
  promoCode?: string
  notes?: string
}) =>
  api
    .post("/orders", {
      branchId: data.branchId,
      isGuest: true,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      fulfillmentType: data.fulfillmentType,
      deliveryAddress: data.fulfillmentType === "delivery" ? data.deliveryAddress : undefined,
      scheduledFor: data.scheduledFor ?? undefined,
      paymentMethod: data.paymentMethod ?? "cash",
      paymentStatus: "pending",
      promoCode: data.promoCode,
      notes: data.notes,
      items: data.items.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
        price: item.unitPrice,
        notes: item.notes,
        variants: item.variants,
        addOns: item.addOns,
        variantId: item.variants?.[0]?.id,
        addOnIds: item.addOns?.map((a) => a.id) ?? []
      }))
    })
    .then((res) => unwrap<any>(res))

export const getOrderStatus = async (orderId: string) => {
  const res = await api.get(`/orders/${orderId}/status`)
  return unwrap<any>(res)
}

export const getOrderHistory = async (customerId: string) => {
  const res = await api.get(`/customers/${customerId}/orders`)
  return unwrap<any[]>(res)
}

export const getBranchDeliveryAreas = async (branchId: string) => {
  const res = await api.get(`/api/branches/${branchId}/delivery-areas`)
  return unwrap<{
    areas: Array<{
      postalCode: string
      city?: string
      minimumOrder: number
      deliveryFee: number
    }>
  }>(res)
}

export const suggestAddresses = async (
  branchId: string,
  query: string,
  postalCode?: string
) => {
  const res = await api.get(`/api/branches/${branchId}/address-suggest`, {
    params: { q: query, postalCode }
  })
  return unwrap<{
    suggestions: Array<{
      label: string
      street: string
      postalCode: string
      city: string
      lat: number
      lng: number
    }>
  }>(res)
}

export const validatePromoCode = async (code: string, orderTotal: number) => {
  const res = await api.post("/api/promo/validate", { code, orderTotal })
  return unwrap<{
    code: string
    type: string
    discountAmount: number
    promoCodeId: string
  }>(res)
}

export const getDeliveryQuote = async (
  branchId: string,
  address: string,
  orderTotal: number,
  postalCode?: string
) => {
  const res = await api.post(`/api/branches/${branchId}/delivery-quote`, {
    address,
    orderTotal,
    postalCode
  })
  return unwrap<{
    allowed: boolean
    deliveryFee: number
    freeDelivery: boolean
    minimumOrder?: number
    message?: string
    method?: string
    distanceKm?: number
  }>(res)
}
