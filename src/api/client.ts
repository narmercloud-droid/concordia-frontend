import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { isNativeApp, nativeApiBase, nativeSocketUrl } from "@/lib/nativeApp.js"

const isDev = import.meta.env.DEV
/** Socket.IO and native apps hit the API host directly (Vercel only proxies HTTP /api). */
const PRODUCTION_API_HOST = "https://api.concordiapizza.de"
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
  if (isNativeApp()) {
    return nativeApiBase()
  }

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

/** Socket.IO must hit the backend directly — Vercel rewrites HTTP /api only. */
export function resolveSocketUrl(): string {
  if (isNativeApp()) {
    return nativeSocketUrl()
  }

  const socketEnv = String(import.meta.env.VITE_SOCKET_URL ?? "").trim()
  if (socketEnv) return socketEnv.replace(/\/$/, "")

  const apiEnv = String(import.meta.env.VITE_API_URL ?? "").trim()
  if (apiEnv) return apiEnv.replace(/\/$/, "")

  const apiBase = resolveApiBase()
  if (apiBase) return apiBase

  if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost") return "http://localhost:4000"
    if (usesSameOriginApi(window.location.hostname)) return PRODUCTION_API_HOST
    return window.location.origin
  }
  return "http://localhost:4000"
}

export const api = axios.create({
  baseURL: resolveApiBase(),
  withCredentials: !isNativeApp(),
  timeout: 60_000,
  headers: {
    Accept: "application/json"
  }
})

api.interceptors.request.use((config) => {
  config.baseURL = resolveApiBase()

  if (isNativeApp()) {
    config.headers = config.headers ?? {}
    config.headers["X-Concordia-Channel"] = "mobile-app"
  }

  const url = config.url ?? ""
  const isAdmin =
    url.includes("/api/v1/manager") ||
    url.includes("/api/v1/super-admin") ||
    url.includes("/api/auth/admin") ||
    url.includes("/api/v1/admin") ||
    url.includes("/api/admin/") ||
    url.includes("/api/payments/branches")

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
