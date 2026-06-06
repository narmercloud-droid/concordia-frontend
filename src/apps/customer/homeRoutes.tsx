import React, { Suspense } from "react"
import CustomerLayout from "./layouts/CustomerLayout.js"

const HomePage = React.lazy(() => import("./pages/HomePage.js"))

const lazySection = (element: React.ReactElement) => (
  <Suspense fallback={<div>Loading…</div>}>{element}</Suspense>
)

export const homeRoutes = {
  element: <CustomerLayout />,
  children: [{ index: true, element: lazySection(<HomePage />) }]
}

export default homeRoutes
