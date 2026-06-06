import React from "react"
import { Link } from "react-router-dom"
import { useAdminAuthStore } from "@/context/adminAuthStore"

const linkStyle = { color: "white", textDecoration: "none", padding: "4px 0" }

export default function AdminNav() {
  const admin = useAdminAuthStore((s) => s.admin)
  const logout = useAdminAuthStore((s) => s.logout)

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ color: "#aaa", fontSize: 12, marginBottom: 8 }}>
        {admin?.name}
        <br />
        {admin?.role === "admin" ? "Super admin" : "Branch manager"}
      </div>
      <Link to="/admin/dashboard" style={linkStyle}>Dashboard</Link>
      <Link to="/admin/orders" style={linkStyle}>Orders</Link>
      <Link to="/admin/menu" style={linkStyle}>Menu</Link>
      <Link to="/admin/hours" style={linkStyle}>Opening hours</Link>
      <Link to="/admin/delivery" style={linkStyle}>Delivery settings</Link>
      <button
        onClick={logout}
        style={{
          marginTop: 16,
          background: "transparent",
          border: "1px solid #666",
          color: "#ccc",
          padding: "8px 12px",
          cursor: "pointer",
          borderRadius: 4
        }}
      >
        Log out
      </button>
    </nav>
  )
}
