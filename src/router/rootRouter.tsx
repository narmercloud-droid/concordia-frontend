import React, { Suspense } from "react"
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"
import customerRoutes, { branchRoutes } from "../apps/customer/routes.js"
import homeRoutes from "../apps/customer/homeRoutes.js"
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
      homeRoutes,
      branchRoutes,
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
