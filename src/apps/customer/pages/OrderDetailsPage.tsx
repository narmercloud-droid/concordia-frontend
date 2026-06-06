import React from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getOrder } from "@/api/order"
import { useOrderTracking } from "@/hooks/useOrderTracking"
import Button from "@/components/ui/Button"
import { useCartStore } from "@/context/cartStore"

export default function OrderDetailsPage() {
  const { orderId } = useParams()

  useOrderTracking(orderId!)

  const addItem = useCartStore((s) => s.addItem)

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId!)
  })

  if (isLoading) return <div>Loading order...</div>

  const order = data?.data

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2>Order #{order.id}</h2>

      <div>
        <strong>Status:</strong> {order.status}
      </div>

      {order.eta && (
        <div>
          <strong>ETA:</strong> {order.eta} minutes
        </div>
      )}

      {order.courier && (
        <div>
          <strong>Courier:</strong> {order.courier.name}
        </div>
      )}

      <h3>Items</h3>
      <ul>
        {order.items.map((i: any) => (
          <li key={i.itemId}>
            {i.name} x {i.quantity}
          </li>
        ))}
      </ul>

      <Button
        onClick={() => {
          order.items.forEach((i: any) => {
            addItem({
              id: i.itemId,
              name: i.name,
              price: i.price,
              description: "",
              image: "",
              categoryId: ""
            })
          })
        }}
      >
        Reorder These Items
      </Button>
    </div>
  )
}
