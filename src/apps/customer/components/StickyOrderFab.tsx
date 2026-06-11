import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import OrderNowLink from "@/apps/customer/components/OrderNowLink"
import { BRANCH_CHOICE_SECTION_ID } from "@/lib/scrollToBranchChoice"

export default function StickyOrderFab() {
  const { t } = useTranslation()
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (location.pathname !== "/") {
      setVisible(false)
      return
    }

    const update = () => {
      const order = document.getElementById(BRANCH_CHOICE_SECTION_ID)
      const pastHero = window.scrollY > 280
      const orderOnScreen = order
        ? order.getBoundingClientRect().top < window.innerHeight * 0.72
        : false
      setVisible(pastHero && !orderOnScreen)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [location.pathname])

  if (!visible) return null

  return (
    <OrderNowLink className="sticky-order-fab" aria-label={t("home.orderNow")}>
      {t("home.orderNow")}
    </OrderNowLink>
  )
}
