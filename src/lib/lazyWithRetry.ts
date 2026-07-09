import { lazy, type ComponentType, type LazyExoticComponent } from "react"

const CHUNK_RELOAD_KEY = "concordia:chunk-reload"

function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "")
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed") ||
    message.includes("error loading dynamically imported module")
  )
}

/**
 * Lazy-load a route chunk and auto-reload once when a stale deploy hash 404s.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const module = await importer()
      sessionStorage.removeItem(CHUNK_RELOAD_KEY)
      return module
    } catch (error) {
      if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, "1")
        window.location.reload()
        return new Promise(() => {
          // Page is reloading — never resolve this import.
        })
      }
      throw error
    }
  })
}
