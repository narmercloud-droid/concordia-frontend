import React, { Suspense } from "react"
import { RouteObject } from "react-router-dom"
import CourierLayout from "./layouts/CourierLayout.js"
const CourierScanPage = React.lazy(() => import("./pages/CourierScanPage.js"))
const CourierOrderPage = React.lazy(() => import("./pages/CourierOrderPage.js"))

const lazySection = (element: React.ReactElement) => (
  <Suspense fallback={<div>Loading…</div>}>{element}</Suspense>
)

export const courierRoutes: RouteObject = {
  path: "/courier",
  element: <CourierLayout />,
  children: [
    { path: "scan", element: lazySection(<CourierScanPage />) },
    { path: "order", element: lazySection(<CourierOrderPage />) }
  ]
}

export default courierRoutes
