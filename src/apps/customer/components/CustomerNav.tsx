import React from "react"
import { Link } from "react-router-dom"

export default function CustomerNav() {
  return (
    <nav style={{ display: "flex", gap: 16, marginBottom: 20 }}>
      <Link to="/customer/menu">Menu</Link>
      <Link to="/customer/cart">Cart</Link>
      <Link to="/customer/orders">My Orders</Link>
    </nav>
  )
}
