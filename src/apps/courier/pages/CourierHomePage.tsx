import React from "react"
import { Link } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { resolveOrdersByTokens } from "@/api/courierOrder.js"
import {
  activeCourierTokens,
  clearCourierRoute,
  loadCourierRoute,
  removeCourierRouteToken
} from "@/lib/courierRoute.js"
import { buildRouteNavigationUrl, type CourierMapStop } from "@/lib/courierMaps.js"
import CourierRouteMap from "../components/CourierRouteMap.js"
import { useCourierRouteTracking } from "../hooks/useCourierRouteTracking.js"
import "./CourierPages.css"

function statusLabel(order: { status: string; courierStatus?: string | null }) {
  return order.courierStatus ?? order.status
}

function isDone(order: { status: string; courierStatus?: string | null }) {
  return ["delivered", "completed", "cancelled", "rejected"].includes(order.status)
}

export default function CourierHomePage() {
  const queryClient = useQueryClient()
  const route = loadCourierRoute()
  const tokens = activeCourierTokens()

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["courierRoute", tokens.join(",")],
    queryFn: () => resolveOrdersByTokens(tokens),
    enabled: tokens.length > 0,
    refetchInterval: 20_000
  })

  const activeOrders = orders.filter(({ order }) => !isDone(order))
  const doneOrders = orders.filter(({ order }) => isDone(order))
  const hasAccepted = activeOrders.some(({ order }) => order.driverAccepted)
  const { tracking, geoError } = useCourierRouteTracking(hasAccepted)

  const removeStale = (token: string) => {
    removeCourierRouteToken(token)
    void queryClient.invalidateQueries({ queryKey: ["courierRoute"] })
  }

  const clearRoute = () => {
    clearCourierRoute()
    void queryClient.invalidateQueries({ queryKey: ["courierRoute"] })
    void refetch()
  }

  const mapStops: CourierMapStop[] = activeOrders
    .filter(({ order }) => order.deliveryAddress)
    .map(({ order }) => ({
      orderId: order.orderId,
      label: `#${order.orderId.slice(0, 8).toUpperCase()} · ${order.customerName}`,
      address: order.deliveryAddress ?? "",
      lat: order.deliveryLat,
      lng: order.deliveryLng
    }))

  const branchOrigin = activeOrders[0]?.order.branch
  const routeNavUrl = buildRouteNavigationUrl(mapStops, branchOrigin?.address ?? branchOrigin?.name)

  return (
    <div className="courier-page">
      <div className="courier-page__header">
        <h1>My deliveries</h1>
        <p className="courier-page__lead">
          {activeOrders.length
            ? `${activeOrders.length} active · scan more slips anytime`
            : "Scan delivery slips to add orders to your route."}
        </p>
      </div>

      <div className="courier-page__actions">
        <Link to="/courier/scan" className="courier-btn courier-btn--primary">
          Scan order
        </Link>
        {route.length > 0 && (
          <button type="button" className="courier-btn" onClick={clearRoute}>
            Clear route
          </button>
        )}
      </div>

      {hasAccepted && (
        <p className={`courier-gps ${tracking ? "courier-gps--on" : ""}`}>
          {tracking
            ? "GPS active for all accepted orders in your route."
            : "Waiting for GPS… allow location when prompted."}
          {geoError ? ` ${geoError}` : ""}
        </p>
      )}

      {mapStops.length > 0 && (
        <section className="courier-route-map-section">
          <div className="courier-route-map-section__head">
            <h2>Route map</h2>
            {mapStops.length > 1 && (
              <span className="courier-route-map-section__count">{mapStops.length} stops</span>
            )}
          </div>
          <CourierRouteMap
            stops={mapStops}
            origin={
              branchOrigin?.lat != null && branchOrigin?.lng != null
                ? {
                    lat: branchOrigin.lat,
                    lng: branchOrigin.lng,
                    label: branchOrigin.name ?? "Restaurant"
                  }
                : null
            }
          />
          {routeNavUrl && (
            <a
              href={routeNavUrl}
              target="_blank"
              rel="noreferrer"
              className="courier-btn courier-btn--nav courier-btn--block"
            >
              Open full route in Google Maps
            </a>
          )}
        </section>
      )}

      {tokens.length === 0 && (
        <div className="courier-empty">
          <p>No orders yet. Tap <strong>Scan order</strong> and scan the QR on each delivery slip.</p>
        </div>
      )}

      {isLoading && tokens.length > 0 && <p className="courier-loading">Loading route…</p>}

      {activeOrders.length > 0 && (
        <section className="courier-list">
          <h2>Active</h2>
          {activeOrders.map(({ token, order }) => (
            <article key={token} className="courier-card">
              <div className="courier-card__top">
                <strong>#{order.orderId.slice(0, 8).toUpperCase()}</strong>
                <span className="courier-card__status">{statusLabel(order)}</span>
              </div>
              <p className="courier-card__name">{order.customerName}</p>
              <p className="courier-card__address">{order.deliveryAddress}</p>
              <div className="courier-card__actions">
                <Link to={`/courier/order?token=${encodeURIComponent(token)}`} className="courier-btn">
                  Open
                </Link>
                {order.navigationUrl && (
                  <a
                    href={order.navigationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="courier-btn courier-btn--nav"
                  >
                    Navigate
                  </a>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {doneOrders.length > 0 && (
        <section className="courier-list courier-list--done">
          <h2>Completed</h2>
          {doneOrders.map(({ token, order }) => (
            <article key={token} className="courier-card courier-card--done">
              <div className="courier-card__top">
                <strong>#{order.orderId.slice(0, 8).toUpperCase()}</strong>
                <span>{statusLabel(order)}</span>
              </div>
              <button type="button" className="courier-btn" onClick={() => removeStale(token)}>
                Remove
              </button>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
