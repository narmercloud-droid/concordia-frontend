import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { getCartSuggestions } from "@/api/customer"
import { dishImageForName } from "@/lib/foodImagery"
import { formatCurrency } from "@/utils/format"
import "./ItemOptionsModal.css"

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
  onClose: () => void
  onSelectItem: (item: SuggestionItem) => void
  continueLabel?: string
  onContinue?: () => void
}

function SuggestionGrid({
  items,
  onSelect
}: {
  items: SuggestionItem[]
  onSelect: (item: SuggestionItem) => void
}) {
  if (!items.length) return null

  return (
    <div className="item-modal__also-popular-list">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="item-modal__also-popular-item"
          onClick={() => onSelect(item)}
        >
          <span
            className="item-modal__also-popular-thumb"
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
          <span className="item-modal__also-popular-copy">
            <span className="item-modal__also-popular-name">{item.name}</span>
            <span className="item-modal__also-popular-price">{formatCurrency(item.price)}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

export default function CartSuggestionsModal({
  open,
  branchId,
  excludeItemIds,
  onClose,
  onSelectItem,
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

  if (!open) return null

  const drinks = data?.drinks ?? []
  const sides = data?.sides ?? []
  const hasSuggestions = drinks.length > 0 || sides.length > 0

  useEffect(() => {
    if (!open || isLoading) return
    if (!hasSuggestions) onClose()
  }, [open, isLoading, hasSuggestions, onClose])

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
        onClick={onClose}
        aria-label={t("common.close")}
      />

      <div className="item-modal__panel cart-suggestions-modal__panel">
        <header className="item-modal__header cart-suggestions-modal__header">
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
            onClick={onClose}
            aria-label={t("common.close")}
          >
            ×
          </button>
        </header>

        <div className="item-modal__body">
          {isLoading ? (
            <p className="customer-loading">{t("common.loading")}</p>
          ) : (
            <>
              {drinks.length > 0 && (
                <section className="item-modal__also-popular">
                  <p className="item-modal__also-popular-label">{t("cart.suggestionsDrinks")}</p>
                  <SuggestionGrid items={drinks} onSelect={onSelectItem} />
                </section>
              )}
              {sides.length > 0 && (
                <section className="item-modal__also-popular">
                  <p className="item-modal__also-popular-label">{t("cart.suggestionsSides")}</p>
                  <SuggestionGrid items={sides} onSelect={onSelectItem} />
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
