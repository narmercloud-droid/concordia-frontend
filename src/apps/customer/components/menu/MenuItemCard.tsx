import React from "react"
import { MenuItem } from "@/types/Menu"
import { Link } from "react-router-dom"
import { formatCurrency } from "@/utils/format"

export default function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <Link
      to={`/customer/menu/item/${item.id}`}
      style={{
        display: "block",
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 8,
        textDecoration: "none",
        color: "#333"
      }}
    >
      <img
        src={item.image}
        alt={item.name}
        style={{ width: "100%", borderRadius: 8, marginBottom: 8 }}
      />
      <div style={{ fontWeight: 600 }}>{item.name}</div>
      <div style={{ opacity: 0.7 }}>{formatCurrency(item.price)}</div>
    </Link>
  )
}
