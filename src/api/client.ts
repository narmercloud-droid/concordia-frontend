import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

const isDev = import.meta.env.DEV
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504])
const MAX_GET_RETRIES = 2

type RetryConfig = InternalAxiosRequestConfig & { __retryCount?: number }

/** Same-origin on Vercel (proxied in vercel.json) to avoid CORS when the deploy URL changes. */
function usesSameOriginApi(hostname: string): boolean {
  if (hostname.endsWith(".vercel.app")) return true
  if (hostname === "concordiapizza.de" || hostname.endsWith(".concordiapizza.de")) return true
  if (hostname === "pizzeriaconcordia.de" || hostname.endsWith(".pizzeriaconcordia.de")) return true
  return false
}

export function resolveApiBase(): string {
  if (
    import.meta.env.PROD &&
    typeof window !== "undefined" &&
    usesSameOriginApi(window.location.hostname)
  ) {
    return ""
  }
  const configured = String(import.meta.env.VITE_API_URL ?? "").trim()
  if (configured) return configured.replace(/\/$/, "")
  return isDev ? "http://localhost:4000" : ""
}

export const api = axios.create({
  baseURL: resolveApiBase(),
  withCredentials: true,
  timeout: 60_000,
  headers: {
    Accept: "application/json"
  }
})

api.interceptors.request.use((config) => {
  const url = config.url ?? ""
  const isAdmin =
    url.includes("/api/v1/manager") ||
    url.includes("/api/v1/super-admin") ||
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
