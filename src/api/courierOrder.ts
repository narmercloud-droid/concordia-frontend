import api from "./client.js"

export const resolveOrderByToken = (token: string) =>
  api.get("/api/courier/order", { params: { token } })

export const acceptCourierOrder = (token: string) =>
  api.post("/api/courier/order/accept", { token })

export const updateCourierLocation = (payload: {
  token: string
  lat: number
  lng: number
  accuracy?: number
}) => api.post("/api/courier/location/update", payload)
