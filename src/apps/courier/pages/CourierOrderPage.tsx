import React, { useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  resolveOrderByToken,
  acceptCourierOrder,
  markCourierDelivered,
  markCourierPickedUp
} from "@/api/courierOrder"
import { addCourierRouteToken, removeCourierRouteToken } from "@/lib/courierRoute"
import { useCourierRouteTracking } from "../hooks/useCourierRouteTracking"
import { getApiErrorMessage } from "@/lib/apiErrors"
import "./CourierPages.css"

export default function CourierOrderPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get("token") || ""

  const { data: order, isError, error, isLoading, refetch } = useQuery({
    queryKey: ["courierOrder", token],
    queryFn: () => resolveOrderByToken(token),
    enabled: !!token,
    retry: 1
  })

  const acceptMutation = useMutation({
    mutationFn: () => acceptCourierOrder(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["courierOrder", token] })
      void queryClient.invalidateQueries({ queryKey: ["courierRoute"] })
    }
  })

  const pickedUpMutation = useMutation({
    mutationFn: () => markCourierPickedUp(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["courierOrder", token] })
      void queryClient.invalidateQueries({ queryKey: ["courierRoute"] })
    }
  })

  const deliveredMutation = useMutation({
    mutationFn: () => markCourierDelivered(token),
    onSuccess: () => {
      removeCourierRouteToken(token)
      void queryClient.invalidateQueries({ queryKey: ["courierOrder", token] })
      void queryClient.invalidateQueries({ queryKey: ["courierRoute"] })
    }
  })

  useEffect(() => {
    if (!token) navigate("/courier/scan", { replace: true })
    else addCourierRouteToken(token)
  }, [navigate, token])

  const trackingEnabled = !!order?.driverAccepted
  const { tracking, geoError } = useCourierRouteTracking(trackingEnabled)

  if (!token) return null
  if (isLoading) return <p className="courier-loading">Loading order…</p>

  if (isError || !order) {
    return (
      <div className="courier-page">
        <p className="courier-feedback courier-feedback--error">
          {getApiErrorMessage(error) ?? "Invalid or expired driver link."}
        </p>
        <Link to="/courier/scan" className="courier-btn courier-btn--primary">
          Scan again
        </Link>
      </div>
    )
  }

  const statusLabel = order.courierStatus ?? order.status
  const isDelivered = order.status === "delivered" || order.courierStatus === "delivered"
  const isPickedUp =
    order.courierStatus === "picked_up" ||
    order.status === "picked_up" ||
    order.status === "delivered"

  return (
    <div className="courier-page courier-page--detail">
      <p className="courier-back">
        <Link to="/courier">← My deliveries</Link>
      </p>

      <h1>Order #{order.orderId.slice(0, 8).toUpperCase()}</h1>
      <p className="courier-card__status">{statusLabel}</p>

      <section className="courier-detail">
        <h2>Customer</h2>
        <p>{order.customerName}</p>
        {order.customerPhone && (
          <p>
            <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
          </p>
        )}
      </section>

      <section className="courier-detail">
        <h2>Deliver to</h2>
        <p>{order.deliveryAddress}</p>
      </section>

      <section className="courier-detail">
        <h2>Items</h2>
        <ul className="courier-items">
          {order.items.map((item, idx) => (
            <li key={idx}>
              {item.name} × {item.quantity}
            </li>
          ))}
        </ul>
      </section>

      {!order.driverAccepted && !isDelivered && (
        <button
          type="button"
          className="courier-btn courier-btn--primary courier-btn--block"
          onClick={() => acceptMutation.mutate()}
          disabled={acceptMutation.isPending}
        >
          {acceptMutation.isPending ? "Accepting…" : "Accept delivery"}
        </button>
      )}

      {order.driverAccepted && order.navigationUrl && !isDelivered && (
        <a
          href={order.navigationUrl}
          target="_blank"
          rel="noreferrer"
          className="courier-btn courier-btn--nav courier-btn--block"
        >
          Open navigation
        </a>
      )}

      {order.driverAccepted && !isDelivered && (
        <div className="courier-status-actions">
          {!isPickedUp && (
            <button
              type="button"
              className="courier-btn"
              onClick={() => pickedUpMutation.mutate()}
              disabled={pickedUpMutation.isPending}
            >
              {pickedUpMutation.isPending ? "Updating…" : "Picked up"}
            </button>
          )}
          <button
            type="button"
            className="courier-btn courier-btn--primary"
            onClick={() => deliveredMutation.mutate()}
            disabled={deliveredMutation.isPending}
          >
            {deliveredMutation.isPending ? "Updating…" : "Delivered"}
          </button>
        </div>
      )}

      {order.driverAccepted && !isDelivered && (
        <p className={`courier-gps ${tracking ? "courier-gps--on" : ""}`}>
          {tracking ? "GPS tracking active." : "Starting GPS…"}
          {geoError ? ` ${geoError}` : ""}
        </p>
      )}

      {isDelivered && (
        <div className="courier-page__actions">
          <Link to="/courier/scan" className="courier-btn courier-btn--primary">
            Scan next order
          </Link>
          <button type="button" className="courier-btn" onClick={() => void refetch()}>
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}
