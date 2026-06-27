import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { getCartSuggestions } from "@/api/customer"
import { dishImageForName } from "@/lib/foodImagery"
import { formatCurrency } from "@/utils/format"
import "./ItemOptionsModal.css"
import "./CartSuggestionsModal.css"

export type SuggestionItem = {
  id: number
  name: string
  itemNumber?: string | null
  price: number
  description?: string | null
  imageUrl?: string | null
  categoryName?: string
}

type Props = {
  open: boolean
  branchId: string
  excludeItemIds: number[]
  addingItemId?: number | null
  onClose: () => void
  onQuickAdd: (item: SuggestionItem) => void | Promise<void>
  continueLabel?: string
  onContinue?: () => void
}

function isDrinkSuggestion(item: SuggestionItem) {
  const text = `${item.categoryName ?? ""} ${item.name}`.toLowerCase()
  return /getränk|drink|cola|sprite|fanta|wasser|uludag|lift|spritzer|durstl|0,33|0.33|1,0|1\.0|mehrweg/.test(
    text
  )
}

function SuggestionGrid({
  items,
  onQuickAdd,
  addLabel,
  addingLabel,
  addingItemId
}: {
  items: SuggestionItem[]
  onQuickAdd: (item: SuggestionItem) => void | Promise<void>
  addLabel: string
  addingLabel: string
  addingItemId?: number | null
}) {
  if (!items.length) return null

  return (
    <div className="cart-suggestions-modal__grid">
      {items.map((item) => {
        const isDrink = isDrinkSuggestion(item)
        const isAdding = addingItemId === item.id
        return (
          <button
            key={item.id}
            type="button"
            className={`cart-suggestions-modal__item${isAdding ? " cart-suggestions-modal__item--adding" : ""}`}
            onClick={() => onQuickAdd(item)}
            disabled={addingItemId != null}
            aria-busy={isAdding}
          >
            {isDrink ? (
              <span className="cart-suggestions-modal__thumb cart-suggestions-modal__thumb--drink" aria-hidden="true">
                🥤
              </span>
            ) : (
              <span
                className="cart-suggestions-modal__thumb"
                style={{
                  backgroundImage: `url(${dishImageForName(
                    item.name,
                    item.imageUrl,
                    item.categoryName ?? "",
                    item.description
                  )})`
                }}
                aria-hidden="true"
              />
            )}
            <span className="cart-suggestions-modal__copy">
              <span className="cart-suggestions-modal__name">{item.name}</span>
              <span className="cart-suggestions-modal__price">{formatCurrency(item.price)}</span>
            </span>
            <span className="cart-suggestions-modal__add">
              {isAdding ? addingLabel : addLabel}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function CartSuggestionsModal({
  open,
  branchId,
  excludeItemIds,
  addingItemId,
  onClose,
  onQuickAdd,
  continueLabel,
  onContinue
}: Props) {
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ["cartSuggestions", branchId, excludeItemIds],
    queryFn: () => getCartSuggestions(branchId, excludeItemIds),
    enabled: open && !!branchId,
    staleTime: 60_000
  })

  const drinks = data?.drinks ?? []
  const sides = data?.sides ?? []
  const hasSuggestions = drinks.length > 0 || sides.length > 0

  useEffect(() => {
    if (!open) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || isLoading) return
    if (!hasSuggestions) onContinue?.() ?? onClose()
  }, [open, isLoading, hasSuggestions, onClose, onContinue])

  if (!open || (!isLoading && !hasSuggestions)) return null

  return (
    <div
      className="item-modal cart-suggestions-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-suggestions-title"
    >
      <button
        type="button"
        className="item-modal__backdrop"
        onClick={onContinue ?? onClose}
        aria-label={t("common.close")}
      />

      <div className="item-modal__panel cart-suggestions-modal__panel">
        <header className="cart-suggestions-modal__header">
          <div className="item-modal__head-text">
            <p className="item-modal__also-popular-label">{t("cart.suggestionsEyebrow")}</p>
            <h2 id="cart-suggestions-title" className="item-modal__title">
              {t("cart.suggestionsTitle")}
            </h2>
            <p className="customer-hint">{t("cart.suggestionsLead")}</p>
          </div>
          <button
            type="button"
            className="item-modal__close"
            onClick={onContinue ?? onClose}
            aria-label={t("common.close")}
          >
            ×
          </button>
        </header>

        <div className="cart-suggestions-modal__body">
          {isLoading ? (
            <p className="customer-loading">{t("common.loading")}</p>
          ) : (
            <>
              {drinks.length > 0 && (
                <section className="cart-suggestions-modal__section">
                  <p className="cart-suggestions-modal__section-label">{t("cart.suggestionsDrinks")}</p>
                  <SuggestionGrid
                    items={drinks}
                    onQuickAdd={onQuickAdd}
                    addLabel={t("cart.suggestionsAdd")}
                    addingLabel={t("common.processing")}
                    addingItemId={addingItemId}
                  />
                </section>
              )}
              {sides.length > 0 && (
                <section className="cart-suggestions-modal__section">
                  <p className="cart-suggestions-modal__section-label">{t("cart.suggestionsSides")}</p>
                  <SuggestionGrid
                    items={sides}
                    onQuickAdd={onQuickAdd}
                    addLabel={t("cart.suggestionsAdd")}
                    addingLabel={t("common.processing")}
                    addingItemId={addingItemId}
                  />
                </section>
              )}
            </>
          )}
        </div>

        <footer className="cart-suggestions-modal__footer">
          <button type="button" className="customer-btn customer-btn--primary" onClick={onContinue ?? onClose}>
            {continueLabel ?? t("cart.suggestionsContinue")}
          </button>
        </footer>
      </div>
    </div>
  )
}
