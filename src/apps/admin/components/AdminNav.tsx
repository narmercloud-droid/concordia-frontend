import React from "react"
import { Link } from "react-router-dom"
import { useAdminAuthStore } from "@/context/adminAuthStore"
import { useAdminPermissions } from "@/hooks/useAdminPermissions"

const linkStyle = { color: "white", textDecoration: "none", padding: "4px 0" }

export default function AdminNav() {
  const admin = useAdminAuthStore((s) => s.admin)
  const logout = useAdminAuthStore((s) => s.logout)
  const { can, isSuperAdmin } = useAdminPermissions()

  const items = [
    { to: "/admin/dashboard", label: "Dashboard", show: can("dashboard") },
    { to: "/admin/orders", label: "Orders", show: can("orders") },
    { to: "/admin/menu", label: "Menu", show: can("menu_view") },
    { to: "/admin/hours", label: "Opening hours", show: can("hours_view") },
    { to: "/admin/delivery", label: "Delivery settings", show: can("delivery_view") },
    { to: "/admin/offers", label: "Offers", show: can("offers_view") },
    { to: "/admin/customers", label: "Customers", show: can("customers_view") },
    { to: "/admin/reviews", label: "Customer feedback", show: can("reviews_view") },
    { to: "/admin/platform-settings", label: "Platform settings", show: isSuperAdmin },
    { to: "/admin/staff", label: "Staff", show: isSuperAdmin },
    { to: "/admin/permissions", label: "Manager permissions", show: isSuperAdmin }
  ]

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ color: "#aaa", fontSize: 12, marginBottom: 8 }}>
        {admin?.name}
        <br />
        {isSuperAdmin ? "Super admin" : "Branch manager"}
      </div>
      {items
        .filter((item) => item.show)
        .map((item) => (
          <Link key={item.to} to={item.to} style={linkStyle}>
            {item.label}
          </Link>
        ))}
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
