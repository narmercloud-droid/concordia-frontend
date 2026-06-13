import api from "./client.js"

function unwrapList<T>(res: { data?: { data?: T; success?: boolean } & T }): T {
  const body = res.data
  if (body && "data" in body && body.data !== undefined) return body.data as T
  if (Array.isArray(body)) return body as T
  return body as T
}

export const createOrder = (data: any) => api.post("/api/v1/order", data)
export const getOrder = (orderId: string) => api.get(`/api/v1/order/${orderId}`)
export const getMyOrders = async () => {
  const res = await api.get("/api/v1/customers/orders")
  return unwrapList<any[]>(res)
}
