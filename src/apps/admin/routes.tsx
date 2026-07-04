import React, { Suspense } from "react"
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
const PlatformSettingsPage = React.lazy(() => import("./pages/PlatformSettingsPage.js"))
const BranchOffersPage = React.lazy(() => import("./pages/BranchOffersPage.js"))
const AnalyticsPage = React.lazy(() => import("./pages/AnalyticsPage.js"))
const ReportsPage = React.lazy(() => import("./pages/ReportsPage.js"))
const ReviewsPage = React.lazy(() => import("./pages/ReviewsPage.js"))
const SMSCampaignPage = React.lazy(() => import("./pages/SMSCampaignPage.js"))
import AdminProtectedRoute from "@/router/AdminProtectedRoute"
import AdminPermissionRoute, { AdminHomeRedirect } from "@/router/AdminPermissionRoute"

const lazySection = (element: React.ReactElement) => (
  <Suspense fallback={<div>Loading…</div>}>{element}</Suspense>
)

const guard = (permission: string, page: React.ReactElement) =>
  lazySection(<AdminPermissionRoute permission={permission}>{page}</AdminPermissionRoute>)

const guardSuper = (page: React.ReactElement) =>
  lazySection(<AdminPermissionRoute superAdminOnly>{page}</AdminPermissionRoute>)

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
        { index: true, element: <AdminHomeRedirect /> },
        { path: "dashboard", element: guard("dashboard", <DashboardPage />) },
        { path: "reports", element: guard("dashboard", <ReportsPage />) },
        { path: "analytics", element: guard("dashboard", <AnalyticsPage />) },
        { path: "menu", element: guard("menu_view", <MenuPage />) },
        { path: "orders", element: guard("orders", <OrdersPage />) },
        { path: "hours", element: guard("hours_view", <HoursPage />) },
        { path: "delivery", element: guard("delivery_view", <DeliveryAreasPage />) },
        { path: "customers", element: guard("customers_view", <CustomersPage />) },
        { path: "sms", element: guard("customers_automation", <SMSCampaignPage />) },
        { path: "reviews", element: guard("reviews_view", <ReviewsPage />) },
        { path: "offers", element: guard("offers_view", <BranchOffersPage />) },
        { path: "staff", element: guardSuper(<StaffPage />) },
        { path: "permissions", element: guardSuper(<PermissionsPage />) },
        { path: "platform-settings", element: guardSuper(<PlatformSettingsPage />) }
      ]
    }
  ]
}

export default adminRoutes
