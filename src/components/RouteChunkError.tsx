import { useEffect } from "react"
import { isRouteErrorResponse, useRouteError } from "react-router-dom"

const CHUNK_RELOAD_KEY = "concordia:chunk-reload"

function isChunkLoadError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : isRouteErrorResponse(error)
        ? String(error.statusText || error.data || "")
        : String(error ?? "")
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed") ||
    message.includes("error loading dynamically imported module")
  )
}

export default function RouteChunkError() {
  const error = useRouteError()

  useEffect(() => {
    if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1")
      window.location.reload()
    }
  }, [error])

  if (isChunkLoadError(error)) {
    return (
      <div style={{ padding: 32, maxWidth: 520, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: "1.25rem" }}>App wird aktualisiert…</h1>
        <p style={{ color: "#555" }}>
          Eine neue Version wurde gerade veröffentlicht. Die Seite lädt neu.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: 32, maxWidth: 520, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.25rem" }}>Unerwarteter Fehler</h1>
      <p style={{ color: "#555" }}>Bitte Seite neu laden (Strg+Umschalt+R).</p>
    </div>
  )
}
