import React, { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useItemOptions } from "@/apps/customer/hooks/useItemOptions"
import { dishImageForName } from "@/lib/foodImagery"
import ItemOptionsFields from "./ItemOptionsFields"
import ItemOptionsFooter from "./ItemOptionsFooter"
import "./ItemOptionsModal.css"

type Props = {
  open: boolean
  branchId: string
  itemId: number
  itemName: string
  itemNumber?: string | null
  categoryName?: string
  description?: string | null
  imageUrl?: string | null
  menuItem?: Record<string, unknown> | null
  onClose: () => void
  onAdded: (itemName: string) => void
}

export default function ItemOptionsModal({
  open,
  branchId,
  itemId,
  itemName,
  itemNumber,
  categoryName = "",
  description = null,
  imageUrl,
  menuItem,
  onClose,
  onAdded
}: Props) {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)
  const options = useItemOptions(branchId, itemId, undefined, menuItem)

  useEffect(() => {
    if (open) options.reset()
  }, [open, itemId])

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

  const image = dishImageForName(itemName, imageUrl, categoryName, description)

  const handleAdd = () => {
    const ok = options.addToCart(() => {
      onAdded(itemName)
      onClose()
    })
    if (!ok) return
  }

  return (
    <div className="item-modal" role="dialog" aria-modal="true" aria-labelledby="item-modal-title">
      <button
        type="button"
        className="item-modal__backdrop"
        onClick={onClose}
        aria-label={t("common.close")}
      />

      <div className="item-modal__panel" ref={panelRef}>
        <header className="item-modal__header">
          <div
            className="item-modal__thumb"
            style={{ backgroundImage: `url(${image})` }}
            aria-hidden="true"
          />
          <div className="item-modal__head-text">
            {itemNumber && <span className="item-modal__number">Nr. {itemNumber}</span>}
            <h2 id="item-modal-title" className="item-modal__title">
              {itemName}
            </h2>
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
          {options.isLoading ? (
            <p className="customer-loading">{t("item.loading")}</p>
          ) : options.isError || !options.item ? (
            <div>
              <p className="customer-hint" style={{ color: "#b45309" }}>
                {t("item.loadError")}
              </p>
              <button
                type="button"
                className="customer-btn"
                onClick={() => void options.refetchItem()}
              >
                {t("common.retry")}
              </button>
            </div>
          ) : (
            <ItemOptionsFields options={options} compact showTitle={false} />
          )}
        </div>

        {!options.isLoading && options.item && (
          <ItemOptionsFooter options={options} onAdd={handleAdd} compact />
        )}
      </div>
    </div>
  )
}
