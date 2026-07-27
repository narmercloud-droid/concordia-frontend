import React, { useEffect, useRef } from "react"
import type { CourierMapStop } from "@/lib/courierMaps.js"
import { fitMapBounds, stopsWithCoordinates } from "@/lib/courierMaps.js"
import "leaflet/dist/leaflet.css"

type Props = {
  stops: CourierMapStop[]
  origin?: { lat: number; lng: number; label?: string } | null
}

export default function CourierRouteMap({ stops, origin = null }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import("leaflet").Map | null>(null)

  const mappable = stopsWithCoordinates(stops)
  const stopsKey = stops.map((s) => `${s.orderId}:${s.lat}:${s.lng}`).join("|")
  const originKey = origin ? `${origin.lat},${origin.lng}` : ""

  useEffect(() => {
    if (!containerRef.current || mappable.length === 0) return

    let disposed = false

    void import("leaflet").then((L) => {
      if (disposed || !containerRef.current) return

      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      const bounds = fitMapBounds(stops, origin ?? undefined)
      const map = L.map(containerRef.current, { zoomControl: true })
      mapRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(map)

      if (origin) {
        L.circleMarker([origin.lat, origin.lng], {
          radius: 10,
          color: "#1b7340",
          fillColor: "#1b7340",
          fillOpacity: 0.9,
          weight: 2
        })
          .addTo(map)
          .bindPopup(origin.label ?? "Restaurant")
      }

      mappable.forEach((stop, index) => {
        L.marker([stop.lat!, stop.lng!], {
          icon: L.divIcon({
            className: "courier-map-pin",
            html: `<span>${index + 1}</span>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          })
        })
          .addTo(map)
          .bindPopup(`<strong>${index + 1}. ${stop.label}</strong><br/>${stop.address}`)
      })

      if (bounds) {
        map.fitBounds(
          [
            [bounds.minLat, bounds.minLng],
            [bounds.maxLat, bounds.maxLng]
          ],
          { padding: [36, 36], maxZoom: 14 }
        )
      } else if (mappable[0]) {
        map.setView([mappable[0].lat!, mappable[0].lng!], 14)
      }
    })

    return () => {
      disposed = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [stopsKey, originKey, mappable.length])

  if (mappable.length === 0) {
    return (
      <p className="courier-map__fallback">
        Map preview needs GPS coordinates — use <strong>Open full route</strong> for turn-by-turn
        navigation.
      </p>
    )
  }

  return <div ref={containerRef} className="courier-map" aria-label="Delivery route map" />
}
