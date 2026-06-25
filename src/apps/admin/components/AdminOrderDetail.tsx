import React from "react"
import type { ManagerOrder } from "@/api/manager"
import { formatCurrency } from "@/utils/format"

function formatWhen(value?: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

type Props = {
  order: ManagerOrder
}

export default function AdminOrderDetail({ order }: Props) {
  const address = [order.deliveryAddress, order.postalCode].filter(Boolean).join(", ")

  return (
    <div className="orders-page__detail">
      <section className="orders-page__section">
        <h4>Order</h4>
        <div className="orders-page__grid">
          <p className="orders-page__field">
            <strong>Order number</strong>
            {order.id}
          </p>
          {order.trackingToken ? (
            <p className="orders-page__field">
              <strong>Tracking token</strong>
              {order.trackingToken}
            </p>
          ) : null}
          <p className="orders-page__field">
            <strong>Placed</strong>
            {formatWhen(order.createdAt)}
          </p>
          <p className="orders-page__field">
            <strong>Status</strong>
            {order.status}
          </p>
          <p className="orders-page__field">
            <strong>Kitchen</strong>
            {order.kitchenStatus ?? "—"}
          </p>
          <p className="orders-page__field">
            <strong>Courier</strong>
            {order.courierStatus ?? "—"}
          </p>
          <p className="orders-page__field">
            <strong>Type</strong>
            {order.fulfillmentType ?? "—"}
          </p>
          <p className="orders-page__field">
            <strong>Scheduled</strong>
            {formatWhen(order.scheduledFor)}
          </p>
        </div>
      </section>

      <section className="orders-page__section">
        <h4>Customer</h4>
        <div className="orders-page__grid">
          <p className="orders-page__field">
            <strong>Name</strong>
            {order.customerName ?? "—"}
          </p>
          <p className="orders-page__field">
            <strong>Phone</strong>
            {order.customerPhone ?? "—"}
          </p>
          <p className="orders-page__field">
            <strong>Email</strong>
            {order.customerEmail ?? "—"}
          </p>
          <p className="orders-page__field">
            <strong>Guest order</strong>
            {order.isGuest ? "Yes" : "No"}
          </p>
          {address ? (
            <p className="orders-page__field" style={{ gridColumn: "1 / -1" }}>
              <strong>Address</strong>
              {address}
            </p>
          ) : null}
        </div>
      </section>

      <section className="orders-page__section">
        <h4>Payment</h4>
        <div className="orders-page__grid">
          <p className="orders-page__field">
            <strong>Total</strong>
            {formatCurrency(Number(order.orderTotal ?? 0))}
          </p>
          <p className="orders-page__field">
            <strong>Delivery fee</strong>
            {formatCurrency(Number(order.deliveryFee ?? 0))}
          </p>
          <p className="orders-page__field">
            <strong>Discount</strong>
            {formatCurrency(Number(order.discount ?? 0))}
          </p>
          {order.giftCardAmount ? (
            <p className="orders-page__field">
              <strong>Gift card</strong>
              {formatCurrency(Number(order.giftCardAmount))}
            </p>
          ) : null}
          <p className="orders-page__field">
            <strong>Method</strong>
            {order.paymentMethod ?? "—"}
          </p>
          <p className="orders-page__field">
            <strong>Payment status</strong>
            {order.paymentStatus ?? "—"}
          </p>
        </div>
      </section>

      <section className="orders-page__section">
        <h4>Items ({order.items.length})</h4>
        <ul className="orders-page__items">
          {order.items.map((item) => (
            <li key={item.id} className="orders-page__item">
              <div className="orders-page__item-head">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
              {item.variants.length > 0 ? (
                <ul className="orders-page__item-sub">
                  {item.variants.map((v) => (
                    <li key={`${item.id}-v-${v.name}`}>
                      {v.name}
                      {v.price > 0 ? ` (+${formatCurrency(v.price)})` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
              {item.extras.length > 0 ? (
                <ul className="orders-page__item-sub">
                  {item.extras.map((e) => (
                    <li key={`${item.id}-e-${e.name}`}>
                      + {e.name}
                      {e.price > 0 ? ` (${formatCurrency(e.price)})` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
              {item.notes ? (
                <p className="orders-page__item-sub" style={{ listStyle: "none", paddingLeft: 0 }}>
                  Note: {item.notes}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {order.notes ? (
        <section className="orders-page__section">
          <h4>Order notes</h4>
          <p className="orders-page__notes">{order.notes}</p>
        </section>
      ) : null}

      {order.timeline.length > 0 ? (
        <section className="orders-page__section">
          <h4>Timeline</h4>
          <ul className="orders-page__timeline">
            {order.timeline.map((event, idx) => (
              <li key={`${event.status}-${idx}`}>
                {event.status} — {formatWhen(event.timestamp)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
