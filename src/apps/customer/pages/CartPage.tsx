import React from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useCartStore } from "@/store/cartStore"
import { formatCurrency } from "@/utils/format"

export default function CartPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
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
        {t("common.subtotal")}: {formatCurrency(total)}
      </p>

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
