import React, { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Link, Outlet, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import ConcordiaLogo from "@/apps/customer/components/ConcordiaLogo"
import LanguageSwitcher from "@/apps/customer/components/LanguageSwitcher"
import { useAuthStore } from "@/context/authStore"
import { useCartStore } from "@/store/cartStore"
import { isPushConfigured, subscribeToPush } from "@/utils/pushNotifications"
import { isNativeApp } from "@/lib/nativeApp"
import SiteNav from "@/apps/customer/components/SiteNav"
import StickyOrderFab from "@/apps/customer/components/StickyOrderFab"
import NativeTabBar from "@/apps/customer/components/NativeTabBar"
import NativeCartButton from "@/apps/customer/components/NativeCartButton"
import NativeCartBar from "@/apps/customer/components/NativeCartBar"
import NativePromoStrip from "@/apps/customer/components/NativePromoStrip"
import OfferNotificationsPrompt from "@/apps/customer/components/OfferNotificationsPrompt"
import CookieConsent from "@/apps/customer/components/CookieConsent"
import CustomerErrorBoundary from "@/apps/customer/components/CustomerErrorBoundary"
import { WIDE_CUSTOMER_PATHS } from "@/lib/infoPages"
import "../customer.css"
import "../customer-mobile.css"
import "../customer-native.css"

export default function CustomerLayout() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const location = useLocation()
  const [pushDenied, setPushDenied] = useState(false)
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const authUser = useAuthStore((s) => s.user)
  const authToken = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const isLoggedIn = !!authToken && !!authUser?.id
  const nativeApp = isNativeApp()
  const onCartPage = location.pathname === "/customer/cart"
  const onCheckoutPage = location.pathname.startsWith("/customer/checkout")
  const showCartBar =
    nativeApp &&
    itemCount > 0 &&
    !onCheckoutPage &&
    (location.pathname.startsWith("/branch/") || onCartPage)
  const isWidePage = WIDE_CUSTOMER_PATHS.has(location.pathname)
  const showSiteNav = !location.pathname.startsWith("/customer/checkout") && !nativeApp

  useEffect(() => {
    const onLanguageChanged = () => {
      queryClient.invalidateQueries({ queryKey: ["branchMenu"] })
      queryClient.invalidateQueries({ queryKey: ["branchBestsellers"] })
      queryClient.invalidateQueries({ queryKey: ["itemDetails"] })
    }
    i18n.on("languageChanged", onLanguageChanged)
    return () => i18n.off("languageChanged", onLanguageChanged)
  }, [i18n, queryClient])

  useEffect(() => {
    if (!isPushConfigured() || !("Notification" in window)) return

    if (Notification.permission === "denied") {
      setPushDenied(true)
      return
    }

    if (Notification.permission === "granted") {
      void subscribeToPush({ allowOffers: true, allowOrders: true, syncBackend: true })
      return
    }
  }, [])

  return (
    <div
      className={`customer-shell customer-shell--layout${
        nativeApp ? " customer-shell--native" : ""
      }${showCartBar ? " native-app--has-cart-bar" : ""}${
        onCheckoutPage ? " customer-shell--checkout" : ""
      }${isWidePage ? " customer-shell--home customer-shell--wide" : ""}`}
    >
      <header className={`customer-header${nativeApp ? " customer-header--native" : ""}`}>
        <Link to="/" className="customer-header__brand">
          <ConcordiaLogo size="sm" variant="lockup" />
        </Link>
        <div className="customer-header__actions">
          <LanguageSwitcher />
          {!nativeApp && isLoggedIn ? (
            <>
              <Link to="/customer/settings" className="customer-header__account">
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
          ) : null}
          {!nativeApp && !isLoggedIn ? (
            <Link to="/customer/login" className="customer-header__account">
              {t("layout.login")}
            </Link>
          ) : null}
          {nativeApp ? (
            <NativeCartButton itemCount={itemCount} active={onCartPage} />
          ) : (
            <Link
              to="/customer/cart"
              className={`customer-cart-link${onCartPage ? " customer-cart-link--active" : ""}`}
            >
              {itemCount > 0 ? t("layout.cartWithCount", { count: itemCount }) : t("layout.cart")}
            </Link>
          )}
        </div>
      </header>

      {nativeApp && location.pathname === "/" ? <NativePromoStrip /> : null}
      {!nativeApp && location.pathname === "/" ? <OfferNotificationsPrompt /> : null}

      {showSiteNav && (
        <div className="customer-site-nav-wrap">
          <SiteNav />
        </div>
      )}

      {pushDenied && (
        <div className="customer-alert customer-alert--warn">{t("layout.notificationsDisabled")}</div>
      )}

      <main style={{ marginTop: 20 }}>
        <CustomerErrorBoundary resetKey={location.pathname}>
          <Outlet />
        </CustomerErrorBoundary>
      </main>

      {location.pathname === "/" && !nativeApp ? <StickyOrderFab /> : null}
      <NativeCartBar />
      <NativeTabBar />
      <CookieConsent />
    </div>
  )
}
