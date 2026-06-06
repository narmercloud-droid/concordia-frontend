import React from "react"
import { Outlet } from "react-router-dom"

export default function AdminAuthLayout() {
  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Admin Login</h2>
      <Outlet />
    </div>
  )
}
