import React, { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type {
  OrderLocationAnalytics,
  OrderLocationPoint,
  OrderPostalArea,
  OrderStreetArea
} from "@/api/analytics"
import "./OrderDensityMap.css"

type Props = {
  data: OrderLocationAnalytics
  days: number
  onDaysChange: (days: number) => void
  focusBranchId: string
  onFocusBranchChange: (branchId: string) => void
}

type SideTab = "streets" | "postal" | "rings"

type FocusPreset = {
  id: string
  label: string
  lat: number
  lng: number
  name: string
}

/** Marketing focus: restaurant + surrounding catchment. */
const FOCUS_RADIUS_KM = 30
const RING_KM = [5, 10, 20, 30] as const

const FOCUS_PRESETS: FocusPreset[] = [
  {
    id: "concordia-kempen",
    label: "Kempen",
    lat: 51.37035,
    lng: 6.41059,
    name: "Concordia Kempen"
  },
  {
    id: "concordia-straelen",
    label: "Straelen",
    lat: 51.4412,
    lng: 6.2684,
    name: "Concordia Straelen"
  }
]

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(a))
}

/** Small pins: colour carries intensity, size stays subtle so streets stay readable. */
function markerRadius(count: number, maxCount: number) {
  if (maxCount <= 1) return 3.5
  const t = Math.sqrt(count / maxCount)
  return 2.5 + t * 3.5
}

function markerColor(count: number, maxCount: number) {
  const t = maxCount <= 1 ? 0.45 : count / maxCount
  if (t >= 0.75) return "#7f1d1d"
  if (t >= 0.5) return "#c8102e"
  if (t >= 0.25) return "#ea580c"
  return "#1b7340"
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(value)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function resolveFocus(data: OrderLocationAnalytics, focusBranchId: string) {
  const preset =
    FOCUS_PRESETS.find((p) => p.id === focusBranchId) ?? FOCUS_PRESETS[0]

  const fromData = data.branches.find(
    (b) =>
      (b.id === focusBranchId || new RegExp(preset.label, "i").test(b.name)) &&
      b.lat != null &&
      b.lng != null
  )
  if (fromData?.lat != null && fromData.lng != null) {
    return {
      id: fromData.id,
      lat: fromData.lat,
      lng: fromData.lng,
      name: fromData.name,
      label: preset.label
    }
  }

  return {
    id: preset.id,
    lat: preset.lat,
    lng: preset.lng,
    name: preset.name,
    label: preset.label
  }
}

function withinRadius(
  lat: number | null | undefined,
  lng: number | null | undefined,
  focus: { lat: number; lng: number },
  km: number
) {
  if (lat == null || lng == null) return false
  return haversineKm(focus.lat, focus.lng, lat, lng) <= km
}

export default function OrderDensityMap({
  data,
  days,
  onDaysChange,
  focusBranchId,
  onFocusBranchChange
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const overlayLayer = useRef<L.LayerGroup | null>(null)
  const pinLayer = useRef<L.LayerGroup | null>(null)
  const didFitRef = useRef(false)
  const [mapReady, setMapReady] = useState(false)
  const [sideTab, setSideTab] = useState<SideTab>("streets")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const focus = useMemo(
    () => resolveFocus(data, focusBranchId),
    [data, focusBranchId]
  )

  const pointsInRadius = useMemo(
    () =>
      data.points.filter((p) => withinRadius(p.lat, p.lng, focus, FOCUS_RADIUS_KM)),
    [data.points, focus]
  )

  const maxCount = useMemo(
    () => Math.max(1, ...pointsInRadius.map((p) => p.count)),
    [pointsInRadius]
  )

  const streetAreas = useMemo(
    () =>
      (data.streetAreas ?? []).filter((s) =>
        withinRadius(s.lat, s.lng, focus, FOCUS_RADIUS_KM)
      ),
    [data.streetAreas, focus]
  )

  const postalAreas = useMemo(
    () =>
      data.postalAreas.filter((a) =>
        withinRadius(a.lat, a.lng, focus, FOCUS_RADIUS_KM)
      ),
    [data.postalAreas, focus]
  )

  const radiusStats = useMemo(() => {
    const orderCount = pointsInRadius.reduce((sum, p) => sum + p.count, 0)
    const revenue = pointsInRadius.reduce((sum, p) => sum + p.revenue, 0)
    const streets = new Set(
      pointsInRadius.map((p) => p.street).filter(Boolean) as string[]
    ).size
    return { orderCount, revenue, streets, pins: pointsInRadius.length }
  }, [pointsInRadius])

  const distanceRings = useMemo(() => {
    const bands = RING_KM.map((toKm, i) => {
      const fromKm = i === 0 ? 0 : RING_KM[i - 1]
      return { fromKm, toKm, count: 0, revenue: 0, pins: 0 }
    })

    for (const point of pointsInRadius) {
      const d = haversineKm(focus.lat, focus.lng, point.lat, point.lng)
      const band = bands.find((b) => d > b.fromKm && d <= b.toKm) ?? bands[0]
      if (d === 0) {
        bands[0].count += point.count
        bands[0].revenue += point.revenue
        bands[0].pins += 1
        continue
      }
      band.count += point.count
      band.revenue += point.revenue
      band.pins += 1
    }

    return bands.map((b) => ({
      ...b,
      revenue: Math.round(b.revenue * 100) / 100,
      share:
        radiusStats.orderCount > 0
          ? Math.round((b.count / radiusStats.orderCount) * 100)
          : 0
    }))
  }, [pointsInRadius, focus, radiusStats.orderCount])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      center: [focus.lat, focus.lng],
      zoom: 11,
      scrollWheelZoom: true,
      minZoom: 10,
      maxZoom: 18,
      maxBoundsViscosity: 0.85
    })

    const focusBounds = L.latLng(focus.lat, focus.lng).toBounds(FOCUS_RADIUS_KM * 1000)
    map.setMaxBounds(focusBounds.pad(0.35))

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20
    }).addTo(map)

    overlayLayer.current = L.layerGroup().addTo(map)
    pinLayer.current = L.layerGroup().addTo(map)
    mapInstance.current = map
    setMapReady(true)

    return () => {
      map.remove()
      mapInstance.current = null
      overlayLayer.current = null
      pinLayer.current = null
      didFitRef.current = false
      setMapReady(false)
    }
  }, [focus.lat, focus.lng])

  useEffect(() => {
    didFitRef.current = false
  }, [data, focus.lat, focus.lng])

  useEffect(() => {
    const map = mapInstance.current
    const overlays = overlayLayer.current
    const pins = pinLayer.current
    if (!map || !overlays || !pins || !mapReady) return

    overlays.clearLayers()
    pins.clearLayers()

    for (const km of RING_KM) {
      const ring = L.circle([focus.lat, focus.lng], {
        radius: km * 1000,
        color: km === FOCUS_RADIUS_KM ? "#1a1f1c" : "#94a3b8",
        weight: km === FOCUS_RADIUS_KM ? 1.5 : 1,
        dashArray: km === FOCUS_RADIUS_KM ? undefined : "4 6",
        fill: false,
        interactive: false,
        opacity: km === FOCUS_RADIUS_KM ? 0.55 : 0.35
      })
      overlays.addLayer(ring)
    }

    const focusMarker = L.circleMarker([focus.lat, focus.lng], {
      radius: 7,
      color: "#145a32",
      weight: 2,
      fillColor: "#22c55e",
      fillOpacity: 1
    })
    focusMarker.bindPopup(
      `<strong>${escapeHtml(focus.name)}</strong><br/>Restaurant · map centre`
    )
    pins.addLayer(focusMarker)

    const focusPoint = (point: OrderLocationPoint) => {
      const key = `${point.lat},${point.lng}`
      setSelectedKey(key)
      map.setView([point.lat, point.lng], Math.max(map.getZoom(), 16))
    }

    for (const point of pointsInRadius) {
      const key = `${point.lat},${point.lng}`
      const selected = selectedKey === key
      const dist = haversineKm(focus.lat, focus.lng, point.lat, point.lng)
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: markerRadius(point.count, maxCount) + (selected ? 1.5 : 0),
        color: selected ? "#111827" : "#fff",
        weight: selected ? 2 : 1,
        fillColor: markerColor(point.count, maxCount),
        fillOpacity: 0.9
      })

      const streetLine = point.street
        ? `<br/><strong>${escapeHtml(point.street)}</strong>`
        : ""
      const addressLine = point.sampleAddress
        ? `<br/>${escapeHtml(point.sampleAddress)}`
        : ""
      const plzLine = point.postalCode ? `<br/>PLZ ${escapeHtml(point.postalCode)}` : ""

      marker.bindPopup(
        `<strong>${point.count} Bestellung${point.count === 1 ? "" : "en"}</strong>` +
          streetLine +
          addressLine +
          plzLine +
          `<br/>${formatEuro(point.revenue)}` +
          `<br/><span style="color:#64748b">${dist.toFixed(1)} km from restaurant</span>`
      )
      marker.on("click", () => focusPoint(point))
      pins.addLayer(marker)
    }

    if (!didFitRef.current) {
      const viewBounds = L.latLng(focus.lat, focus.lng).toBounds(FOCUS_RADIUS_KM * 1000)
      map.fitBounds(viewBounds, { padding: [24, 24], animate: false })
      didFitRef.current = true
    }

    window.setTimeout(() => map.invalidateSize(), 60)
  }, [data, mapReady, maxCount, selectedKey, focus, pointsInRadius])

  const hottestStreets = streetAreas.slice(0, 15)
  const quietStreets = streetAreas.filter((s) => s.count === 1).slice(0, 10)
  const topAreas = postalAreas.slice(0, 10)

  const zoomTo = (lat: number | null, lng: number | null, key: string) => {
    setSelectedKey(key)
    if (lat == null || lng == null || !mapInstance.current) return
    mapInstance.current.setView([lat, lng], 16)
  }

  return (
    <div className="order-density-map">
      <div className="order-density-map__toolbar">
        <div>
          <h3 className="order-density-map__title">
            {focus.label} delivery map · {FOCUS_RADIUS_KM} km
          </h3>
          <p className="order-density-map__lead">
            Small pins around {focus.name}. Colour = order intensity (not size). Use distance
            rings and street lists to plan flyers and Meta ads where demand is already strong —
            or still thin.
          </p>
        </div>
        <div className="order-density-map__controls">
          <div className="order-density-map__focus" role="group" aria-label="Restaurant focus">
            {FOCUS_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={
                  focusBranchId === preset.id
                    ? "order-density-map__focus-btn is-active"
                    : "order-density-map__focus-btn"
                }
                onClick={() => onFocusBranchChange(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <label className="order-density-map__days">
            Period
            <select value={days} onChange={(e) => onDaysChange(Number(e.target.value))}>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>12 months</option>
            </select>
          </label>
        </div>
      </div>

      <div className="order-density-map__stats">
        <div>
          <span className="order-density-map__stat-label">Orders ≤ {FOCUS_RADIUS_KM} km</span>
          <strong>{radiusStats.orderCount}</strong>
        </div>
        <div>
          <span className="order-density-map__stat-label">Pins</span>
          <strong>{radiusStats.pins}</strong>
        </div>
        <div>
          <span className="order-density-map__stat-label">Streets</span>
          <strong>{radiusStats.streets}</strong>
        </div>
        <div>
          <span className="order-density-map__stat-label">Revenue</span>
          <strong>{formatEuro(radiusStats.revenue)}</strong>
        </div>
      </div>

      <div className="order-density-map__legend" aria-hidden>
        <span className="order-density-map__legend-label">Intensity</span>
        <span className="order-density-map__swatch" style={{ background: "#1b7340" }} />
        Low
        <span className="order-density-map__swatch" style={{ background: "#ea580c" }} />
        Mid
        <span className="order-density-map__swatch" style={{ background: "#c8102e" }} />
        High
        <span className="order-density-map__swatch" style={{ background: "#7f1d1d" }} />
        Hottest
        <span className="order-density-map__legend-sep" />
        <span className="order-density-map__ring-key" />
        5 / 10 / 20 / 30 km rings
      </div>

      <div className="order-density-map__layout">
        <div className="order-density-map__canvas" ref={mapRef} />

        <aside className="order-density-map__side">
          <div className="order-density-map__tabs order-density-map__tabs--3">
            <button
              type="button"
              className={sideTab === "streets" ? "is-active" : undefined}
              onClick={() => setSideTab("streets")}
            >
              Streets
            </button>
            <button
              type="button"
              className={sideTab === "postal" ? "is-active" : undefined}
              onClick={() => setSideTab("postal")}
            >
              PLZ
            </button>
            <button
              type="button"
              className={sideTab === "rings" ? "is-active" : undefined}
              onClick={() => setSideTab("rings")}
            >
              Distance
            </button>
          </div>

          {sideTab === "streets" ? (
            <>
              <h4>Hottest streets</h4>
              {hottestStreets.length === 0 ? (
                <p className="order-density-map__empty">
                  No street names inside {FOCUS_RADIUS_KM} km yet.
                </p>
              ) : (
                <ul className="order-density-map__list">
                  {hottestStreets.map((area: OrderStreetArea) => {
                    const key = `street:${area.street}:${area.postalCode ?? ""}`
                    const dist =
                      area.lat != null && area.lng != null
                        ? haversineKm(focus.lat, focus.lng, area.lat, area.lng)
                        : null
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          className={
                            selectedKey === key
                              ? "order-density-map__plz is-active"
                              : "order-density-map__plz"
                          }
                          onClick={() => zoomTo(area.lat, area.lng, key)}
                        >
                          <span className="order-density-map__plz-code">{area.street}</span>
                          <span className="order-density-map__plz-meta">
                            {area.postalCode ? `PLZ ${area.postalCode} · ` : ""}
                            {area.count} orders · {formatEuro(area.revenue)}
                            {dist != null ? ` · ${dist.toFixed(1)} km` : ""}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}

              {quietStreets.length > 0 ? (
                <>
                  <h4>Only 1 order (growth targets)</h4>
                  <ul className="order-density-map__list order-density-map__list--muted">
                    {quietStreets.map((area) => (
                      <li key={`quiet-${area.street}-${area.postalCode ?? ""}`}>
                        <button
                          type="button"
                          className="order-density-map__quiet"
                          onClick={() =>
                            zoomTo(
                              area.lat,
                              area.lng,
                              `street:${area.street}:${area.postalCode ?? ""}`
                            )
                          }
                        >
                          <span className="order-density-map__plz-code">{area.street}</span>
                          <span className="order-density-map__plz-meta">
                            {area.postalCode ?? "—"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          ) : null}

          {sideTab === "postal" ? (
            <>
              <h4>Strongest PLZ ≤ {FOCUS_RADIUS_KM} km</h4>
              {topAreas.length === 0 ? (
                <p className="order-density-map__empty">No delivery PLZ data in this radius.</p>
              ) : (
                <ul className="order-density-map__list">
                  {topAreas.map((area: OrderPostalArea) => {
                    const key = `plz:${area.postalCode}`
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          className={
                            selectedKey === key
                              ? "order-density-map__plz is-active"
                              : "order-density-map__plz"
                          }
                          onClick={() => zoomTo(area.lat, area.lng, key)}
                        >
                          <span className="order-density-map__plz-code">{area.postalCode}</span>
                          <span className="order-density-map__plz-meta">
                            {area.count} orders · {formatEuro(area.revenue)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          ) : null}

          {sideTab === "rings" ? (
            <>
              <h4>Orders by distance</h4>
              <p className="order-density-map__empty" style={{ marginTop: 0 }}>
                Where demand sits relative to the restaurant — useful for flyer radius and ad
                geo-targeting.
              </p>
              <ul className="order-density-map__list">
                {distanceRings.map((band) => (
                  <li key={`${band.fromKm}-${band.toKm}`}>
                    <div className="order-density-map__ring-row">
                      <div className="order-density-map__ring-head">
                        <span className="order-density-map__plz-code">
                          {band.fromKm}–{band.toKm} km
                        </span>
                        <span className="order-density-map__ring-share">{band.share}%</span>
                      </div>
                      <div className="order-density-map__ring-bar">
                        <span style={{ width: `${Math.max(band.share, band.count ? 4 : 0)}%` }} />
                      </div>
                      <span className="order-density-map__plz-meta">
                        {band.count} orders · {formatEuro(band.revenue)} · {band.pins} pins
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <p className="order-density-map__hint">
            Map locked to {focus.label} ±{FOCUS_RADIUS_KM} km. Zoom in for street names. Darker
            pin = more orders. Green pin = restaurant.
          </p>
        </aside>
      </div>
    </div>
  )
}
