import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getOrderStatus } from "@/api/customer"
import { socket } from "@/lib/socket"

type CourierLocation = { lat: number; lng: number; updatedAt?: string }

export default function OrderTrackingPage() {
  const { orderId } = useParams()
  const queryClient = useQueryClient()
  const [courierLocation, setCourierLocation] = useState<CourierLocation | null>(null)

  const { data } = useQuery({
    queryKey: ["orderStatus", orderId],
    queryFn: () => getOrderStatus(orderId!),
    enabled: !!orderId,
    refetchInterval: 30000
  })

  const order = data

  useEffect(() => {
    if (order?.courierLocation) {
      setCourierLocation(order.courierLocation)
    }
  }, [order?.courierLocation])

  useEffect(() => {
    if (!order?.trackingToken) return

    socket.connect()
    socket.emit("join_customer_tracking", order.trackingToken)

    const onStatus = (payload: any) => {
      queryClient.invalidateQueries({ queryKey: ["orderStatus", orderId] })
      if (payload?.courierStatus) {
        queryClient.setQueryData(["orderStatus", orderId], (old: any) => ({
          ...old,
          courierStatus: payload.courierStatus,
          status: payload.status ?? old?.status
        }))
      }
    }

    const onLocation = (payload: { lat: number; lng: number }) => {
      setCourierLocation({
        lat: payload.lat,
        lng: payload.lng,
        updatedAt: new Date().toISOString()
      })
    }

    socket.on("order_status", onStatus)
    socket.on("courier_location", onLocation)
    socket.on("tracking_update", (payload: any) => {
      if (payload?.courierLocation) {
        setCourierLocation(payload.courierLocation)
      }
    })

    return () => {
      socket.off("order_status", onStatus)
      socket.off("courier_location", onLocation)
      socket.off("tracking_update")
    }
  }, [order?.trackingToken, orderId, queryClient])

  if (!order) return <p style={{ padding: 16 }}>Loading...</p>

  const mapLat = courierLocation?.lat ?? order.deliveryLat
  const mapLng = courierLocation?.lng ?? order.deliveryLng
  const mapUrl =
    mapLat != null && mapLng != null
      ? `https://maps.google.com/maps?q=${mapLat},${mapLng}&z=15&output=embed`
      : order.deliveryAddress
        ? `https://maps.google.com/maps?q=${encodeURIComponent(order.deliveryAddress)}&z=15&output=embed`
        : null

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16 }}>
      <h2>Order tracking</h2>
      <p>Order #{orderId?.slice(0, 8)}</p>
      <p>
        <strong>Status:</strong> {order.status}
      </p>
      {order.courierStatus && (
        <p>
          <strong>Driver:</strong> {order.courierStatus}
        </p>
      )}
      {order.fulfillmentType && <p>Type: {order.fulfillmentType}</p>}
      {order.scheduledFor && (
        <p>Scheduled for: {new Date(order.scheduledFor).toLocaleString()}</p>
      )}
      {order.etaReadyAt && (
        <p>Ready at: {new Date(order.etaReadyAt).toLocaleString()}</p>
      )}
      {order.estimatedPrepTime && <p>Prep time: {order.estimatedPrepTime} min</p>}

      {order.fulfillmentType === "delivery" && mapUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>Delivery map</h3>
          {courierLocation && order.driverAccepted && (
            <p style={{ fontSize: 14, color: "#2e7d32" }}>
              Driver location live
              {courierLocation.updatedAt &&
                ` — updated ${new Date(courierLocation.updatedAt).toLocaleTimeString()}`}
            </p>
          )}
          {!order.driverAccepted && (
            <p style={{ fontSize: 14, color: "#666" }}>
              Driver has not accepted yet — showing delivery address
            </p>
          )}
          <iframe
            title="Delivery map"
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: 8, marginTop: 8 }}
            loading="lazy"
            src={mapUrl}
          />
        </div>
      )}

      {order.timeline && (
        <div style={{ marginTop: 24 }}>
          <h3>Timeline</h3>
          <ul>
            {order.timeline.map((t: any, idx: number) => (
              <li key={idx}>
                {t.status} — {new Date(t.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
