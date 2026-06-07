import React, { Suspense } from "react"
import CustomerLayout from "./layouts/CustomerLayout.js"
import LoadingFallback from "./components/LoadingFallback.js"

const AboutPage = React.lazy(() => import("./pages/AboutPage.js"))
const ContactPage = React.lazy(() => import("./pages/ContactPage.js"))
const ReviewsPage = React.lazy(() => import("./pages/ReviewsPage.js"))
const OffersPage = React.lazy(() => import("./pages/OffersPage.js"))
const GiftVoucherPage = React.lazy(() => import("./pages/GiftVoucherPage.js"))
const DeliveryPage = React.lazy(() => import("./pages/DeliveryPage.js"))
const FaqPage = React.lazy(() => import("./pages/FaqPage.js"))

const lazy = (element: React.ReactElement) => (
  <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
)

export const infoRoutes = {
  element: <CustomerLayout />,
  children: [
    { path: "about", element: lazy(<AboutPage />) },
    { path: "contact", element: lazy(<ContactPage />) },
    { path: "reviews", element: lazy(<ReviewsPage />) },
    { path: "offers", element: lazy(<OffersPage />) },
    { path: "gutschein", element: lazy(<GiftVoucherPage />) },
    { path: "gutschein/:branchId", element: lazy(<GiftVoucherPage />) },
    { path: "delivery", element: lazy(<DeliveryPage />) },
    { path: "faq", element: lazy(<FaqPage />) }
  ]
}

export default infoRoutes
