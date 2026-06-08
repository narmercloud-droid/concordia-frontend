import { detectPreferredLanguage } from "@/i18n/languages"
import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"

let warmupPromise: Promise<void> | null = null

/** Wake Render cold backend and prefetch hot public reads before customer navigation. */
export function warmupApi(): Promise<void> {
  if (warmupPromise) return warmupPromise

  const base = import.meta.env.VITE_API_URL
  if (!base) {
    warmupPromise = Promise.resolve()
    return warmupPromise
  }

  const root = base.replace(/\/$/, "")
  const timeoutMs = 12_000
  const signal = AbortSignal.timeout(timeoutMs)
  const fetchOpts: RequestInit = { method: "GET", credentials: "omit", signal }
  const lang = detectPreferredLanguage()
  const menuUrl = `${root}/api/branches/${KEMPEN_BRANCH_ID}/menu?lang=${lang}`

  warmupPromise = Promise.allSettled([
    fetch(`${root}/health`, fetchOpts),
    fetch(`${root}/api/branches`, fetchOpts),
    fetch(menuUrl, fetchOpts)
  ]).then(() => undefined)

  return warmupPromise
}
