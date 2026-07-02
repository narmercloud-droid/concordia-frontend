import { Capacitor } from "@capacitor/core"

const PRODUCTION_API = "https://concordia-backend-eu.onrender.com"

export function isNativeApp() {
  return Capacitor.isNativePlatform()
}

export function nativePlatform() {
  return Capacitor.getPlatform()
}

export function isIosApp() {
  return Capacitor.getPlatform() === "ios"
}

export function isAndroidApp() {
  return Capacitor.getPlatform() === "android"
}

/** API base URL when running inside Capacitor (not same-origin as Vercel). */
export function nativeApiBase() {
  const configured = String(import.meta.env.VITE_API_URL ?? "").trim()
  return configured ? configured.replace(/\/$/, "") : PRODUCTION_API
}

export function nativeSocketUrl() {
  const socketEnv = String(import.meta.env.VITE_SOCKET_URL ?? "").trim()
  if (socketEnv) return socketEnv.replace(/\/$/, "")
  return nativeApiBase()
}
