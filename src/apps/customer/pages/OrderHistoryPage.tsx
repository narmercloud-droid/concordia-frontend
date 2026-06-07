import React from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getMyOrders } from "@/api/order"
import OrderHistoryItem from "../components/order/OrderHistoryItem.js"

export default function OrderHistoryPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders
  })

  if (isLoading) return <div>{t("account.ordersLoading")}</div>

  const orders = data?.data || []

  if (orders.length === 0) return <div>{t("account.noOrders")}</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {orders.map((order: any) => (
        <OrderHistoryItem key={order.id} order={order} />
      ))}
    </div>
  )
}
