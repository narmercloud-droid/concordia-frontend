import React from "react"
import { useNavigate } from "react-router-dom"
import { useCartStore } from "@/store/cartStore"

export default function CartPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)

  if (items.length === 0)
    return (
      <div style={{ padding: 16 }}>
        <h2>Your Cart</h2>
        <p>Your cart is empty.</p>
      </div>
    )

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 16 }}>
      <h2>Your Cart</h2>

      {items.map((i) => (
        <div
          key={i.cartKey}
          style={{
            padding: 14,
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 12
          }}
        >
          <h4 style={{ margin: "0 0 6px" }}>{i.name}</h4>
          {i.variants.length > 0 && (
            <p style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              {i.variants.map((v) => v.name).join(", ")}
            </p>
          )}
          {i.addOns.length > 0 && (
            <p style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
              Extras: {i.addOns.map((a) => `${a.name} (+${a.price.toFixed(2)} €)`).join(", ")}
            </p>
          )}
          {i.notes && (
            <p style={{ margin: "4px 0", fontSize: 14, fontStyle: "italic", color: "#666" }}>
              Note: {i.notes}
            </p>
          )}
          <p style={{ margin: "8px 0 0" }}>
            {i.quantity} × {i.unitPrice.toFixed(2)} € ={" "}
            {(i.quantity * i.unitPrice).toFixed(2)} €
          </p>
          <button
            onClick={() => removeItem(i.cartKey)}
            style={{ marginTop: 8, fontSize: 14 }}
          >
            Remove
          </button>
        </div>
      ))}

      <h3>Subtotal: {total.toFixed(2)} €</h3>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={clearCart}>Clear Cart</button>
        <button
          onClick={() => navigate("/customer/checkout")}
          style={{
            flex: 1,
            padding: "12px 20px",
            background: "#c41e3a",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Checkout
        </button>
      </div>
    </div>
  )
}
