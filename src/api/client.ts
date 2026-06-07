import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 45_000
})

api.interceptors.request.use((config) => {
  const url = config.url ?? ""
  const isAdmin =
    url.includes("/api/v1/manager") ||
    url.includes("/api/auth/admin") ||
    url.includes("/api/v1/admin")

  const token = isAdmin
    ? localStorage.getItem("adminToken")
    : localStorage.getItem("accessToken")

  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
