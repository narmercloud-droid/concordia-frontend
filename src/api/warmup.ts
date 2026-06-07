let warmupPromise: Promise<void> | null = null

/** Wake Render / cold backend before critical customer requests. */
export function warmupApi(): Promise<void> {
  if (warmupPromise) return warmupPromise

  const base = import.meta.env.VITE_API_URL
  if (!base) {
    warmupPromise = Promise.resolve()
    return warmupPromise
  }

  const root = base.replace(/\/$/, "")
  const timeoutMs = 25_000

  warmupPromise = Promise.allSettled([
    fetch(`${root}/health`, {
      method: "GET",
      credentials: "omit",
      signal: AbortSignal.timeout(timeoutMs)
    }),
    fetch(`${root}/api/branches`, {
      method: "GET",
      credentials: "omit",
      signal: AbortSignal.timeout(timeoutMs)
    })
  ]).then(() => undefined)

  return warmupPromise
}
