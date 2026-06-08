import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import StatusBadge from "./StatusBadge.js"
import { formatCurrency } from "@/utils/format"

export default function OrderHistoryItem({ order }: { order: any }) {
  const { t } = useTranslation()
  const total = order.items.reduce(
    (sum: number, i: any) => sum + i.price * i.quantity,
    0
  )

  return (
    <Link
      to={`/customer/order/${order.id}`}
      style={{
        display: "block",
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 8,
        textDecoration: "none",
        color: "#333"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 600 }}>Order #{order.id}</div>
          <div style={{ opacity: 0.7, fontSize: 14 }}>
            {order.items.length} items
          </div>
        </div>

        <StatusBadge status={order.status} />
      </div>

      <div style={{ marginTop: 8, fontWeight: 600 }}>
        Total: {formatCurrency(total)}
      </div>

      {order.canReview && (
        <div style={{ marginTop: 8, fontSize: 14, color: "var(--c-gold, #1b7340)", fontWeight: 600 }}>
          {t("orderReview.leaveReview")}
        </div>
      )}
      {order.hasReview && (
        <div style={{ marginTop: 8, fontSize: 14, color: "var(--c-muted)" }}>
          {t("orderReview.reviewSubmitted")}
        </div>
      )}
    </Link>
  )
}
