import api from "./client.js"

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data)

export const refreshToken = () => api.post("/auth/refresh")

export const logout = () => api.post("/auth/logout")
