import React, { Suspense } from "react"
import { NavLink, Outlet } from "react-router-dom"
import LoadingFallback from "@/apps/customer/components/LoadingFallback.js"
import "./pages/CourierPages.css"

export default function CourierLayout() {
  return (
    <div className="courier-layout" style={{ padding: 16, minHeight: "100vh", background: "#faf9f7" }}>
      <nav className="courier-layout__nav" aria-label="Driver navigation">
        <NavLink to="/courier" end>
          Route
        </NavLink>
        <NavLink to="/courier/scan">Scan</NavLink>
      </nav>
      <Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </Suspense>
    </div>
  )
}
