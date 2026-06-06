import api from "./client.js"

export const adminLogin = (data: { email: string; password: string }) =>
  api.post("/api/auth/admin/login", data)
