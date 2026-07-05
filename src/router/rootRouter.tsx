import React, { Suspense } from "react"
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"
import customerRoutes, { branchRoutes } from "../apps/customer/routes.js"
import { RedirectLegacyTrack } from "../apps/customer/branchRedirects.js"
import homeRoutes from "../apps/customer/homeRoutes.js"
import infoRoutes from "../apps/customer/infoRoutes.js"
import LoadingFallback from "@/apps/customer/components/LoadingFallback"
import NotFoundPage from "@/apps/customer/components/NotFoundPage"
import ComingSoonPage from "@/pages/ComingSoonPage.js"
import { hasComingSoonBypass, isComingSoonActive } from "@/lib/comingSoon.js"

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
    children: [
      homeRoutes,
      infoRoutes,
      branchRoutes,
      customerRoutes,
      { path: "checkout", element: <Navigate to="/customer/checkout" replace /> },
      { path: "track/:orderId", element: <RedirectLegacyTrack /> },
      {
        path: "/admin",
        lazy: async () => {
          const { adminRoutes } = await import("../apps/admin/routes.js")
          return { children: adminRoutes.children }
        }
      },
      {
        path: "/courier",
        lazy: async () => {
          const { courierRoutes } = await import("@/apps/courier/routes.js")
          return { element: courierRoutes.element, children: courierRoutes.children }
        }
      },
      {
        path: "*",
        element: <NotFoundPage />
      }
    ]
  }
])

export default router
