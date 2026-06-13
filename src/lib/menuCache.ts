const STORAGE_PREFIX = "concordia-menu-v1:"

type CachedMenu = {
  data: { categories: unknown[] }
  ts: number
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
    if (!Array.isArray(parsed?.data?.categories)) return null
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
    return typeof parsed.ts === "number" ? parsed.ts : undefined
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
