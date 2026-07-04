import React, { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import {
  boundsForRadiusKm,
  destinationPoint,
  haversineDistanceKm,
  ZONE_COLORS
} from "@/utils/geo"
import "./DeliveryRadiusMap.css"

export type RadiusZoneMap = {
  maxDistanceKm: number
  minimumOrder: number
  deliveryFee: number
  freeDeliveryMinimum?: number
  label?: string
}

type Props = {
  center: { lat: number; lng: number }
  branchLabel?: string
  zones: RadiusZoneMap[]
  selectedIndex: number | null
  canEdit?: boolean
  onSelectZone: (index: number) => void
  onZoneRadiusChange: (index: number, maxDistanceKm: number) => void
}

function zoneLabel(zone: RadiusZoneMap, index: number) {
  return zone.label?.trim() || `Zone ${index + 1} · ${zone.maxDistanceKm} km`
}

function sortZones(zones: RadiusZoneMap[]) {
  return [...zones]
    .map((zone, index) => ({ zone, index }))
    .sort((a, b) => a.zone.maxDistanceKm - b.zone.maxDistanceKm)
}

export default function DeliveryRadiusMap({
  center,
  branchLabel,
  zones,
  selectedIndex,
  canEdit = true,
  onSelectZone,
  onZoneRadiusChange
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const layerGroup = useRef<L.LayerGroup | null>(null)
  const lastFitKey = useRef("")
  const [mapReady, setMapReady] = useState(false)

  const sorted = useMemo(() => sortZones(zones), [zones])
  const maxRadiusKm = Math.max(5, ...zones.map((z) => z.maxDistanceKm), 1)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView([center.lat, center.lng], 12)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
  }, [center.lat, center.lng])

  useEffect(() => {
    const map = mapInstance.current
    const group = layerGroup.current
    if (!map || !group || !mapReady) return

    group.clearLayers()

    const restaurantIcon = L.divIcon({
      className: "",
      html: `<div class="delivery-radius-map__restaurant-icon" title="${branchLabel ?? "Restaurant"}">📍</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    })

    L.marker([center.lat, center.lng], {
      icon: restaurantIcon,
      draggable: false,
      zIndexOffset: 1000
    })
      .bindTooltip(branchLabel ?? "Restaurant", { direction: "top", offset: [0, -8] })
      .addTo(group)

    sorted.forEach(({ zone, index }, sortedIdx) => {
      const color = ZONE_COLORS[sortedIdx % ZONE_COLORS.length]
      const isSelected = selectedIndex === index
      const radiusM = Math.max(zone.maxDistanceKm, 0.5) * 1000

      const circle = L.circle([center.lat, center.lng], {
        radius: radiusM,
        color,
        weight: isSelected ? 3 : 2,
        fillColor: color,
        fillOpacity: isSelected ? 0.16 : 0.1,
        dashArray: isSelected ? undefined : "4 6"
      })
        .bindTooltip(zoneLabel(zone, index), { sticky: true })
        .addTo(group)

      circle.on("click", () => onSelectZone(index))

      if (canEdit) {
        const handlePoint = destinationPoint(center.lat, center.lng, 90, zone.maxDistanceKm)
        const handleIcon = L.divIcon({
          className: "",
          html: `<div class="delivery-radius-map__handle-icon" style="background:${color}"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        })

        const handle = L.marker([handlePoint.lat, handlePoint.lng], {
          icon: handleIcon,
          draggable: canEdit,
          zIndexOffset: 500 + sortedIdx
        }).addTo(group)

        handle.on("drag", () => {
          const pos = handle.getLatLng()
          const km =
            Math.round(haversineDistanceKm(center.lat, center.lng, pos.lat, pos.lng) * 10) / 10
          const clamped = Math.min(Math.max(km, 0.5), 50)
          circle.setRadius(clamped * 1000)
        })

        handle.on("dragend", () => {
          const pos = handle.getLatLng()
          const km =
            Math.round(haversineDistanceKm(center.lat, center.lng, pos.lat, pos.lng) * 10) / 10
          const clamped = Math.min(Math.max(km, 0.5), 50)
          onZoneRadiusChange(index, clamped)
        })

        handle.on("click", () => onSelectZone(index))
      }
    })

    const fitKey = `${center.lat},${center.lng},${zones.length},${maxRadiusKm}`
    if (lastFitKey.current !== fitKey) {
      lastFitKey.current = fitKey
      const bounds = boundsForRadiusKm(center.lat, center.lng, maxRadiusKm * 1.15)
      map.whenReady(() => {
        map.invalidateSize()
        map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 })
      })
    }
  }, [
    branchLabel,
    canEdit,
    center.lat,
    center.lng,
    mapReady,
    maxRadiusKm,
    onSelectZone,
    onZoneRadiusChange,
    selectedIndex,
    sorted,
    zones
  ])

  const activeIndex = selectedIndex ?? sorted[sorted.length - 1]?.index ?? 0
  const activeZone = zones[activeIndex]

  return (
    <div className="delivery-radius-map">
      <div className="delivery-radius-map__header">
        <div>
          <h5 className="delivery-radius-map__title">Delivery area map</h5>
          <p className="delivery-radius-map__hint">
            Drag a coloured handle on the circle edge to change radius, or use the slider below.
            Each ring shows how far you deliver from the restaurant.
          </p>
        </div>
      </div>

      <div ref={mapRef} className="delivery-radius-map__canvas" />

      <div className="delivery-radius-map__legend">
        {sorted.map(({ zone, index }, sortedIdx) => {
          const color = ZONE_COLORS[sortedIdx % ZONE_COLORS.length]
          const active = activeIndex === index
          return (
            <button
              key={`${index}-${zone.maxDistanceKm}`}
              type="button"
              className={`delivery-radius-map__chip${active ? " delivery-radius-map__chip--active" : ""}`}
              onClick={() => onSelectZone(index)}
            >
              <span className="delivery-radius-map__chip-dot" style={{ background: color }} />
              {zoneLabel(zone, index)}
            </button>
          )
        })}
      </div>

      {canEdit && activeZone ? (
        <div className="delivery-radius-map__slider">
          <label>
            <span>
              Adjust <strong>{zoneLabel(activeZone, activeIndex)}</strong>:{" "}
              {activeZone.maxDistanceKm.toFixed(1)} km
            </span>
            <input
              type="range"
              min={0.5}
              max={30}
              step={0.5}
              value={activeZone.maxDistanceKm}
              onChange={(e) => onZoneRadiusChange(activeIndex, Number(e.target.value))}
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}
