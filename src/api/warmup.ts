import { resolveApiBase } from "@/api/client"
import { detectPreferredLanguage } from "@/i18n/languages"
import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"
import { writeBranchListCache } from "@/lib/branchListCache"

let warmupPromise: Promise<void> | null = null

function unwrapBranches(body: unknown): unknown[] | null {
  if (!body || typeof body !== "object") return null
  const record = body as { data?: unknown }
  if (Array.isArray(record.data)) return record.data
  if (Array.isArray(body)) return body
  return null
}

/** Wake Render cold backend and prefetch hot public reads before customer navigation. */
export function warmupApi(): Promise<void> {
  if (warmupPromise) return warmupPromise

  const root = resolveApiBase()
  if (!root && typeof window === "undefined") {
    warmupPromise = Promise.resolve()
    return warmupPromise
  }
  const timeoutMs = 12_000
  const signal = AbortSignal.timeout(timeoutMs)
  const fetchOpts: RequestInit = { method: "GET", credentials: "omit", signal }
  const lang = detectPreferredLanguage()
  const menuUrl = `${root}/api/branches/${KEMPEN_BRANCH_ID}/menu?lang=${lang}`

  warmupPromise = Promise.allSettled([
    fetch(`${root}/health`, fetchOpts),
    fetch(`${root}/api/branches`, fetchOpts).then(async (res) => {
      if (!res.ok) return
      const body = await res.json()
      const rows = unwrapBranches(body)
      if (rows) writeBranchListCache(rows)
    }),
    fetch(menuUrl, fetchOpts)
  ]).then(() => undefined)

  return warmupPromise
}
