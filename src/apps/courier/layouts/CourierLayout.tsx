import React from "react"
import { Outlet, Link } from "react-router-dom"

export default function CourierLayout() {
  return (
    <div style={{ padding: 20 }}>
      <nav style={{ marginBottom: 20 }}>
        <Link to="/courier/scan">Scan</Link>
      </nav>
      <Outlet />
    </div>
  )
}
