import React, { Suspense } from "react"
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"
import customerRoutes, { branchRoutes } from "../apps/customer/routes.js"
import { RedirectLegacyTrack } from "../apps/customer/branchRedirects.js"
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
      { path: "checkout", element: <Navigate to="/customer/checkout" replace /> },
      { path: "track/:orderId", element: <RedirectLegacyTrack /> },
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
