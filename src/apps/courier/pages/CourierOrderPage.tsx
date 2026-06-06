import React, { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  resolveOrderByToken,
  acceptCourierOrder,
  updateCourierLocation
} from "@/api/courierOrder"
import { socket } from "@/lib/socket"

export default function CourierOrderPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get("token") || ""
  const [geoError, setGeoError] = useState<string | null>(null)
  const [tracking, setTracking] = useState(false)

  const { data: orderRes, isError, isLoading } = useQuery({
    queryKey: ["courierOrder", token],
    queryFn: () => resolveOrderByToken(token),
    enabled: !!token
  })

  const order = orderRes?.data?.data

  const acceptMutation = useMutation({
    mutationFn: () => acceptCourierOrder(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courierOrder", token] })
      setTracking(true)
    }
  })

  useEffect(() => {
    if (!token) {
      navigate("/courier/scan")
    }
  }, [navigate, token])

  useEffect(() => {
    if (!token) return

    socket.connect()
    socket.emit("join_courier_order", token)

    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["courierOrder", token] })
    }

    socket.on("order_status", refresh)
    socket.on("tracking_update", refresh)

    return () => {
      socket.off("order_status", refresh)
      socket.off("tracking_update", refresh)
    }
  }, [queryClient, token])

  useEffect(() => {
    if (!tracking || !token || !navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        updateCourierLocation({
          token,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }).catch(() => {
          setGeoError("Could not send location to server")
        })
      },
      (err) => setGeoError(err.message || "Location unavailable"),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [tracking, token])

  useEffect(() => {
    if (order?.driverAccepted) {
      setTracking(true)
    }
  }, [order?.driverAccepted])

  if (!token) return null
  if (isLoading) return <p style={{ padding: 20 }}>Loading order...</p>
  if (isError || !order) {
    return <p style={{ padding: 20 }}>Invalid or expired driver link.</p>
  }

  const statusLabel = order.courierStatus ?? order.status

  return (
    <div style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
      <h2>Delivery order</h2>
      <p style={{ color: "#666" }}>Order #{order.orderId.slice(0, 8)}</p>

      <section style={{ marginTop: 20 }}>
        <h3>Customer</h3>
        <p>{order.customerName}</p>
        {order.customerPhone && <p>{order.customerPhone}</p>}
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Deliver to</h3>
        <p>{order.deliveryAddress}</p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Items</h3>
        <ul>
          {order.items.map((item: any, idx: number) => (
            <li key={idx}>
              {item.name} × {item.quantity}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Status</h3>
        <p>{statusLabel}</p>
      </section>

      {!order.driverAccepted && (
        <button
          style={{ marginTop: 20, width: "100%", padding: 14, fontSize: 16 }}
          onClick={() => acceptMutation.mutate()}
          disabled={acceptMutation.isPending}
        >
          {acceptMutation.isPending ? "Accepting..." : "Accept delivery"}
        </button>
      )}

      {order.driverAccepted && order.navigationUrl && (
        <a
          href={order.navigationUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block",
            marginTop: 16,
            padding: 14,
            textAlign: "center",
            background: "#1a73e8",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 8
          }}
        >
          Open navigation
        </a>
      )}

      {order.driverAccepted && (
        <p style={{ marginTop: 16, color: tracking ? "#2e7d32" : "#666" }}>
          {tracking
            ? "GPS tracking active — customer can see your location."
            : "Starting GPS..."}
        </p>
      )}

      {geoError && (
        <p style={{ marginTop: 12, color: "#c62828" }}>{geoError}</p>
      )}
    </div>
  )
}
