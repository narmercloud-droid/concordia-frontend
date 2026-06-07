import React, { Suspense } from "react"
import { Navigate } from "react-router-dom"
import AdminLayout from "./layouts/AdminLayout.js"
import AdminAuthLayout from "./layouts/AdminAuthLayout.js"
const AdminLoginPage = React.lazy(() => import("./pages/AdminLoginPage.js"))
const DashboardPage = React.lazy(() => import("./pages/DashboardPage.js"))
const MenuPage = React.lazy(() => import("./pages/MenuPage.js"))
const OrdersPage = React.lazy(() => import("./pages/OrdersPage.js"))
const HoursPage = React.lazy(() => import("./pages/HoursPage.js"))
const DeliveryAreasPage = React.lazy(() => import("./pages/DeliveryAreasPage.js"))
const CustomersPage = React.lazy(() => import("./pages/CustomersPage.js"))
const StaffPage = React.lazy(() => import("./pages/StaffPage.js"))
const PermissionsPage = React.lazy(() => import("./pages/PermissionsPage.js"))
const BranchOffersPage = React.lazy(() => import("./pages/BranchOffersPage.js"))
import AdminProtectedRoute from "@/router/AdminProtectedRoute"

const lazySection = (element: React.ReactElement) => (
  <Suspense fallback={<div>Loading…</div>}>{element}</Suspense>
)

export const adminRoutes = {
  path: "/admin",
  children: [
    {
      path: "login",
      element: <AdminAuthLayout />,
      children: [{ path: "", element: lazySection(<AdminLoginPage />) }]
    },
    {
      path: "",
      element: (
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      ),
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: lazySection(<DashboardPage />) },
        { path: "menu", element: lazySection(<MenuPage />) },
        { path: "orders", element: lazySection(<OrdersPage />) },
        { path: "hours", element: lazySection(<HoursPage />) },
        { path: "delivery", element: lazySection(<DeliveryAreasPage />) },
        { path: "customers", element: lazySection(<CustomersPage />) },
        { path: "offers", element: lazySection(<BranchOffersPage />) },
        { path: "staff", element: lazySection(<StaffPage />) },
        { path: "permissions", element: lazySection(<PermissionsPage />) }
      ]
    }
  ]
}

export default adminRoutes
