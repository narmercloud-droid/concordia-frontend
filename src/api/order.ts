import api from "./client.js"

export const createOrder = (data: any) => api.post("/api/v1/order", data)
export const getOrder = (orderId: string) => api.get(`/api/v1/order/${orderId}`)
export const getMyOrders = () => api.get("/api/v1/customers/orders")
