import React from "react"
import { useQuery } from "@tanstack/react-query"
import { getMyOrders } from "@/api/order"
import OrderHistoryItem from "../components/order/OrderHistoryItem.js"

export default function OrderHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders
  })

  if (isLoading) return <div>Loading orders...</div>

  const orders = data?.data || []

  if (orders.length === 0)
    return <div>You have no past orders.</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {orders.map((order: any) => (
        <OrderHistoryItem key={order.id} order={order} />
      ))}
    </div>
  )
}
