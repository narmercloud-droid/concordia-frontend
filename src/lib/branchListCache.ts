const STORAGE_KEY = "concordia-branches-v1"
/** Max age for offline bootstrap — admin changes must not linger in localStorage. */
const MAX_AGE_MS = 5 * 60 * 1000

type CachedBranches = {
  data: unknown[]
  ts: number
}

function isFresh(ts: number | undefined) {
  return typeof ts === "number" && Date.now() - ts < MAX_AGE_MS
}

export function readBranchListCache(): unknown[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedBranches
    if (!Array.isArray(parsed?.data) || !isFresh(parsed.ts)) return null
    return parsed.data
  } catch {
    return null
  }
}

export function readBranchListCacheUpdatedAt(): number | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as CachedBranches
    return isFresh(parsed.ts) ? parsed.ts : undefined
  } catch {
    return undefined
  }
}

export function writeBranchListCache(data: unknown[]) {
  if (typeof window === "undefined" || !Array.isArray(data)) return
  try {
    const payload: CachedBranches = { data, ts: Date.now() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / private mode
  }
}

export function clearBranchListCache() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
