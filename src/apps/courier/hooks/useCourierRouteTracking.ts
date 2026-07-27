import { useEffect, useRef, useState } from "react"
import { updateCourierLocation } from "@/api/courierOrder"
import { activeCourierTokens } from "@/lib/courierRoute"

/** Share GPS with every accepted order in the driver's active route. */
export function useCourierRouteTracking(enabled: boolean) {
  const [geoError, setGeoError] = useState<string | null>(null)
  const [tracking, setTracking] = useState(false)
  const lastSentRef = useRef(0)

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now()
        if (now - lastSentRef.current < 4000) return
        lastSentRef.current = now

        const tokens = activeCourierTokens()
        if (!tokens.length) return

        setTracking(true)
        setGeoError(null)

        void Promise.allSettled(
          tokens.map((token) =>
            updateCourierLocation({
              token,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            })
          )
        ).then((results) => {
          const failed = results.every((r) => r.status === "rejected")
          if (failed) setGeoError("Could not send location to server")
        })
      },
      (err) => setGeoError(err.message || "Location unavailable"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [enabled])

  return { tracking, geoError }
}
