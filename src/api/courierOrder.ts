import api from "./client.js"

export type CourierOrderView = {
  orderId: string
  status: string
  courierStatus?: string | null
  fulfillmentType?: string | null
  customerName: string
  customerPhone?: string | null
  deliveryAddress?: string | null
  deliveryNotes?: string | null
  deliveryLat?: number | null
  deliveryLng?: number | null
  items: Array<{ name: string; quantity: number; notes?: string | null; price?: number }>
  branch?: {
    name?: string | null
    address?: string | null
    lat?: number | null
    lng?: number | null
  }
  navigationUrl?: string | null
  driverAccepted: boolean
}

function unwrap<T>(res: { data?: { data?: T; success?: boolean } & T }): T {
  if (res.data && "data" in res.data && res.data.data !== undefined) {
    return res.data.data as T
  }
  return res.data as T
}

export const resolveOrderByToken = async (token: string) =>
  unwrap<CourierOrderView>(await api.get("/api/courier/order", { params: { token } }))

export const acceptCourierOrder = async (token: string) =>
  unwrap<CourierOrderView>(await api.post("/api/courier/order/accept", { token }))

export const markCourierPickedUp = async (token: string) =>
  unwrap<CourierOrderView>(await api.post("/api/courier/order/picked-up", { token }))

export const markCourierDelivered = async (token: string) =>
  unwrap<CourierOrderView>(await api.post("/api/courier/order/delivered", { token }))

export const completeCourierOrder = async (token: string) =>
  unwrap<CourierOrderView>(await api.post("/api/courier/order/complete", { token }))

export const updateCourierLocation = (payload: {
  token: string
  lat: number
  lng: number
  accuracy?: number
}) => api.post("/api/courier/location/update", payload)

export const resolveOrdersByTokens = async (tokens: string[]) => {
  const unique = [...new Set(tokens.filter(Boolean))]
  const results = await Promise.allSettled(unique.map((token) => resolveOrderByToken(token)))
  return results
    .map((result, index) => {
      if (result.status !== "fulfilled") return null
      return { token: unique[index], order: result.value }
    })
    .filter(Boolean) as Array<{ token: string; order: CourierOrderView }>
}
