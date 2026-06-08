import React, { Suspense } from "react"
import CustomerLayout from "./layouts/CustomerLayout.js"
import LoadingFallback from "./components/LoadingFallback.js"

const AboutPage = React.lazy(() => import("./pages/AboutPage.js"))
const ContactPage = React.lazy(() => import("./pages/ContactPage.js"))
const ReviewsPage = React.lazy(() => import("./pages/ReviewsPage.js"))
const OffersPage = React.lazy(() => import("./pages/OffersPage.js"))
const GiftVoucherPage = React.lazy(() => import("./pages/GiftVoucherPage.js"))
const FaqPage = React.lazy(() => import("./pages/FaqPage.js"))
const TermsPage = React.lazy(() => import("./pages/TermsPage.js"))
const LoyaltyTermsPage = React.lazy(() => import("./pages/LoyaltyTermsPage.js"))

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
    { path: "faq", element: lazy(<FaqPage />) },
    { path: "terms", element: lazy(<TermsPage />) },
    { path: "loyalty-terms", element: lazy(<LoyaltyTermsPage />) }
  ]
}

export default infoRoutes
