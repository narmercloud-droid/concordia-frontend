import React, { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type {
  OrderLocationAnalytics,
  OrderLocationPoint,
  OrderPostalArea
} from "@/api/analytics"
import "./OrderDensityMap.css"

type Props = {
  data: OrderLocationAnalytics
  days: number
  onDaysChange: (days: number) => void
}

function markerRadius(count: number, maxCount: number) {
  const min = 10
  const max = 34
  if (maxCount <= 1) return min + 6
  const t = Math.sqrt(count / maxCount)
  return Math.round(min + t * (max - min))
}

function markerColor(count: number, maxCount: number) {
  const t = maxCount <= 1 ? 0.5 : count / maxCount
  if (t >= 0.7) return "#9e0c24"
  if (t >= 0.4) return "#c8102e"
  if (t >= 0.2) return "#e85d04"
  return "#1b7340"
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(value)
}

export default function OrderDensityMap({ data, days, onDaysChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const layerGroup = useRef<L.LayerGroup | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [selectedPostal, setSelectedPostal] = useState<string | null>(null)

  const maxCount = useMemo(
    () => Math.max(1, ...data.points.map((p) => p.count), ...data.postalAreas.map((p) => p.count)),
    [data.points, data.postalAreas]
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
      zoom: 12,
      scrollWheelZoom: true
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map)

    layerGroup.current = L.layerGroup().addTo(map)
    mapInstance.current = map
    setMapReady(true)

    return () => {
      map.remove()
      mapInstance.current = null
      layerGroup.current = null
      setMapReady(false)
    }
  }, [defaultCenter.lat, defaultCenter.lng])

  useEffect(() => {
    const map = mapInstance.current
    const layers = layerGroup.current
    if (!map || !layers || !mapReady) return

    layers.clearLayers()
    const bounds = L.latLngBounds([])

    for (const branch of data.branches) {
      if (branch.lat == null || branch.lng == null) continue
      const marker = L.circleMarker([branch.lat, branch.lng], {
        radius: 9,
        color: "#145a32",
        weight: 2,
        fillColor: "#1b7340",
        fillOpacity: 0.95
      })
      marker.bindPopup(
        `<strong>${branch.name}</strong><br/>Filiale / Restaurant location`
      )
      layers.addLayer(marker)
      bounds.extend([branch.lat, branch.lng])
    }

    const addPoint = (point: OrderLocationPoint | OrderPostalArea, kind: "point" | "postal") => {
      if (point.lat == null || point.lng == null) return
      const count = point.count
      const isSelected =
        kind === "postal" &&
        selectedPostal != null &&
        "postalCode" in point &&
        point.postalCode === selectedPostal

      const marker = L.circleMarker([point.lat, point.lng], {
        radius: markerRadius(count, maxCount) + (isSelected ? 4 : 0),
        color: isSelected ? "#111827" : markerColor(count, maxCount),
        weight: isSelected ? 3 : 1,
        fillColor: markerColor(count, maxCount),
        fillOpacity: 0.55
      })

      const plz =
        "postalCode" in point && point.postalCode
          ? `<br/>PLZ ${point.postalCode}`
          : ""
      marker.bindPopup(
        `<strong>${count} Bestellung${count === 1 ? "" : "en"}</strong>${plz}<br/>${formatEuro(point.revenue)}`
      )

      if (kind === "postal" && "postalCode" in point) {
        marker.on("click", () => setSelectedPostal(point.postalCode))
      }

      layers.addLayer(marker)
      bounds.extend([point.lat, point.lng])
    }

    for (const point of data.points) addPoint(point, "point")

    // PLZ centroids that don't already sit on a dense point cluster
    for (const area of data.postalAreas) {
      if (area.lat == null || area.lng == null) continue
      const alreadyCovered = data.points.some(
        (p) =>
          Math.abs(p.lat - area.lat!) < 0.004 &&
          Math.abs(p.lng - area.lng!) < 0.004 &&
          p.count >= area.count
      )
      if (!alreadyCovered) addPoint(area, "postal")
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.2), { maxZoom: 14 })
    } else {
      map.setView([defaultCenter.lat, defaultCenter.lng], 12)
    }

    window.setTimeout(() => map.invalidateSize(), 60)
  }, [data, mapReady, maxCount, selectedPostal, defaultCenter.lat, defaultCenter.lng])

  const topAreas = data.postalAreas.slice(0, 12)
  const weakAreas = [...data.postalAreas].filter((a) => a.count <= 2).slice(0, 8)

  return (
    <div className="order-density-map">
      <div className="order-density-map__toolbar">
        <div>
          <h3 className="order-density-map__title">Orders by location</h3>
          <p className="order-density-map__lead">
            Delivery density for the last {data.meta.days} days — use this to see where you already
            win and where marketing can grow presence.
          </p>
        </div>
        <label className="order-density-map__days">
          Period
          <select
            value={days}
            onChange={(e) => onDaysChange(Number(e.target.value))}
          >
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
          <span className="order-density-map__stat-label">With map pin</span>
          <strong>{data.meta.withCoords}</strong>
        </div>
        <div>
          <span className="order-density-map__stat-label">PLZ only</span>
          <strong>{data.meta.postalOnly}</strong>
        </div>
        <div>
          <span className="order-density-map__stat-label">Revenue</span>
          <strong>{formatEuro(data.meta.totalRevenue)}</strong>
        </div>
      </div>

      <div className="order-density-map__layout">
        <div className="order-density-map__canvas" ref={mapRef} />

        <aside className="order-density-map__side">
          <h4>Strongest PLZ areas</h4>
          {topAreas.length === 0 ? (
            <p className="order-density-map__empty">No delivery PLZ data in this period.</p>
          ) : (
            <ul className="order-density-map__list">
              {topAreas.map((area) => (
                <li key={area.postalCode}>
                  <button
                    type="button"
                    className={
                      selectedPostal === area.postalCode
                        ? "order-density-map__plz is-active"
                        : "order-density-map__plz"
                    }
                    onClick={() => {
                      setSelectedPostal(area.postalCode)
                      if (area.lat != null && area.lng != null && mapInstance.current) {
                        mapInstance.current.setView([area.lat, area.lng], 14)
                      }
                    }}
                  >
                    <span className="order-density-map__plz-code">{area.postalCode}</span>
                    <span className="order-density-map__plz-meta">
                      {area.count} orders · {formatEuro(area.revenue)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {weakAreas.length > 0 ? (
            <>
              <h4>Low activity (marketing opportunity)</h4>
              <ul className="order-density-map__list order-density-map__list--muted">
                {weakAreas.map((area) => (
                  <li key={`weak-${area.postalCode}`}>
                    <span className="order-density-map__plz-code">{area.postalCode}</span>
                    <span className="order-density-map__plz-meta">
                      {area.count} order{area.count === 1 ? "" : "s"}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <p className="order-density-map__hint">
            Larger / darker circles = more orders. Green pin = restaurant. Click a PLZ to zoom.
          </p>
        </aside>
      </div>
    </div>
  )
}
