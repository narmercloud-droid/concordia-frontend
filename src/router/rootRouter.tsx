import React, { Suspense } from "react"
import { createBrowserRouter, Outlet } from "react-router-dom"
import customerRoutes, { branchRoutes } from "../apps/customer/routes.js"
import homeRoutes from "../apps/customer/homeRoutes.js"
import infoRoutes from "../apps/customer/infoRoutes.js"
import adminRoutes from "../apps/admin/routes.js"
import { courierRoutes } from "@/apps/courier/routes.js"
import LoadingFallback from "@/apps/customer/components/LoadingFallback"
import NotFoundPage from "@/apps/customer/components/NotFoundPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </Suspense>
    ),
    children: [
      homeRoutes,
      infoRoutes,
      branchRoutes,
      customerRoutes,
      adminRoutes,
      courierRoutes,
      {
        path: "*",
        element: <NotFoundPage />
      }
    ]
  }
])

export default router
