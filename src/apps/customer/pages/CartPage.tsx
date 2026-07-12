import React, { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useCartStore } from "@/store/cartStore"
import { calcDiscountedSubtotal, calcWebsiteDiscount } from "@/lib/websitePromo"
import { usePlatformPromo } from "@/hooks/usePlatformPromo"
import { useQuery } from "@tanstack/react-query"
import { getBranchDeliveryAreas } from "@/api/customer"
import { BRANCHES_QUERY_KEY, branchesQueryOptions } from "@/lib/branchesQuery"
import { formatCurrency } from "@/utils/format"
import { quickAddItemToCart } from "@/utils/quickAddToCart"
import ItemOptionsModal from "@/apps/customer/components/ItemOptionsModal"
import CheckoutLegalFooter from "@/apps/customer/components/CheckoutLegalFooter"
import PriceVatNote from "@/apps/customer/components/PriceVatNote"
import WebsiteDiscountBanner from "@/apps/customer/components/WebsiteDiscountBanner"
import FulfillmentPicker from "@/apps/customer/components/FulfillmentPicker"
import CartSuggestionsModal, {
  type SuggestionItem
} from "@/apps/customer/components/CartSuggestionsModal"
import {
  loadFulfillmentIntent,
  saveFulfillmentIntent,
  type FulfillmentIntent
} from "@/lib/fulfillmentIntent"
import { estimateCartDisplay } from "@/lib/cartEstimate"

export default function CartPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.total())
  const branchId = items[0]?.branchId ?? ""
  const platformPromo = usePlatformPromo()
  const { data: branches } = useQuery({
    queryKey: BRANCHES_QUERY_KEY,
    ...branchesQueryOptions,
    enabled: !!branchId
  })
  const { data: deliveryInfo } = useQuery({
    queryKey: ["deliveryAreas", branchId],
    queryFn: () => getBranchDeliveryAreas(branchId),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const branch = branches?.find(
    (b: { id: string; name?: string; city?: string; supportsDelivery?: boolean; supportsPickup?: boolean }) =>
      b.id === branchId
  )

  const [fulfillment, setFulfillment] = useState<FulfillmentIntent>(() =>
    branchId ? loadFulfillmentIntent(branchId) ?? "delivery" : "delivery"
  )

  const handleFulfillmentChange = (next: FulfillmentIntent) => {
    setFulfillment(next)
    if (branchId) saveFulfillmentIntent(branchId, next)
  }

  const freeDeliveryGap = useMemo(() => {
    if (fulfillment !== "delivery") return null
    const zones = deliveryInfo?.radiusZones ?? []
    if (!zones.length) return null
    const gaps = zones
      .map((zone) => {
        const threshold =
          zone.freeDeliveryMinimum ??
          (deliveryInfo?.freeDeliveryAtMinimum !== false ? zone.minimumOrder : null)
        if (threshold == null || subtotal >= threshold) return null
        return Math.round((threshold - subtotal) * 100) / 100
      })
      .filter((gap): gap is number => gap != null && gap > 0)
    return gaps.length ? Math.min(...gaps) : null
  }, [deliveryInfo, subtotal, fulfillment])

  const branchPromo = branch?.promotions
  const discountPct =
    branchPromo?.websiteDiscountEnabled !== false ? platformPromo.websiteOrderDiscountPct : 0
  const websiteDiscount = calcWebsiteDiscount(subtotal, discountPct)
  const discountedSubtotal = calcDiscountedSubtotal(subtotal, discountPct)

  const estimate = useMemo(
    () =>
      estimateCartDisplay({
        subtotal,
        discountPct,
        fulfillment,
        zones: deliveryInfo?.radiusZones ?? []
      }),
    [subtotal, discountPct, fulfillment, deliveryInfo?.radiusZones]
  )

  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const addItem = useCartStore((s) => s.addItem)

  const cartItemIds = useMemo(() => items.map((i) => i.id), [items])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [addingItemId, setAddingItemId] = useState<number | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestionItem | null>(null)
  const [editLine, setEditLine] = useState<(typeof items)[number] | null>(null)

  const goToCheckout = () => navigate("/customer/checkout")

  const handleQuickAdd = async (item: SuggestionItem) => {
    if (!branchId || addingItemId != null) return

    setAddingItemId(item.id)
    try {
      const result = await quickAddItemToCart(branchId, item.id, addItem)
      if (result === "needs_options") {
        setSelectedSuggestion(item)
      }
    } finally {
      setAddingItemId(null)
    }
  }

  const branchLabel =
    branch?.name?.replace(/^Concordia\s+/i, "").trim() || branch?.city || ""

  if (items.length === 0) {
    return (
      <div className="customer-page">
        <h2 className="customer-title">{t("cart.title")}</h2>
        <p className="customer-text">{t("cart.empty")}</p>
        <div className="customer-btn-row" style={{ marginTop: 16 }}>
          <Link to="/" className="customer-btn customer-btn--primary">
            {t("cart.backToMenu")}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-page customer-page--cart">
      <h2 className="customer-title">{t("cart.title")}</h2>
      {branchLabel && (
        <p className="customer-hint cart-page__branch">
          {t("cart.branchLabel", { branch: branchLabel })}
        </p>
      )}

      <div className="customer-card cart-page__fulfillment">
        <p className="customer-hint" style={{ margin: "0 0 10px" }}>
          {t("menu.fulfillmentLead")}
        </p>
        <FulfillmentPicker
          value={fulfillment}
          onChange={handleFulfillmentChange}
          supportsDelivery={branch?.supportsDelivery !== false}
          supportsPickup={branch?.supportsPickup !== false}
          compact
        />
      </div>

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
              onClick={() => setEditLine(i)}
            >
              {t("cart.edit")}
            </button>
            <button type="button" className="customer-btn" onClick={() => removeItem(i.cartKey)}>
              {t("common.remove")}
            </button>
          </div>
        </div>
      ))}

      <div className="cart-summary">
        <p className="customer-total-line cart-summary__subtotal">
          {t("common.subtotal")}: {formatCurrency(subtotal)}
        </p>

        {websiteDiscount > 0 && (
          <WebsiteDiscountBanner percent={discountPct} amount={websiteDiscount} />
        )}

        {fulfillment === "delivery" && estimate.estimatedDeliveryFee != null && (
          <p className="customer-hint cart-summary__delivery-estimate">
            {t("cart.deliveryEstimate", {
              fee: formatCurrency(estimate.estimatedDeliveryFee)
            })}
          </p>
        )}

        <div className="cart-summary__total">
          <span className="cart-summary__total-label">
            {fulfillment === "delivery" ? t("cart.estimatedTotal") : t("common.total")}
          </span>
          <div className="cart-summary__total-prices">
            {websiteDiscount > 0 && (
              <span className="cart-summary__original">{formatCurrency(subtotal)}</span>
            )}
            <span className="cart-summary__final">
              {fulfillment === "delivery"
                ? formatCurrency(estimate.estimatedTotal)
                : formatCurrency(discountedSubtotal)}
            </span>
          </div>
        </div>

        {fulfillment === "delivery" && (
          <p className="customer-hint cart-summary__delivery-note">{t("cart.deliveryFinalNote")}</p>
        )}
      </div>

      {freeDeliveryGap != null && (
        <div className="customer-hint customer-alert customer-alert--info">
          <p style={{ margin: 0 }}>
            {t("cart.freeDeliveryNudge", { amount: formatCurrency(freeDeliveryGap) })}
          </p>
          {branchId && (
            <Link
              to={`/branch/${branchId}?fulfillment=delivery`}
              className="customer-btn"
              style={{ marginTop: 8, display: "inline-block" }}
            >
              {t("checkout.freeDeliveryAddItems")}
            </Link>
          )}
        </div>
      )}

      <button
        type="button"
        className="customer-btn"
        onClick={() => setSuggestionsOpen(true)}
      >
        {t("cart.addDrinks")}
      </button>

      <div className="customer-btn-row cart-page__actions">
        <button type="button" className="customer-btn" onClick={clearCart}>
          {t("cart.clear")}
        </button>
        <button
          type="button"
          className="customer-btn customer-btn--primary"
          onClick={goToCheckout}
        >
          {t("cart.checkout")}
        </button>
      </div>
      <PriceVatNote className="customer-hint cart-vat-note" />
      <CheckoutLegalFooter />

      {branchId && suggestionsOpen && (
        <CartSuggestionsModal
          open={!selectedSuggestion}
          branchId={branchId}
          excludeItemIds={cartItemIds}
          addingItemId={addingItemId}
          onClose={() => setSuggestionsOpen(false)}
          continueLabel={t("cart.suggestionsContinueCart")}
          onContinue={() => setSuggestionsOpen(false)}
          onQuickAdd={handleQuickAdd}
        />
      )}

      {branchId && selectedSuggestion && (
        <ItemOptionsModal
          open={!!selectedSuggestion}
          branchId={branchId}
          itemId={selectedSuggestion.id}
          itemName={selectedSuggestion.name}
          itemNumber={selectedSuggestion.itemNumber}
          categoryName={selectedSuggestion.categoryName ?? ""}
          description={selectedSuggestion.description}
          imageUrl={selectedSuggestion.imageUrl}
          onClose={() => setSelectedSuggestion(null)}
          onAdded={() => setSelectedSuggestion(null)}
        />
      )}

      {branchId && editLine && (
        <ItemOptionsModal
          open={!!editLine}
          branchId={branchId}
          itemId={editLine.id}
          itemName={editLine.name}
          editCartKey={editLine.cartKey}
          onClose={() => setEditLine(null)}
          onAdded={() => setEditLine(null)}
        />
      )}
    </div>
  )
}
