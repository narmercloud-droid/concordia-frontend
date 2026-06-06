import React, { Suspense } from "react"
import CustomerLayout from "./layouts/CustomerLayout.js"
import LoadingFallback from "./components/LoadingFallback.js"

const HomePage = React.lazy(() => import("./pages/HomePage.js"))

const lazySection = (element: React.ReactElement) => (
  <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
)

export const homeRoutes = {
  element: <CustomerLayout />,
  children: [{ index: true, element: lazySection(<HomePage />) }]
}

export default homeRoutes
