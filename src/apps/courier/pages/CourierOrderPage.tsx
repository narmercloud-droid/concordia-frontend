import React, { useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { resolveOrderByToken, acceptCourierOrder } from "@/api/courierOrder"
import { addCourierRouteToken } from "@/lib/courierRoute"
import { useCourierRouteTracking } from "../hooks/useCourierRouteTracking"
import CourierCompleteButton from "../components/CourierCompleteButton"
import { getApiErrorMessage } from "@/lib/apiErrors"
import "./CourierPages.css"

function deliveryStep(order: {
  driverAccepted: boolean
  status: string
  courierStatus?: string | null
}) {
  const done = order.status === "delivered" || order.courierStatus === "delivered"
  if (done) return 3
  if (
    order.courierStatus === "picked_up" ||
    order.status === "picked_up" ||
    order.status === "out_for_delivery"
  ) {
    return 2
  }
  if (order.driverAccepted) return 1
  return 0
}

export default function CourierOrderPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get("token") || ""

  const { data: order, isError, error, isLoading } = useQuery({
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

  const isDelivered = order.status === "delivered" || order.courierStatus === "delivered"
  const step = deliveryStep(order)

  return (
    <div className="courier-page courier-page--detail courier-page--with-bar">
      <p className="courier-back">
        <Link to="/courier">← My deliveries</Link>
      </p>

      <ol className="courier-steps" aria-label="Delivery progress">
        <li className={step >= 1 ? "courier-steps__item courier-steps__item--done" : "courier-steps__item"}>
          Accepted
        </li>
        <li className={step >= 2 ? "courier-steps__item courier-steps__item--done" : "courier-steps__item"}>
          On the way
        </li>
        <li className={step >= 3 ? "courier-steps__item courier-steps__item--done" : "courier-steps__item"}>
          Complete
        </li>
      </ol>

      <h1>Order #{order.orderId.slice(0, 8).toUpperCase()}</h1>
      <p className="courier-card__status">{order.courierStatus ?? order.status}</p>

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
        <p className={`courier-gps ${tracking ? "courier-gps--on" : ""}`}>
          {tracking ? "GPS tracking active." : "Starting GPS…"}
          {geoError ? ` ${geoError}` : ""}
        </p>
      )}

      {isDelivered && (
        <div className="courier-complete-success">
          <p className="courier-complete-success__title">Delivery completed</p>
          <p className="courier-complete-success__lead">This order is done. Scan or select the next delivery.</p>
          <Link to="/courier/scan" className="courier-btn courier-btn--primary courier-btn--block">
            Scan next order
          </Link>
          <Link to="/courier" className="courier-btn courier-btn--block">
            Back to route
          </Link>
        </div>
      )}

      {order.driverAccepted && !isDelivered && (
        <div className="courier-action-bar">
          <CourierCompleteButton token={token} onCompleted={() => navigate("/courier")} />
        </div>
      )}
    </div>
  )
}
