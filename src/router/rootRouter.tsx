import React, { Suspense } from "react"
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"
import customerRoutes, { branchRoutes } from "../apps/customer/routes.js"
import { KEMPEN_BRANCH_ID, branchPath } from "@/lib/customerPaths"
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
      { index: true, element: <Navigate to={branchPath(KEMPEN_BRANCH_ID)} replace /> },
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
