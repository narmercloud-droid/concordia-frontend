import React, { Suspense } from "react"
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"
import customerRoutes from "../apps/customer/routes.js"
import adminRoutes from "../apps/admin/routes.js"
import { courierRoutes } from "@/apps/courier/routes"

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<div>Loading…</div>}>
        <Outlet />
      </Suspense>
    ),
    children: [
      { index: true, element: <Navigate to="/customer" replace /> },
      customerRoutes,
      adminRoutes,
      courierRoutes,
      {
        path: "*",
        element: <div>Page Not Found</div>
      }
    ]
  }
])

export default router
