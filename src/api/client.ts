import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

const isDev = import.meta.env.DEV
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504])
const MAX_GET_RETRIES = 2

type RetryConfig = InternalAxiosRequestConfig & { __retryCount?: number }

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
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined
    const status = error.response?.status
    const method = (config?.method ?? "get").toLowerCase()
    const retryCount = config?.__retryCount ?? 0
    const canRetry =
      !!config &&
      method === "get" &&
      retryCount < MAX_GET_RETRIES &&
      (!error.response || RETRYABLE_STATUS.has(status ?? 0))

    if (canRetry && config) {
      config.__retryCount = retryCount + 1
      const delayMs = Math.min(1000 * 2 ** retryCount, 8000)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      return api(config)
    }

    if (isDev) {
      const url = config?.url
      console.warn("[api]", status ?? "network", url ?? "unknown", error.message)
    }
    return Promise.reject(error)
  }
)

export default api
