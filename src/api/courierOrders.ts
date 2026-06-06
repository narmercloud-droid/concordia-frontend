import api from "./client.js"

export const getAssignedOrders = () =>
  api.get("/courier/orders")

export const acceptOrder = (orderId: string) =>
  api.put(`/courier/orders/${orderId}/accept`)

export const declineOrder = (orderId: string) =>
  api.put(`/courier/orders/${orderId}/decline`)

export const markPickedUp = (orderId: string) =>
  api.put(`/courier/orders/${orderId}/picked-up`)

export const markDelivered = (orderId: string) =>
  api.put(`/courier/orders/${orderId}/delivered`)

export const updateCourierLocation = (coords: any) =>
  api.put("/courier/location", coords)
