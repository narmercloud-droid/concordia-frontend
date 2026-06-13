import React from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getMyOrders } from "@/api/order"
import OrderHistoryItem from "../components/order/OrderHistoryItem.js"

export default function OrderHistoryPage() {
  const { t } = useTranslation()
  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
    retry: 1
  })

  if (isLoading) return <div className="customer-loading">{t("account.ordersLoading")}</div>

  if (isError) {
    return (
      <div>
        <p className="customer-error">{t("account.ordersLoadError")}</p>
        <button type="button" className="customer-btn" onClick={() => void refetch()}>
          {t("common.retry")}
        </button>
      </div>
    )
  }

  if (orders.length === 0) return <div>{t("account.noOrders")}</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {orders.map((order: any) => (
        <OrderHistoryItem key={order.id} order={order} />
      ))}
    </div>
  )
}
