import React, { useEffect, useState } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Trans, useTranslation } from "react-i18next"
import { getOrderStatus } from "@/api/customer"
import { getApiErrorMessage } from "@/lib/apiErrors"
import { socket } from "@/lib/socket"
import { formatCurrency, formatDateTime, formatTime } from "@/utils/format"
import { translateFulfillmentType, translateOrderStatus } from "@/utils/translateStatus"
import OrderReviewForm from "@/apps/customer/components/order/OrderReviewForm"
import OrderProgressStepper from "@/apps/customer/components/order/OrderProgressStepper"
import CheckoutLegalFooter from "@/apps/customer/components/CheckoutLegalFooter"
import { useDocumentVisible } from "@/hooks/useDocumentVisible"

type CourierLocation = { lat: number; lng: number; updatedAt?: string }

export default function OrderTrackingPage() {
  const { t } = useTranslation()
  const { orderId } = useParams()
  const location = useLocation()
  const queryClient = useQueryClient()
  const tabVisible = useDocumentVisible()
  const [courierLocation, setCourierLocation] = useState<CourierLocation | null>(null)
  const justPlaced = Boolean((location.state as { justPlaced?: boolean } | null)?.justPlaced)

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["orderStatus", orderId],
    queryFn: () => getOrderStatus(orderId!),
    enabled: !!orderId,
    staleTime: 15_000,
    refetchInterval: tabVisible ? 30_000 : false,
    retry: 1
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

  if (isLoading) return <p className="customer-loading">{t("order.loading")}</p>

  if (isError || !order) {
    return (
      <div className="customer-page">
        <h2 className="customer-title">{t("order.tracking")}</h2>
        <div className="customer-alert customer-alert--error">
          {getApiErrorMessage(error) ?? t("order.notFound")}
        </div>
        <div className="customer-btn-row">
          <button type="button" className="customer-btn" onClick={() => void refetch()}>
            {t("common.retry")}
          </button>
          <Link to="/customer" className="customer-btn customer-btn--primary">
            {t("pages.nav.home")}
          </Link>
        </div>
      </div>
    )
  }

  const mapLat = courierLocation?.lat ?? order.deliveryLat
  const mapLng = courierLocation?.lng ?? order.deliveryLng
  const mapUrl =
    mapLat != null && mapLng != null
      ? `https://maps.google.com/maps?q=${mapLat},${mapLng}&z=15&output=embed`
      : order.deliveryAddress
        ? `https://maps.google.com/maps?q=${encodeURIComponent(order.deliveryAddress)}&z=15&output=embed`
        : null

  const showConfirmation =
    justPlaced || ["pending", "accepted"].includes(order.status)

  return (
    <div className="customer-page order-tracking">
      {showConfirmation && (
        <div className="order-confirmation">
          <div className="order-confirmation__icon" aria-hidden="true">
            ✓
          </div>
          <h2 className="order-confirmation__title">{t("order.confirmationTitle")}</h2>
          <p className="order-confirmation__lead">{t("order.confirmationLead")}</p>
          <p className="order-confirmation__meta">
            {t("order.orderNumber", { id: orderId?.slice(0, 8) })}
            {order.orderTotal != null && (
              <> · {formatCurrency(Number(order.orderTotal))}</>
            )}
          </p>
          <p className="customer-hint order-confirmation__legal">
            <Trans
              i18nKey="order.confirmationLegal"
              components={{
                impressumLink: <Link to="/impressum" className="checkout-terms-link" />,
                agbLink: <Link to="/agb" className="checkout-terms-link" />,
                widerrufLink: <Link to="/widerruf" className="checkout-terms-link" />
              }}
            />
          </p>
        </div>
      )}

      <h2 className="customer-title">{t("order.tracking")}</h2>

      <OrderProgressStepper status={order.status} fulfillmentType={order.fulfillmentType} />

      <div className="order-tracking__status-card customer-card">
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
        {order.deliveryAddress && order.fulfillmentType === "delivery" && (
          <p className="customer-hint">{order.deliveryAddress}</p>
        )}
      </div>

      <p className="customer-hint">
        <Link to="/customer/settings">{t("order.viewOrderHistory")}</Link>
      </p>

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
        <>
          {order.canReview && (
            <div className="order-review-invite">
              <p className="order-review-invite__eyebrow">{t("orderReview.inviteEyebrow")}</p>
              <h3 className="customer-subtitle">{t("orderReview.inviteTitle")}</h3>
              <p className="customer-hint">{t("orderReview.inviteLead")}</p>
              <a className="customer-btn customer-btn--primary" href="#review">
                {t("orderReview.leaveReview")}
              </a>
            </div>
          )}
          <OrderReviewForm
            orderId={orderId}
            fulfillmentType={order.fulfillmentType}
            existingReview={order.hasReview ? order.review : null}
          />
        </>
      )}

      <CheckoutLegalFooter />
    </div>
  )
}
