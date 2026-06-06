import React from "react"
import { MenuCategory } from "@/types/Menu"
import { Link } from "react-router-dom"

export default function CategoryList({ categories }: { categories: MenuCategory[] }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/customer/menu/${cat.id}`}
          style={{
            padding: "10px 16px",
            background: "#eee",
            borderRadius: 8,
            textDecoration: "none",
            color: "#333"
          }}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  )
}
