const STORAGE_KEY = "concordia-branches-v1"
const MAX_AGE_MS = 30 * 60_000

type CachedBranches = {
  data: unknown[]
  ts: number
}

export function readBranchListCache(): unknown[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedBranches
    if (!Array.isArray(parsed?.data) || typeof parsed.ts !== "number") return null
    if (Date.now() - parsed.ts > MAX_AGE_MS) return null
    return parsed.data
  } catch {
    return null
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
