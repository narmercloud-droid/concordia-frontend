/** Great-circle distance in km between two WGS84 points. */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Destination point from start, bearing (deg), distance (km). */
export function destinationPoint(
  lat: number,
  lng: number,
  bearingDeg: number,
  distanceKm: number
): { lat: number; lng: number } {
  const toRad = (value: number) => (value * Math.PI) / 180
  const toDeg = (value: number) => (value * 180) / Math.PI
  const angular = distanceKm / 6371
  const bearing = toRad(bearingDeg)
  const lat1 = toRad(lat)
  const lng1 = toRad(lng)

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) +
      Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing)
  )
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2)
    )

  return { lat: toDeg(lat2), lng: toDeg(lng2) }
}

export const ZONE_COLORS = ["#2563eb", "#16a34a", "#ea580c", "#9333ea", "#dc2626"]

/** LatLng bounds [[southWest], [northEast]] for a circle without needing a Leaflet map. */
export function boundsForRadiusKm(
  lat: number,
  lng: number,
  radiusKm: number
): [[number, number], [number, number]] {
  const north = destinationPoint(lat, lng, 0, radiusKm)
  const south = destinationPoint(lat, lng, 180, radiusKm)
  const east = destinationPoint(lat, lng, 90, radiusKm)
  const west = destinationPoint(lat, lng, 270, radiusKm)
  return [
    [south.lat, west.lng],
    [north.lat, east.lng]
  ]
}
