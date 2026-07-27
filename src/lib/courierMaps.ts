export type CourierMapStop = {
  orderId: string
  label: string
  address: string
  lat?: number | null
  lng?: number | null
}

/** Google Maps multi-stop driving directions (Lieferando-style route). */
export function buildRouteNavigationUrl(
  stops: CourierMapStop[],
  originAddress?: string | null
) {
  const addresses = stops.map((s) => s.address.trim()).filter(Boolean)
  if (!addresses.length) return null

  const params = new URLSearchParams({
    api: "1",
    destination: addresses[addresses.length - 1]!,
    travelmode: "driving"
  })

  if (originAddress?.trim()) {
    params.set("origin", originAddress.trim())
  }

  const waypoints = addresses.slice(0, -1)
  if (waypoints.length) {
    params.set("waypoints", waypoints.join("|"))
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function stopsWithCoordinates(stops: CourierMapStop[]) {
  return stops.filter(
    (stop) =>
      stop.lat != null &&
      stop.lng != null &&
      Number.isFinite(stop.lat) &&
      Number.isFinite(stop.lng)
  )
}

export function fitMapBounds(stops: CourierMapStop[], origin?: { lat: number; lng: number }) {
  const points = [
    ...(origin ? [origin] : []),
    ...stopsWithCoordinates(stops).map((s) => ({ lat: s.lat!, lng: s.lng! }))
  ]
  if (!points.length) return null

  const lats = points.map((p) => p.lat)
  const lngs = points.map((p) => p.lng)
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs)
  }
}
