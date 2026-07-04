import { resolveApiBase } from "@/api/client"
import { detectPreferredLanguage } from "@/i18n/languages"
import { readBranchListCache, writeBranchListCache } from "@/lib/branchListCache"
import { KEMPEN_BRANCH_ID, STRAELEN_BRANCH_ID } from "@/lib/customerPaths"
import { readMenuCache, writeMenuCache } from "@/lib/menuCache"

let warmupPromise: Promise<void> | null = null

function unwrapBranches(body: unknown): unknown[] | null {
  if (!body || typeof body !== "object") return null
  const record = body as { data?: unknown }
  if (Array.isArray(record.data)) return record.data
  if (Array.isArray(body)) return body
  return null
}

function unwrapMenu(body: unknown): { categories: unknown[] } | null {
  if (!body || typeof body !== "object") return null
  const record = body as { data?: { categories?: unknown[] } }
  const categories = record.data?.categories
  if (Array.isArray(categories)) return { categories }
  const direct = body as { categories?: unknown[] }
  if (Array.isArray(direct.categories)) return { categories: direct.categories }
  return null
}

function publicCachesFresh(lang: string, branchIds: string[]) {
  if (!readBranchListCache()) return false
  return branchIds.every((branchId) => !!readMenuCache(branchId, lang))
}

/** Wake Render cold backend and prefetch hot public reads before customer navigation. */
export function warmupApi(): Promise<void> {
  if (warmupPromise) return warmupPromise

  const root = resolveApiBase()
  if (!root && typeof window === "undefined") {
    warmupPromise = Promise.resolve()
    return warmupPromise
  }
  const timeoutMs = 60_000
  const signal = AbortSignal.timeout(timeoutMs)
  const fetchOpts: RequestInit = { method: "GET", credentials: "omit", signal }
  const lang = detectPreferredLanguage()
  const warmBranches = [KEMPEN_BRANCH_ID, STRAELEN_BRANCH_ID]

  if (publicCachesFresh(lang, warmBranches)) {
    warmupPromise = fetch(`${root}/health`, fetchOpts)
      .then(() => undefined)
      .catch(() => undefined)
    return warmupPromise
  }

  warmupPromise = Promise.allSettled([
    fetch(`${root}/health`, fetchOpts),
    fetch(`${root}/api/branches`, fetchOpts).then(async (res) => {
      if (!res.ok) return
      const body = await res.json()
      const rows = unwrapBranches(body)
      if (rows) writeBranchListCache(rows)
    }),
    ...warmBranches.map((branchId) => {
      const menuUrl = `${root}/api/branches/${branchId}/menu?lang=${lang}`
      return fetch(menuUrl, fetchOpts).then(async (res) => {
        if (!res.ok) return
        const body = await res.json()
        const menu = unwrapMenu(body)
        if (menu) writeMenuCache(branchId, lang, menu)
      })
    })
  ]).then(() => undefined)

  return warmupPromise
}
