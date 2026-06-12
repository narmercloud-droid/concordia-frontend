import React, { Suspense } from "react"
import { Navigate } from "react-router-dom"
import CustomerLayout from "./layouts/CustomerLayout.js"
import AuthLayout from "./layouts/AuthLayout.js"
const BranchMenuPage = React.lazy(() => import("./pages/BranchMenuPage.js"))
const ItemDetailsPage = React.lazy(() => import("./pages/ItemDetailsPage.js"))
const CartPage = React.lazy(() => import("./pages/CartPage.js"))
const CheckoutPage = React.lazy(() => import("./pages/CheckoutPage.js"))
const OrderTrackingPage = React.lazy(() => import("./pages/OrderTrackingPage.js"))
const LoginPage = React.lazy(() => import("./pages/LoginPage.js"))
const RegisterPage = React.lazy(() => import("./pages/RegisterPage.js"))
const MenuCategoriesPage = React.lazy(() => import("./pages/MenuCategoriesPage.js"))
const MenuItemsPage = React.lazy(() => import("./pages/MenuItemsPage.js"))
const MenuItemDetailsPage = React.lazy(() => import("./pages/MenuItemDetailsPage.js"))
const OrderDetailsPage = React.lazy(() => import("./pages/OrderDetailsPage.js"))
const OrderHistoryPage = React.lazy(() => import("./pages/OrderHistoryPage.js"))
const CustomerSettingsPage = React.lazy(() => import("./pages/CustomerSettingsPage.js"))
import LoadingFallback from "./components/LoadingFallback.js"
import ProtectedRoute from "@/router/ProtectedRoute"
import {
  RedirectCustomerBranch,
  RedirectCustomerBranchItem
} from "./branchRedirects.js"

const lazySection = (element: React.ReactElement) => (
  <Suspense fallback={<LoadingFallback />}>{element}</Suspense>
)

export const branchRoutes = {
  path: "/branch",
  element: <CustomerLayout />,
  children: [
    { path: ":branchId", element: lazySection(<BranchMenuPage />) },
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
        { path: "order/:orderId", element: lazySection(<OrderTrackingPage />) },
        { path: "menu", element: lazySection(<MenuCategoriesPage />) },
        { path: "menu/:categoryId", element: lazySection(<MenuItemsPage />) },
        { path: "menu/item/:itemId", element: lazySection(<MenuItemDetailsPage />) },
        {
          path: "orders/:orderId",
          element: (
            <ProtectedRoute>
              {lazySection(<OrderDetailsPage />)}
            </ProtectedRoute>
          )
        },
        {
          path: "orders/history",
          element: (
            <ProtectedRoute>
              {lazySection(<OrderHistoryPage />)}
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
