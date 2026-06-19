import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useCartStore } from "@/store/cartStore"
import { calcDiscountedSubtotal, calcWebsiteDiscount } from "@/lib/websitePromo"
import { usePlatformPromo } from "@/hooks/usePlatformPromo"
import { useQuery } from "@tanstack/react-query"
import { getBranches } from "@/api/customer"
import { formatCurrency } from "@/utils/format"
import ItemOptionsModal from "@/apps/customer/components/ItemOptionsModal"
import CartSuggestionsModal, {
  type SuggestionItem
} from "@/apps/customer/components/CartSuggestionsModal"

export default function CartPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.total())
  const branchId = items[0]?.branchId ?? ""
  const platformPromo = usePlatformPromo()
  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    enabled: !!branchId
  })
  const branchPromo = branches?.find((b: { id: string }) => b.id === branchId)?.promotions
  const discountPct =
    branchPromo?.websiteDiscountEnabled !== false ? platformPromo.websiteOrderDiscountPct : 0
  const websiteDiscount = calcWebsiteDiscount(subtotal, discountPct)
  const discountedSubtotal = calcDiscountedSubtotal(subtotal, discountPct)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)

  const cartItemIds = useMemo(() => items.map((i) => i.id), [items])
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [selectedItem, setSelectedItem] = useState<SuggestionItem | null>(null)

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
        <div key={i.cartKey} className="customer-card cart-line">
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
            {formatCurrency(i.unitPrice)} {t("item.each")}
          </p>

          <div className="cart-line__actions">
            <div className="item-options__qty">
              <label className="customer-label">{t("common.quantity")}</label>
              <div className="item-options__qty-controls">
                <button
                  type="button"
                  className="item-options__qty-btn"
                  onClick={() => updateQuantity(i.cartKey, i.quantity - 1)}
                  aria-label={t("item.decreaseQty")}
                >
                  −
                </button>
                <span className="item-options__qty-value">{i.quantity}</span>
                <button
                  type="button"
                  className="item-options__qty-btn"
                  onClick={() => updateQuantity(i.cartKey, i.quantity + 1)}
                  aria-label={t("item.increaseQty")}
                  disabled={i.quantity >= 20}
                >
                  +
                </button>
              </div>
            </div>
            <p className="cart-line__line-total">
              {formatCurrency(i.quantity * i.unitPrice)}
            </p>
          </div>

          <div className="customer-btn-row cart-line__buttons">
            <button
              type="button"
              className="customer-btn"
              onClick={() =>
                navigate(`/branch/${i.branchId}/item/${i.id}?edit=${encodeURIComponent(i.cartKey)}`)
              }
            >
              {t("cart.edit")}
            </button>
            <button type="button" className="customer-btn" onClick={() => removeItem(i.cartKey)}>
              {t("common.remove")}
            </button>
          </div>
        </div>
      ))}

      <p className="customer-total-line">
        {t("common.subtotal")}: {formatCurrency(subtotal)}
      </p>
      {websiteDiscount > 0 && (
        <p className="customer-hint" style={{ color: "var(--c-success)" }}>
          {t("checkout.websiteDiscountApplied", {
            percent: discountPct,
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

      {branchId && showSuggestions && !selectedItem && (
        <CartSuggestionsModal
          open={showSuggestions}
          branchId={branchId}
          excludeItemIds={cartItemIds}
          onClose={() => setShowSuggestions(false)}
          continueLabel={t("cart.suggestionsContinueCart")}
          onContinue={() => setShowSuggestions(false)}
          onSelectItem={(item) => {
            setShowSuggestions(false)
            setSelectedItem(item)
          }}
        />
      )}

      {branchId && selectedItem && (
        <ItemOptionsModal
          open={!!selectedItem}
          branchId={branchId}
          itemId={selectedItem.id}
          itemName={selectedItem.name}
          itemNumber={selectedItem.itemNumber}
          categoryName={selectedItem.categoryName ?? ""}
          description={selectedItem.description}
          imageUrl={selectedItem.imageUrl}
          onClose={() => setSelectedItem(null)}
          onAdded={() => {
            setSelectedItem(null)
            setShowSuggestions(true)
          }}
        />
      )}
    </div>
  )
}
