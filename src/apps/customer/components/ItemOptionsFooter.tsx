import React from "react"
import { useItemOptions } from "@/apps/customer/hooks/useItemOptions"
import { formatCurrency } from "@/utils/format"

type HookReturn = ReturnType<typeof useItemOptions>

type Props = {
  options: HookReturn
  onAdd: () => void
  compact?: boolean
  editMode?: boolean
}

export default function ItemOptionsFooter({ options, onAdd, compact = false, editMode = false }: Props) {
  const { qty, setQty, unitPrice, error, t } = options

  return (
    <div className={`item-options__footer${compact ? " item-options__footer--compact" : ""}`}>
      <div className={`item-options__footer-row${compact ? " item-options__footer-row--compact" : ""}`}>
        <div className="item-options__qty">
          <label className="customer-label">{t("common.quantity")}</label>
          <div className="item-options__qty-controls">
            <button
              type="button"
              className="item-options__qty-btn"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label={t("item.decreaseQty")}
            >
              −
            </button>
            <span className="item-options__qty-value">{qty}</span>
            <button
              type="button"
              className="item-options__qty-btn"
              onClick={() => setQty((q) => Math.min(20, q + 1))}
              aria-label={t("item.increaseQty")}
            >
              +
            </button>
          </div>
        </div>
        <div className="item-options__total">
          <span className="item-options__total-label">{t("item.total")}</span>
          <span className="item-options__total-price">{formatCurrency(unitPrice * qty)}</span>
          {qty > 1 && (
            <span className="item-options__unit-hint">
              {formatCurrency(unitPrice)} {t("item.each")}
            </span>
          )}
        </div>
      </div>

      {error && <p className="customer-error">{error}</p>}

      <button type="button" onClick={onAdd} className="customer-btn customer-btn--primary item-options__add-btn">
        {editMode ? t("item.updateCart") : t("item.addToCart")}
      </button>
    </div>
  )
}
