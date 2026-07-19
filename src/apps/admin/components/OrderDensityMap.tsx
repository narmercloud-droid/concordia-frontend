import React, { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { OrderLocationAnalytics, OrderLocationPoint } from "@/api/analytics"
import "./OrderDensityMap.css"

type Props = {
  data: OrderLocationAnalytics
  days: number
  onDaysChange: (days: number) => void
}

type SideTab = "streets" | "postal"

function markerRadius(count: number, maxCount: number, zoom: number) {
  const zoomBoost = Math.max(0, zoom - 13) * 0.6
  const min = 7 + zoomBoost
  const max = 22 + zoomBoost * 1.5
  if (maxCount <= 1) return min + 4
  const t = Math.sqrt(count / maxCount)
  return Math.round(min + t * (max - min))
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

export default function OrderDensityMap({ data, days, onDaysChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const heatLayer = useRef<L.LayerGroup | null>(null)
  const pinLayer = useRef<L.LayerGroup | null>(null)
  const didFitRef = useRef(false)
  const [mapReady, setMapReady] = useState(false)
  const [zoom, setZoom] = useState(14)
  const [sideTab, setSideTab] = useState<SideTab>("streets")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const maxCount = useMemo(
    () => Math.max(1, ...data.points.map((p) => p.count)),
    [data.points]
  )

  const defaultCenter = useMemo(() => {
    const branch = data.branches.find((b) => b.lat != null && b.lng != null)
    if (branch?.lat != null && branch.lng != null) {
      return { lat: branch.lat, lng: branch.lng }
    }
    if (data.points[0]) return { lat: data.points[0].lat, lng: data.points[0].lng }
    return { lat: 51.37, lng: 6.41 }
  }, [data.branches, data.points])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      center: [defaultCenter.lat, defaultCenter.lng],
      zoom: 14,
      scrollWheelZoom: true,
      maxZoom: 19
    })

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20
    }).addTo(map)

    heatLayer.current = L.layerGroup().addTo(map)
    pinLayer.current = L.layerGroup().addTo(map)
    mapInstance.current = map
    setZoom(map.getZoom())
    setMapReady(true)

    const onZoom = () => setZoom(map.getZoom())
    map.on("zoomend", onZoom)

    return () => {
      map.off("zoomend", onZoom)
      map.remove()
      mapInstance.current = null
      heatLayer.current = null
      pinLayer.current = null
      didFitRef.current = false
      setMapReady(false)
    }
  }, [defaultCenter.lat, defaultCenter.lng])

  useEffect(() => {
    didFitRef.current = false
  }, [data])

  useEffect(() => {
    const map = mapInstance.current
    const heat = heatLayer.current
    const pins = pinLayer.current
    if (!map || !heat || !pins || !mapReady) return

    heat.clearLayers()
    pins.clearLayers()
    const bounds = L.latLngBounds([])

    for (const branch of data.branches) {
      if (branch.lat == null || branch.lng == null) continue
      const marker = L.circleMarker([branch.lat, branch.lng], {
        radius: 10,
        color: "#145a32",
        weight: 3,
        fillColor: "#22c55e",
        fillOpacity: 1
      })
      marker.bindPopup(
        `<strong>${escapeHtml(branch.name)}</strong><br/>Restaurant`
      )
      pins.addLayer(marker)
      bounds.extend([branch.lat, branch.lng])
    }

    for (const point of data.points) {
      const halo = L.circleMarker([point.lat, point.lng], {
        radius: markerRadius(point.count, maxCount, zoom) * 2.2,
        color: markerColor(point.count, maxCount),
        weight: 0,
        fillColor: markerColor(point.count, maxCount),
        fillOpacity: zoom >= 15 ? 0.12 : 0.22,
        interactive: false
      })
      heat.addLayer(halo)
    }

    const focusPoint = (point: OrderLocationPoint) => {
      const key = `${point.lat},${point.lng}`
      setSelectedKey(key)
      map.setView([point.lat, point.lng], Math.max(map.getZoom(), 17))
    }

    for (const point of data.points) {
      const key = `${point.lat},${point.lng}`
      const selected = selectedKey === key
      const marker = L.circleMarker([point.lat, point.lng], {
        radius: markerRadius(point.count, maxCount, zoom) + (selected ? 3 : 0),
        color: selected ? "#111827" : "#fff",
        weight: selected ? 3 : 1.5,
        fillColor: markerColor(point.count, maxCount),
        fillOpacity: 0.88
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
          `<br/>${formatEuro(point.revenue)}`
      )
      marker.on("click", () => focusPoint(point))

      pins.addLayer(marker)
      bounds.extend([point.lat, point.lng])
    }

    if (!didFitRef.current) {
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.15), { maxZoom: 16 })
      } else {
        map.setView([defaultCenter.lat, defaultCenter.lng], 14)
      }
      didFitRef.current = true
    }

    window.setTimeout(() => map.invalidateSize(), 60)
  }, [data, mapReady, maxCount, selectedKey, zoom, defaultCenter.lat, defaultCenter.lng])

  const topStreets = data.streetAreas ?? []
  const hottestStreets = topStreets.slice(0, 15)
  const quietStreets = topStreets.filter((s) => s.count === 1).slice(0, 10)
  const topAreas = data.postalAreas.slice(0, 10)

  const zoomTo = (lat: number | null, lng: number | null, key: string) => {
    setSelectedKey(key)
    if (lat == null || lng == null || !mapInstance.current) return
    mapInstance.current.setView([lat, lng], 17)
  }

  return (
    <div className="order-density-map">
      <div className="order-density-map__toolbar">
        <div>
          <h3 className="order-density-map__title">Orders by street &amp; neighbourhood</h3>
          <p className="order-density-map__lead">
            Street-level delivery pins for the last {data.meta.days} days. Zoom in to read street
            names — use the lists to decide where flyers / Meta ads should focus.
          </p>
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

      <div className="order-density-map__stats">
        <div>
          <span className="order-density-map__stat-label">Delivery orders</span>
          <strong>{data.meta.deliveryOrders}</strong>
        </div>
        <div>
          <span className="order-density-map__stat-label">Exact pins</span>
          <strong>{data.meta.withCoords}</strong>
        </div>
        <div>
          <span className="order-density-map__stat-label">Streets found</span>
          <strong>{data.meta.withStreet ?? 0}</strong>
        </div>
        <div>
          <span className="order-density-map__stat-label">Revenue</span>
          <strong>{formatEuro(data.meta.totalRevenue)}</strong>
        </div>
      </div>

      <div className="order-density-map__layout">
        <div className="order-density-map__canvas" ref={mapRef} />

        <aside className="order-density-map__side">
          <div className="order-density-map__tabs">
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
          </div>

          {sideTab === "streets" ? (
            <>
              <h4>Hottest streets</h4>
              {hottestStreets.length === 0 ? (
                <p className="order-density-map__empty">
                  No street names yet — need delivery addresses with geocoded pins.
                </p>
              ) : (
                <ul className="order-density-map__list">
                  {hottestStreets.map((area) => {
                    const key = `street:${area.street}:${area.postalCode ?? ""}`
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
                          </span>
                          {area.sampleAddress ? (
                            <span className="order-density-map__plz-address">
                              {area.sampleAddress}
                            </span>
                          ) : null}
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
          ) : (
            <>
              <h4>Strongest PLZ areas</h4>
              {topAreas.length === 0 ? (
                <p className="order-density-map__empty">No delivery PLZ data in this period.</p>
              ) : (
                <ul className="order-density-map__list">
                  {topAreas.map((area) => {
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
          )}

          <p className="order-density-map__hint">
            Zoom in to street level. Darker / larger pins = more orders. Green pin = restaurant.
            Click a street or PLZ to jump there.
          </p>
        </aside>
      </div>
    </div>
  )
}
