import React, { useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAssignedOrders,
  acceptOrder,
  declineOrder,
  markPickedUp,
  markDelivered,
  updateCourierLocation
} from "@/api/courierOrders"
import io from "socket.io-client"

const socket = io((import.meta as any).env.VITE_API_URL)

export default function CourierOrdersPage() {
  const queryClient = useQueryClient()

  const { data: orders } = useQuery({
    queryKey: ["courierOrders"],
    queryFn: getAssignedOrders
  })

  const acceptMutation = useMutation({
    mutationFn: acceptOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courierOrders"] })
  })

  const declineMutation = useMutation({
    mutationFn: declineOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courierOrders"] })
  })

  const pickupMutation = useMutation({
    mutationFn: markPickedUp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courierOrders"] })
  })

  const deliveredMutation = useMutation({
    mutationFn: markDelivered,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courierOrders"] })
  })

  useEffect(() => {
    if (!navigator.geolocation) return

    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        updateCourierLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      },
      undefined,
      { enableHighAccuracy: true }
    )

    return () => {
      if (typeof watch === "number") {
        navigator.geolocation.clearWatch(watch)
      }
    }
  }, [])

  useEffect(() => {
    socket.on("order:update", () => {
      queryClient.invalidateQueries({ queryKey: ["courierOrders"] })
    })

    return () => socket.off("order:update")
  }, [queryClient])

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Orders</h2>

      {(orders?.data || []).map((o: any) => (
        <div
          key={o.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 12,
            borderRadius: 8
          }}
        >
          <h3>Order #{o.id}</h3>
          <p>Customer: {o.customerName}</p>
          <p>Status: {o.status}</p>

          {o.status === "assigned" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => acceptMutation.mutate(o.id)}>
                Accept
              </button>
              <button onClick={() => declineMutation.mutate(o.id)}>
                Decline
              </button>
            </div>
          )}

          {o.status === "accepted" && (
            <button onClick={() => pickupMutation.mutate(o.id)}>
              Mark Picked Up
            </button>
          )}

          {o.status === "picked_up" && (
            <button onClick={() => deliveredMutation.mutate(o.id)}>
              Mark Delivered
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
