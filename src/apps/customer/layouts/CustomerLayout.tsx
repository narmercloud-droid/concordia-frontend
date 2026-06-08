import React, { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import ConcordiaLogo from "@/apps/customer/components/ConcordiaLogo"
import LanguageSwitcher from "@/apps/customer/components/LanguageSwitcher"
import { useAuthStore } from "@/context/authStore"
import { useCartStore } from "@/store/cartStore"
import { subscribeToPush } from "@/utils/pushNotifications"
import SiteNav from "@/apps/customer/components/SiteNav"
import CustomerErrorBoundary from "@/apps/customer/components/CustomerErrorBoundary"
import { WIDE_CUSTOMER_PATHS } from "@/lib/infoPages"
import "../customer.css"
import "../customer-mobile.css"

export default function CustomerLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const [pushDenied, setPushDenied] = useState(false)
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const authUser = useAuthStore((s) => s.user)
  const authToken = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const isLoggedIn = !!authToken && !!authUser?.id
  const onCartPage = location.pathname === "/customer/cart"
  const isWidePage = WIDE_CUSTOMER_PATHS.has(location.pathname)
  const showSiteNav = !location.pathname.startsWith("/customer/checkout")

  useEffect(() => {
    if (!("Notification" in window)) return

    if (Notification.permission === "denied") {
      setPushDenied(true)
      return
    }

    const run = () => {
      subscribeToPush().catch(() => {})
    }
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 5000 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = window.setTimeout(run, 2500)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div
      className={`customer-shell customer-shell--layout${
        isWidePage ? " customer-shell--home customer-shell--wide" : ""
      }`}
    >
      <header className="customer-header">
        <Link to="/" className="customer-header__brand">
          <ConcordiaLogo size="sm" />
        </Link>
        <div className="customer-header__actions">
          <LanguageSwitcher />
          {isLoggedIn ? (
            <>
              <Link to="/customer/orders" className="customer-header__account">
                {authUser.name?.split(" ")[0] ?? t("layout.account")}
              </Link>
              <button
                type="button"
                className="customer-header__logout"
                onClick={() => logout()}
              >
                {t("layout.logout")}
              </button>
            </>
          ) : (
            <Link to="/customer/login" className="customer-header__account">
              {t("layout.login")}
            </Link>
          )}
          <Link
            to="/customer/cart"
            className={`customer-cart-link${onCartPage ? " customer-cart-link--active" : ""}`}
          >
            {itemCount > 0 ? t("layout.cartWithCount", { count: itemCount }) : t("layout.cart")}
          </Link>
        </div>
      </header>

      {showSiteNav && (
        <div className="customer-site-nav-wrap">
          <SiteNav />
        </div>
      )}

      {pushDenied && (
        <div className="customer-alert customer-alert--warn">{t("layout.notificationsDisabled")}</div>
      )}

      <main style={{ marginTop: 20 }}>
        <CustomerErrorBoundary>
        <Outlet />
      </CustomerErrorBoundary>
      </main>
    </div>
  )
}
