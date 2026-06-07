import axios from "axios"

const isDev = import.meta.env.DEV

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 45_000,
  headers: {
    Accept: "application/json"
  }
})

api.interceptors.request.use((config) => {
  const url = config.url ?? ""
  const isAdmin =
    url.includes("/api/v1/manager") ||
    url.includes("/api/auth/admin") ||
    url.includes("/api/v1/admin") ||
    url.includes("/api/admin/")

  const token = isAdmin
    ? localStorage.getItem("adminToken")
    : localStorage.getItem("accessToken")

  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isDev) {
      const status = error?.response?.status
      const url = error?.config?.url
      console.warn("[api]", status ?? "network", url ?? "unknown", error?.message)
    }
    return Promise.reject(error)
  }
)

export default api
