import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getOrderStatus } from "@/api/customer"
import { socket } from "@/lib/socket"
import { formatDateTime, formatTime } from "@/utils/format"
import { translateFulfillmentType, translateOrderStatus } from "@/utils/translateStatus"
import OrderReviewForm from "@/apps/customer/components/order/OrderReviewForm"

type CourierLocation = { lat: number; lng: number; updatedAt?: string }

export default function OrderTrackingPage() {
  const { t } = useTranslation()
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

  if (!order) return <p className="customer-loading">{t("order.loading")}</p>

  const mapLat = courierLocation?.lat ?? order.deliveryLat
  const mapLng = courierLocation?.lng ?? order.deliveryLng
  const mapUrl =
    mapLat != null && mapLng != null
      ? `https://maps.google.com/maps?q=${mapLat},${mapLng}&z=15&output=embed`
      : order.deliveryAddress
        ? `https://maps.google.com/maps?q=${encodeURIComponent(order.deliveryAddress)}&z=15&output=embed`
        : null

  return (
    <div className="customer-page">
      <h2 className="customer-title">{t("order.tracking")}</h2>
      <p>{t("order.orderNumber", { id: orderId?.slice(0, 8) })}</p>
      <p>
        <strong>{t("order.status")}:</strong> {translateOrderStatus(order.status, t)}
      </p>
      {order.courierStatus && (
        <p>
          <strong>{t("order.driver")}:</strong> {order.courierStatus}
        </p>
      )}
      {order.fulfillmentType && (
        <p>
          {t("order.type")}: {translateFulfillmentType(order.fulfillmentType, t)}
        </p>
      )}
      {order.scheduledFor && (
        <p>
          {t("order.scheduledFor")}: {formatDateTime(order.scheduledFor)}
        </p>
      )}
      {order.etaReadyAt && (
        <p>
          {t("order.readyAt")}: {formatDateTime(order.etaReadyAt)}
        </p>
      )}
      {order.estimatedPrepTime && (
        <p>{t("order.prepTime", { min: order.estimatedPrepTime })}</p>
      )}

      {order.fulfillmentType === "delivery" && mapUrl && (
        <div style={{ marginTop: 20 }}>
          <h3 className="customer-subtitle">{t("order.deliveryMap")}</h3>
          {courierLocation && order.driverAccepted && (
            <p className="customer-hint" style={{ color: "var(--c-success)" }}>
              {t("order.driverLive")}
              {courierLocation.updatedAt &&
                t("order.driverUpdated", { time: formatTime(courierLocation.updatedAt) })}
            </p>
          )}
          {!order.driverAccepted && (
            <p className="customer-hint">{t("order.driverPending")}</p>
          )}
          <iframe
            title={t("order.deliveryMap")}
            className="customer-map"
            loading="lazy"
            src={mapUrl}
          />
        </div>
      )}

      {order.timeline && (
        <div style={{ marginTop: 24 }}>
          <h3 className="customer-subtitle">{t("order.timeline")}</h3>
          <ul className="customer-timeline">
            {order.timeline.map((entry: { status: string; timestamp: string }, idx: number) => (
              <li key={idx}>
                {translateOrderStatus(entry.status, t)} — {formatDateTime(entry.timestamp)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(order.canReview || order.hasReview) && orderId && (
        <OrderReviewForm
          orderId={orderId}
          fulfillmentType={order.fulfillmentType}
          existingReview={order.hasReview ? order.review : null}
        />
      )}
    </div>
  )
}
