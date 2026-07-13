import React, { Suspense } from "react"
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"
import type { LazyRouteFunction, RouteObject } from "react-router-dom"
import customerRoutes, { branchRoutes } from "../apps/customer/routes.js"
import { RedirectLegacyTrack } from "../apps/customer/branchRedirects.js"
import homeRoutes from "../apps/customer/homeRoutes.js"
import infoRoutes from "../apps/customer/infoRoutes.js"
import LoadingFallback from "@/apps/customer/components/LoadingFallback"
import NotFoundPage from "@/apps/customer/components/NotFoundPage"
import ComingSoonPage from "@/pages/ComingSoonPage.js"
import RouteChunkError from "@/components/RouteChunkError.js"
import { hasComingSoonBypass, isComingSoonActive } from "@/lib/comingSoon.js"

function lazyRoute(loader: () => Promise<RouteObject>): LazyRouteFunction<RouteObject> {
  return loader as LazyRouteFunction<RouteObject>
}

function RootLayout() {
  if (isComingSoonActive() && !hasComingSoonBypass()) {
    return <ComingSoonPage />
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Outlet />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteChunkError />,
    children: [
      homeRoutes,
      infoRoutes,
      branchRoutes,
      customerRoutes,
      { path: "checkout", element: <Navigate to="/customer/checkout" replace /> },
      { path: "track/:orderId", element: <RedirectLegacyTrack /> },
      {
        lazy: lazyRoute(async () => {
          const { adminRoutes } = await import("../apps/admin/routes.js")
          return adminRoutes
        })
      },
      {
        lazy: lazyRoute(async () => {
          const { courierRoutes } = await import("@/apps/courier/routes.js")
          return courierRoutes
        })
      },
      {
        path: "*",
        element: <NotFoundPage />
      }
    ]
  }
])

export default router
