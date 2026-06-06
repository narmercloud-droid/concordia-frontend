import api from "./client.js"

export const createOrder = (data: any) => api.post("/orders", data)
export const getOrder = (orderId: string) => api.get(`/orders/${orderId}`)
export const getMyOrders = () => api.get("/orders/my")
