import React, { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getItemDetails } from "@/api/customer"
import { useCartStore, type CartSelection } from "@/store/cartStore"
import { findSizeVariantName, getAddOnDisplayPrice } from "@/utils/extraPricing"
import { formatCurrency } from "@/utils/format"

type Option = {
  id: string
  name: string
  price: number
  included?: boolean
  pricesBySize?: Record<string, number> | null
}

type OptionGroup = {
  id: string
  name: string
  required: boolean
  minSelect: number
  maxSelect: number
  included?: boolean
  options: Option[]
}

export default function ItemDetailsPage() {
  const { t } = useTranslation()
  const { branchId, itemId } = useParams()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState("")
  const [variantChoices, setVariantChoices] = useState<Record<string, string>>({})
  const [addOnChoices, setAddOnChoices] = useState<Record<string, string[]>>({})
  const [error, setError] = useState("")
  const addItem = useCartStore((s) => s.addItem)

  const { data: item } = useQuery({
    queryKey: ["itemDetails", branchId, itemId],
    queryFn: () => getItemDetails(branchId!, itemId!),
    enabled: !!branchId && !!itemId
  })

  const variantGroups: OptionGroup[] = item?.variantGroups ?? []
  const addOnGroups: OptionGroup[] = item?.addOnGroups ?? []
  const sizeBasedExtras = item?.extraPricing?.sizeBased === true

  const selectedSizeName = useMemo(
    () => findSizeVariantName(variantGroups, variantChoices),
    [variantGroups, variantChoices]
  )

  const includedGroups = variantGroups.filter((g) => g.included)
  const paidVariantGroups = variantGroups.filter((g) => !g.included)

  const selectedVariants = useMemo(() => {
    const selections: CartSelection[] = []
    for (const group of variantGroups) {
      const choiceId = variantChoices[group.id]
      const opt = group.options.find((o) => o.id === choiceId)
      if (opt) {
        selections.push({
          id: opt.id,
          name: opt.name,
          price: opt.included ? 0 : opt.price
        })
      }
    }
    return selections
  }, [variantGroups, variantChoices])

  const selectedAddOns = useMemo(() => {
    const selections: CartSelection[] = []
    for (const group of addOnGroups) {
      const ids = addOnChoices[group.id] ?? []
      for (const id of ids) {
        const opt = group.options.find((o) => o.id === id)
        if (opt) {
          selections.push({
            id: opt.id,
            name: opt.name,
            price: getAddOnDisplayPrice(opt, selectedSizeName)
          })
        }
      }
    }
    return selections
  }, [addOnGroups, addOnChoices, selectedSizeName])

  const unitPrice = useMemo(() => {
    if (!item) return 0
    const paidVariantTotal = selectedVariants
      .filter((v) => v.price > 0)
      .reduce((sum, v) => sum + v.price, 0)
    const base = paidVariantTotal > 0 ? paidVariantTotal : item.price
    const extras = selectedAddOns.reduce((sum, a) => sum + a.price, 0)
    return base + extras
  }, [item, selectedVariants, selectedAddOns])

  const extrasBlocked = sizeBasedExtras && !selectedSizeName

  if (!item) return <p className="customer-loading">{t("item.loading")}</p>

  const toggleAddOn = (group: OptionGroup, optionId: string) => {
    if (extrasBlocked) return
    setAddOnChoices((prev) => {
      const current = prev[group.id] ?? []
      const exists = current.includes(optionId)
      let next: string[]
      if (exists) {
        next = current.filter((id) => id !== optionId)
      } else if (group.maxSelect === 1) {
        next = [optionId]
      } else if (group.maxSelect > 0 && current.length >= group.maxSelect) {
        return prev
      } else {
        next = [...current, optionId]
      }
      return { ...prev, [group.id]: next }
    })
  }

  const validate = () => {
    for (const group of variantGroups) {
      if (group.required && !variantChoices[group.id]) {
        return t("item.chooseRequired", { name: group.name })
      }
    }
    if (sizeBasedExtras && !selectedSizeName) {
      return t("item.chooseSizeFirst")
    }
    for (const group of addOnGroups) {
      const count = (addOnChoices[group.id] ?? []).length
      if (group.required && count < Math.max(1, group.minSelect)) {
        return t("item.chooseRequired", { name: group.name })
      }
      if (group.minSelect > 0 && count < group.minSelect) {
        return t("item.chooseMin", { count: group.minSelect, name: group.name })
      }
    }
    return ""
  }

  const addToCart = () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError("")

    addItem({
      id: Number(itemId),
      branchId: branchId || "",
      name: item.name,
      unitPrice,
      quantity: qty,
      variants: selectedVariants,
      addOns: selectedAddOns,
      notes: notes.trim() || undefined
    })

    navigate("/customer/cart")
  }

  const formatOptionPrice = (price: number, included?: boolean) =>
    included ? t("common.free") : formatCurrency(price)

  return (
    <div className="customer-page">
      <h2 className="customer-title">{item.name}</h2>
      {item.description && <p className="customer-text">{item.description}</p>}

      {includedGroups.length > 0 && (
        <div className="customer-included-box">
          <p className="customer-included-box__title">{t("item.includedTitle")}</p>
          {includedGroups.map((group) => (
            <div key={group.id} className="customer-section">
              <h4 style={{ margin: "0 0 8px" }}>
                {group.name}
                {group.required && <span style={{ color: "var(--c-accent)" }}> *</span>}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {group.options.map((opt) => (
                  <label
                    key={opt.id}
                    className={`customer-option customer-option--free${
                      variantChoices[group.id] === opt.id ? " customer-option--selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={group.id}
                      checked={variantChoices[group.id] === opt.id}
                      onChange={() =>
                        setVariantChoices((prev) => ({ ...prev, [group.id]: opt.id }))
                      }
                    />
                    <span className="customer-option__name">{opt.name}</span>
                    <span className="customer-option__price customer-option__price--free">
                      {t("common.free")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {paidVariantGroups.map((group) => (
        <div key={group.id} className="customer-section">
          <h4 style={{ marginBottom: 8 }}>
            {group.name}
            {group.required && <span style={{ color: "var(--c-accent)" }}> *</span>}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {group.options.map((opt) => (
              <label
                key={opt.id}
                className={`customer-option${
                  variantChoices[group.id] === opt.id ? " customer-option--selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name={group.id}
                  checked={variantChoices[group.id] === opt.id}
                  onChange={() =>
                    setVariantChoices((prev) => ({ ...prev, [group.id]: opt.id }))
                  }
                />
                <span className="customer-option__name">{opt.name}</span>
                <span className="customer-option__price">{formatOptionPrice(opt.price)}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {addOnGroups.length > 0 && (
        <div className="customer-section">
          <h3 className="customer-subtitle" style={{ marginBottom: 4 }}>
            {t("item.paidExtras")}
          </h3>
          <p className="customer-hint">
            {sizeBasedExtras
              ? selectedSizeName
                ? t("item.extrasSizeSelected", { size: selectedSizeName })
                : t("item.extrasSizeHint")
              : t("item.extrasOptional")}
          </p>
        </div>
      )}

      {addOnGroups.map((group) => (
        <div
          key={group.id}
          className="customer-section"
          style={{
            opacity: extrasBlocked ? 0.55 : 1,
            pointerEvents: extrasBlocked ? "none" : "auto"
          }}
        >
          <h4 style={{ marginBottom: 8, color: "var(--c-accent)" }}>{group.name}</h4>
          <div style={{ display: "grid", gap: 8 }}>
            {group.options.map((opt) => {
              const checked = (addOnChoices[group.id] ?? []).includes(opt.id)
              const displayPrice = getAddOnDisplayPrice(opt, selectedSizeName)
              return (
                <label
                  key={opt.id}
                  className={`customer-option${checked ? " customer-option--selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={extrasBlocked}
                    onChange={() => toggleAddOn(group, opt.id)}
                  />
                  <span className="customer-option__name">{opt.name}</span>
                  <span className="customer-option__price">+{formatCurrency(displayPrice)}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}

      <div className="customer-field">
        <label className="customer-label">
          {t("item.instructions")} ({t("common.optional")})
        </label>
        <textarea
          className="customer-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("item.instructionsPlaceholder")}
          rows={3}
          maxLength={200}
        />
      </div>

      <div className="customer-field">
        <label className="customer-label">{t("common.quantity")}</label>
        <input
          className="customer-input"
          type="number"
          value={qty}
          min={1}
          max={20}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          style={{ width: 80 }}
        />
      </div>

      <p className="customer-price-lg">
        {formatCurrency(unitPrice)}
        {qty > 1 && (
          <span>
            {" "}
            {t("item.totalForQty", { total: formatCurrency(unitPrice * qty) })}
          </span>
        )}
      </p>

      {error && <p className="customer-error">{error}</p>}

      <button type="button" onClick={addToCart} className="customer-btn customer-btn--primary">
        {t("item.addToCart")}
      </button>
    </div>
  )
}
