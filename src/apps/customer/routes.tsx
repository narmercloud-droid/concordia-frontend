import React, { Suspense } from "react"
import { Navigate } from "react-router-dom"
import { lazyWithRetry } from "@/lib/lazyWithRetry"
import CustomerLayout from "./layouts/CustomerLayout.js"
import AuthLayout from "./layouts/AuthLayout.js"
const BranchMenuPage = lazyWithRetry(() => import("./pages/BranchMenuPage.js"))
const BranchCheckoutEntry = lazyWithRetry(() => import("./pages/BranchCheckoutEntry.js"))
const ItemDetailsPage = lazyWithRetry(() => import("./pages/ItemDetailsPage.js"))
const CartPage = lazyWithRetry(() => import("./pages/CartPage.js"))
const CheckoutPage = lazyWithRetry(() => import("./pages/CheckoutPage.js"))
const OrderTrackingPage = lazyWithRetry(() => import("./pages/OrderTrackingPage.js"))
const LoginPage = lazyWithRetry(() => import("./pages/LoginPage.js"))
const RegisterPage = lazyWithRetry(() => import("./pages/RegisterPage.js"))
const CouponsPage = lazyWithRetry(() => import("./pages/CouponsPage.js"))
const OrderDetailsPage = lazyWithRetry(() => import("./pages/OrderDetailsPage.js"))
const CustomerSettingsPage = lazyWithRetry(() => import("./pages/CustomerSettingsPage.js"))
import LoadingFallback from "./components/LoadingFallback.js"
import ProtectedRoute from "@/router/ProtectedRoute"
import {
  RedirectCustomerBranch,
  RedirectCustomerBranchItem,
  RedirectLegacyMenu,
  RedirectLegacyMenuCategory,
  RedirectLegacyMenuItem
} from "./branchRedirects.js"

const lazySection = (element: React.ReactElement) => (
  <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
)

export const branchRoutes = {
  path: "/branch",
  element: <CustomerLayout />,
  children: [
    { path: ":branchId", element: lazySection(<BranchMenuPage />) },
    { path: ":branchId/checkout", element: lazySection(<BranchCheckoutEntry />) },
    { path: ":branchId/item/:itemId", element: lazySection(<ItemDetailsPage />) }
  ]
}

export const customerRoutes = {
  path: "/customer",
  children: [
    {
      path: "login",
      element: <AuthLayout />,
      children: [{ path: "", element: lazySection(<LoginPage />) }]
    },
    {
      path: "register",
      element: <AuthLayout />,
      children: [{ path: "", element: lazySection(<RegisterPage />) }]
    },
    {
      path: "",
      element: <CustomerLayout />,
      children: [
        { path: "", element: <Navigate to="/" replace /> },
        { path: "branch/:branchId", element: <RedirectCustomerBranch /> },
        {
          path: "branch/:branchId/item/:itemId",
          element: <RedirectCustomerBranchItem />
        },
        { path: "cart", element: lazySection(<CartPage />) },
        { path: "checkout", element: lazySection(<CheckoutPage />) },
        {
          path: "coupons",
          element: lazySection(<CouponsPage />)
        },
        { path: "order/:orderId", element: lazySection(<OrderTrackingPage />) },
        { path: "menu", element: <RedirectLegacyMenu /> },
        { path: "menu/:categoryId", element: <RedirectLegacyMenuCategory /> },
        { path: "menu/item/:itemId", element: <RedirectLegacyMenuItem /> },
        {
          path: "orders/history",
          element: <Navigate to="/customer/orders" replace />
        },
        {
          path: "orders/:orderId",
          element: (
            <ProtectedRoute>
              {lazySection(<OrderDetailsPage />)}
            </ProtectedRoute>
          )
        },
        {
          path: "orders",
          element: (
            <ProtectedRoute>
              {lazySection(<CustomerSettingsPage />)}
            </ProtectedRoute>
          )
        },
        {
          path: "settings",
          element: (
            <ProtectedRoute>
              {lazySection(<CustomerSettingsPage />)}
            </ProtectedRoute>
          )
        }
      ]
    }
  ]
}

export default customerRoutes
