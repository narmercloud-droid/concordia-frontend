import { isNativeApp } from "@/lib/nativeApp"

const LAUNCH_AT = new Date(
  import.meta.env.VITE_LAUNCH_DATE ?? "2026-07-01T00:00:00+02:00"
).getTime()

const BYPASS_KEY = "concordia-coming-soon-bypass"
const BYPASS_PARAM = "preview"

function envFlag(name: string): boolean | null {
  const value = import.meta.env[name]
  if (value === "true" || value === "1") return true
  if (value === "false" || value === "0") return false
  return null
}

export function isComingSoonActive(): boolean {
  if (isNativeApp()) return false

  const forced = envFlag("VITE_COMING_SOON")
  if (forced === false) return false
  if (forced === true) return true
  return Date.now() < LAUNCH_AT
}

export function hasComingSoonBypass(): boolean {
  if (typeof window === "undefined") return false

  const secret = String(import.meta.env.VITE_COMING_SOON_BYPASS ?? "").trim()
  if (!secret) return false

  try {
    if (sessionStorage.getItem(BYPASS_KEY) === secret) return true
  } catch {
    return false
  }

  const params = new URLSearchParams(window.location.search)
  const token = params.get(BYPASS_PARAM)?.trim()
  if (token && token === secret) {
    try {
      sessionStorage.setItem(BYPASS_KEY, secret)
    } catch {
      // ignore storage failures
    }
    return true
  }

  return false
}

export function getLaunchDate(): Date {
  return new Date(LAUNCH_AT)
}
