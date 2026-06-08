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

  warmupPromise = Promise.allSettled([
    fetch(`${root}/health`, fetchOpts),
    fetch(`${root}/api/branches`, fetchOpts)
  ]).then(() => undefined)

  return warmupPromise
}
