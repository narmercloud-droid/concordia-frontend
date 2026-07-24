import { Suspense, type ReactElement } from "react"
import { Navigate } from "react-router-dom"
import CustomerLayout from "./layouts/CustomerLayout.js"
import LoadingFallback from "./components/LoadingFallback.js"
import { lazyWithRetry } from "@/lib/lazyWithRetry"

const AboutPage = lazyWithRetry(() => import("./pages/AboutPage.js"))
const ContactPage = lazyWithRetry(() => import("./pages/ContactPage.js"))
const ReviewsPage = lazyWithRetry(() => import("./pages/ReviewsPage.js"))
const OffersPage = lazyWithRetry(() => import("./pages/OffersPage.js"))
const GiftVoucherPage = lazyWithRetry(() => import("./pages/GiftVoucherPage.js"))
const FaqPage = lazyWithRetry(() => import("./pages/FaqPage.js"))
const TermsPage = lazyWithRetry(() => import("./pages/TermsPage.js"))
const ImpressumPage = lazyWithRetry(() => import("./pages/ImpressumPage.js"))
const PrivacyPage = lazyWithRetry(() => import("./pages/PrivacyPage.js"))
const AgbPage = lazyWithRetry(() => import("./pages/AgbPage.js"))
const WiderrufPage = lazyWithRetry(() => import("./pages/WiderrufPage.js"))

const lazy = (element: ReactElement) => (
  <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
)

export const infoRoutes = {
  element: <CustomerLayout />,
  children: [
    { path: "about", element: lazy(<AboutPage />) },
    { path: "team", element: <Navigate to="/about" replace /> },
    { path: "contact", element: lazy(<ContactPage />) },
    { path: "reviews", element: lazy(<ReviewsPage />) },
    { path: "offers", element: lazy(<OffersPage />) },
    { path: "gutschein", element: lazy(<GiftVoucherPage />) },
    { path: "gutschein/:branchId", element: lazy(<GiftVoucherPage />) },
    { path: "faq", element: lazy(<FaqPage />) },
    { path: "impressum", element: lazy(<ImpressumPage />) },
    { path: "datenschutz", element: lazy(<PrivacyPage />) },
    { path: "privacy", element: <Navigate to="/datenschutz" replace /> },
    { path: "agb", element: lazy(<AgbPage />) },
    { path: "terms", element: lazy(<TermsPage />) },
    { path: "widerruf", element: lazy(<WiderrufPage />) },
    { path: "loyalty-terms", element: <Navigate to="/terms" replace /> }
  ]
}

export default infoRoutes
