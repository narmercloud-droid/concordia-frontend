import React from "react"
import { useQuery } from "@tanstack/react-query"
import { getManagerOrders } from "@/api/manager"
import { useAdminAuthStore } from "@/context/adminAuthStore"

export default function OrdersPage() {
  const admin = useAdminAuthStore((s) => s.admin)
  const branchId = admin?.branchId ?? undefined

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["managerOrders", branchId],
    queryFn: () => getManagerOrders(branchId),
    refetchInterval: 15000
  })

  const orders = data?.data?.data ?? []

  if (isLoading) return <p>Loading orders...</p>

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Orders</h2>
        <button onClick={() => refetch()}>Refresh</button>
      </div>

      {orders.length === 0 ? (
        <p style={{ marginTop: 16, color: "#666" }}>No orders yet.</p>
      ) : (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((order: any) => (
            <div
              key={order.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                background: order.status === "pending" ? "#fff8e1" : "#fff"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>#{order.id.slice(0, 8)}</strong>
                <span>{order.status}</span>
              </div>
              <p style={{ margin: "8px 0 0" }}>
                {order.customerName} · {order.customerPhone}
              </p>
              <p style={{ margin: 0, color: "#666" }}>
                {order.fulfillmentType}
                {order.deliveryAddress ? ` — ${order.deliveryAddress}` : ""}
              </p>
              <p style={{ margin: "8px 0 0" }}>
                €{(order.orderTotal ?? 0).toFixed(2)}
                {order.scheduledFor &&
                  ` · Scheduled ${new Date(order.scheduledFor).toLocaleString()}`}
              </p>
              <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                {order.items?.map((item: any, idx: number) => (
                  <li key={idx}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
