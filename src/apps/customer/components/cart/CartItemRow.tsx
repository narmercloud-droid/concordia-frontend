import React from "react"
import { CartItem } from "@/context/cartStore"
import Button from "@/components/ui/Button"
import { formatCurrency } from "@/utils/format"
import { useCartStore } from "@/context/cartStore"

export default function CartItemRow({ item }: { item: CartItem }) {
  const increase = useCartStore((s) => s.increase)
  const decrease = useCartStore((s) => s.decrease)
  const removeItem = useCartStore((s) => s.removeItem)

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 0",
        borderBottom: "1px solid #ddd"
      }}
    >
      <div>
        <div style={{ fontWeight: 600 }}>{item.item.name}</div>
        <div style={{ opacity: 0.7 }}>{formatCurrency(item.item.price)}</div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Button onClick={() => decrease(item.item.id)}>-</Button>
        <div>{item.quantity}</div>
        <Button onClick={() => increase(item.item.id)}>+</Button>
        <Button onClick={() => removeItem(item.item.id)}>Remove</Button>
      </div>
    </div>
  )
}
