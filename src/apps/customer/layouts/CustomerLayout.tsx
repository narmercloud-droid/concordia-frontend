import React, { useEffect, useState } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import ConcordiaLogo from "@/apps/customer/components/ConcordiaLogo"
import LanguageSwitcher from "@/apps/customer/components/LanguageSwitcher"
import { useCartStore } from "@/store/cartStore"
import { subscribeToPush } from "@/utils/pushNotifications"
import SiteNav from "@/apps/customer/components/SiteNav"
import { WIDE_CUSTOMER_PATHS } from "@/lib/infoPages"
import "../customer.css"
import "@/apps/customer/components/InfoPages.css"

export default function CustomerLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const [pushDenied, setPushDenied] = useState(false)
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const onCartPage = location.pathname === "/customer/cart"
  const isWidePage = WIDE_CUSTOMER_PATHS.has(location.pathname)
  const showSiteNav = !location.pathname.startsWith("/customer/checkout")

  useEffect(() => {
    if (!("Notification" in window)) return

    if (Notification.permission === "denied") {
      setPushDenied(true)
      return
    }

    subscribeToPush().catch(() => {})
  }, [])

  return (
    <div
      className={`customer-shell${isWidePage ? " customer-shell--home" : ""}`}
      style={{ maxWidth: isWidePage ? 980 : 720, margin: "0 auto", padding: "24px 20px 48px" }}
    >
      <header className="customer-header">
        <Link to="/" className="customer-header__brand">
          <ConcordiaLogo size="sm" />
        </Link>
        <div className="customer-header__actions">
          <LanguageSwitcher />
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
        <Outlet />
      </main>
    </div>
  )
}
