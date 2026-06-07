let warmupPromise: Promise<void> | null = null

/** Wake Render / cold backend before critical customer requests. */
export function warmupApi(): Promise<void> {
  if (warmupPromise) return warmupPromise

  const base = import.meta.env.VITE_API_URL
  if (!base) {
    warmupPromise = Promise.resolve()
    return warmupPromise
  }

  warmupPromise = fetch(`${base.replace(/\/$/, "")}/health`, {
    method: "GET",
    credentials: "omit",
    signal: AbortSignal.timeout(12_000)
  })
    .then(() => undefined)
    .catch(() => undefined)

  return warmupPromise
}
