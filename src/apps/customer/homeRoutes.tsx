import React, { Suspense } from "react"
import CustomerLayout from "./layouts/CustomerLayout.js"
import LoadingFallback from "./components/LoadingFallback.js"

const HomePage = React.lazy(() => import("./pages/HomePage.js"))

export const homeRoutes = {
  element: <CustomerLayout />,
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <HomePage />
        </Suspense>
      )
    }
  ]
}

export default homeRoutes
