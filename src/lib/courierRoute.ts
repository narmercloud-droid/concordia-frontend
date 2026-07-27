const ROUTE_KEY = "concordia-courier-route-v1"

export type CourierRouteEntry = {
  token: string
  addedAt: string
}

export function parseCourierToken(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    const fromQuery = url.searchParams.get("token")
    if (fromQuery) return fromQuery.trim()
    const parts = url.pathname.split("/").filter(Boolean)
    const last = parts[parts.length - 1]
    if (last && last.length >= 16) return last
  } catch {
    // Raw token string
  }

  return trimmed.length >= 16 ? trimmed : null
}

export function loadCourierRoute(): CourierRouteEntry[] {
  try {
    const raw = localStorage.getItem(ROUTE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as { tokens?: CourierRouteEntry[] }
    return Array.isArray(parsed.tokens) ? parsed.tokens : []
  } catch {
    return []
  }
}

function saveCourierRoute(tokens: CourierRouteEntry[]) {
  localStorage.setItem(
    ROUTE_KEY,
    JSON.stringify({ tokens, updatedAt: new Date().toISOString() })
  )
}

export function addCourierRouteToken(token: string): { added: boolean; reason?: "duplicate" } {
  const normalized = parseCourierToken(token)
  if (!normalized) return { added: false }

  const route = loadCourierRoute()
  if (route.some((entry) => entry.token === normalized)) {
    return { added: false, reason: "duplicate" }
  }

  route.unshift({ token: normalized, addedAt: new Date().toISOString() })
  saveCourierRoute(route)
  return { added: true }
}

export function removeCourierRouteToken(token: string) {
  const normalized = parseCourierToken(token) ?? token
  saveCourierRoute(loadCourierRoute().filter((entry) => entry.token !== normalized))
}

export function clearCourierRoute() {
  localStorage.removeItem(ROUTE_KEY)
}

export function activeCourierTokens(): string[] {
  return loadCourierRoute().map((entry) => entry.token)
}
