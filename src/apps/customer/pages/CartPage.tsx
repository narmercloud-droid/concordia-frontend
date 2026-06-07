import React from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useCartStore } from "@/store/cartStore"
import { calcDiscountedSubtotal, calcWebsiteDiscount } from "@/lib/websitePromo"
import { formatCurrency } from "@/utils/format"

export default function CartPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.total())
  const websiteDiscount = calcWebsiteDiscount(subtotal)
  const discountedSubtotal = calcDiscountedSubtotal(subtotal)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)

  if (items.length === 0) {
    return (
      <div className="customer-page">
        <h2 className="customer-title">{t("cart.title")}</h2>
        <p className="customer-text">{t("cart.empty")}</p>
      </div>
    )
  }

  return (
    <div className="customer-page">
      <h2 className="customer-title">{t("cart.title")}</h2>

      {items.map((i) => (
        <div key={i.cartKey} className="customer-card">
          <h4 className="customer-card__title">{i.name}</h4>
          {i.variants.length > 0 && (
            <p className="customer-card__meta">{i.variants.map((v) => v.name).join(", ")}</p>
          )}
          {i.addOns.length > 0 && (
            <p className="customer-card__meta">
              {t("common.extras")}:{" "}
              {i.addOns.map((a) => `${a.name} (+${formatCurrency(a.price)})`).join(", ")}
            </p>
          )}
          {i.notes && (
            <p className="customer-card__meta">
              {t("common.note")}: {i.notes}
            </p>
          )}
          <p className="customer-card__price">
            {i.quantity} × {formatCurrency(i.unitPrice)} = {formatCurrency(i.quantity * i.unitPrice)}
          </p>
          <button type="button" className="customer-btn" onClick={() => removeItem(i.cartKey)}>
            {t("common.remove")}
          </button>
        </div>
      ))}

      <p className="customer-total-line">
        {t("common.subtotal")}: {formatCurrency(subtotal)}
      </p>
      {websiteDiscount > 0 && (
        <p className="customer-hint" style={{ color: "var(--c-success)" }}>
          {t("checkout.websiteDiscountApplied", {
            percent: 10,
            amount: formatCurrency(websiteDiscount)
          })}
        </p>
      )}
      {websiteDiscount > 0 && (
        <p className="customer-total-line">
          {t("cart.afterDiscount")}: {formatCurrency(discountedSubtotal)}
        </p>
      )}

      <div className="customer-btn-row">
        <button type="button" className="customer-btn" onClick={clearCart}>
          {t("cart.clear")}
        </button>
        <button
          type="button"
          className="customer-btn customer-btn--primary"
          onClick={() => navigate("/customer/checkout")}
        >
          {t("cart.checkout")}
        </button>
      </div>
    </div>
  )
}
