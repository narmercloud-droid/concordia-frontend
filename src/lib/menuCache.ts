const STORAGE_PREFIX = "concordia-menu-v1:"
/** Serve cached menus instantly on repeat visits; refetch when stale. */
const MAX_AGE_MS = 15 * 60 * 1000

type CachedMenu = {
  data: { categories: unknown[] }
  ts: number
}

function isFresh(ts: number | undefined) {
  return typeof ts === "number" && Date.now() - ts < MAX_AGE_MS
}

export function menuCacheStorageKey(branchId: string, lang: string) {
  return `${STORAGE_PREFIX}${branchId}:${lang}`
}

export function readMenuCache(
  branchId: string,
  lang: string
): { categories: unknown[] } | null {
  if (typeof window === "undefined" || !branchId) return null
  try {
    const raw = localStorage.getItem(menuCacheStorageKey(branchId, lang))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedMenu
    if (!Array.isArray(parsed?.data?.categories) || !isFresh(parsed.ts)) return null
    return parsed.data
  } catch {
    return null
  }
}

export function readMenuCacheUpdatedAt(branchId: string, lang: string): number | undefined {
  if (typeof window === "undefined" || !branchId) return undefined
  try {
    const raw = localStorage.getItem(menuCacheStorageKey(branchId, lang))
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as CachedMenu
    return isFresh(parsed.ts) ? parsed.ts : undefined
  } catch {
    return undefined
  }
}

export function writeMenuCache(
  branchId: string,
  lang: string,
  data: { categories: unknown[] }
) {
  if (typeof window === "undefined" || !branchId || !Array.isArray(data?.categories)) return
  try {
    const payload: CachedMenu = { data, ts: Date.now() }
    localStorage.setItem(menuCacheStorageKey(branchId, lang), JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

export function clearMenuCacheForBranch(branchId: string) {
  if (typeof window === "undefined" || !branchId) return
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key?.startsWith(`${STORAGE_PREFIX}${branchId}:`)) {
        keysToRemove.push(key)
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key)
    }
  } catch {
    // ignore
  }
}
