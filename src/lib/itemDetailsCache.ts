const STORAGE_PREFIX = "concordia-item-v1:"
const MAX_AGE_MS = 30 * 60 * 1000

type CachedItem = {
  data: unknown
  ts: number
}

function isFresh(ts: number | undefined) {
  return typeof ts === "number" && Date.now() - ts < MAX_AGE_MS
}

export function itemDetailsCacheKey(branchId: string, itemId: string | number, lang: string) {
  return `${STORAGE_PREFIX}${branchId}:${itemId}:${lang}`
}

export function readItemDetailsCache<T = unknown>(
  branchId: string,
  itemId: string | number,
  lang: string
): T | null {
  if (typeof window === "undefined" || !branchId || !itemId) return null
  try {
    const raw = localStorage.getItem(itemDetailsCacheKey(branchId, itemId, lang))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedItem
    if (!parsed?.data || !isFresh(parsed.ts)) return null
    return parsed.data as T
  } catch {
    return null
  }
}

export function writeItemDetailsCache(
  branchId: string,
  itemId: string | number,
  lang: string,
  data: unknown
) {
  if (typeof window === "undefined" || !branchId || !itemId || data == null) return
  try {
    const payload: CachedItem = { data, ts: Date.now() }
    localStorage.setItem(itemDetailsCacheKey(branchId, itemId, lang), JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

export function clearItemDetailsCacheForBranch(branchId: string) {
  if (typeof window === "undefined" || !branchId) return
  try {
    const prefix = `${STORAGE_PREFIX}${branchId}:`
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) keysToRemove.push(key)
    }
    for (const key of keysToRemove) localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
