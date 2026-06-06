import React, { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getItemDetails } from "@/api/customer"
import { useCartStore, type CartSelection } from "@/store/cartStore"
import { findSizeVariantName, getAddOnDisplayPrice } from "@/utils/extraPricing"

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

function formatPrice(price: number, included?: boolean) {
  if (included) return "Free"
  return `${price.toFixed(2)} €`
}

export default function ItemDetailsPage() {
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

  if (!item) return <p>Loading...</p>

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
        return `Please choose: ${group.name}`
      }
    }
    if (sizeBasedExtras && !selectedSizeName) {
      return "Please choose a pizza size before adding extras"
    }
    for (const group of addOnGroups) {
      const count = (addOnChoices[group.id] ?? []).length
      if (group.required && count < Math.max(1, group.minSelect)) {
        return `Please choose: ${group.name}`
      }
      if (group.minSelect > 0 && count < group.minSelect) {
        return `Please select at least ${group.minSelect} for ${group.name}`
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

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 16 }}>
      <h2>{item.name}</h2>
      {item.description && <p style={{ color: "#555" }}>{item.description}</p>}

      {includedGroups.length > 0 && (
        <div
          style={{
            margin: "16px 0",
            padding: 12,
            background: "#f0f7f0",
            borderRadius: 8,
            border: "1px solid #c8e6c9"
          }}
        >
          <p style={{ margin: "0 0 12px", fontWeight: 600, color: "#2e7d32" }}>
            Included with your order — choose one (free)
          </p>
          {includedGroups.map((group) => (
            <div key={group.id} style={{ marginBottom: 12 }}>
              <h4 style={{ margin: "0 0 8px" }}>
                {group.name}
                {group.required && <span style={{ color: "#c41e3a" }}> *</span>}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {group.options.map((opt) => (
                  <label
                    key={opt.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 10,
                      border:
                        variantChoices[group.id] === opt.id
                          ? "2px solid #2e7d32"
                          : "1px solid #ddd",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: "#fff"
                    }}
                  >
                    <input
                      type="radio"
                      name={group.id}
                      checked={variantChoices[group.id] === opt.id}
                      onChange={() =>
                        setVariantChoices((prev) => ({ ...prev, [group.id]: opt.id }))
                      }
                    />
                    <span style={{ flex: 1 }}>{opt.name}</span>
                    <span style={{ color: "#2e7d32", fontWeight: 600 }}>Free</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {paidVariantGroups.map((group) => (
        <div key={group.id} style={{ margin: "20px 0" }}>
          <h4 style={{ marginBottom: 8 }}>
            {group.name}
            {group.required && <span style={{ color: "#c41e3a" }}> *</span>}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {group.options.map((opt) => (
              <label
                key={opt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 10,
                  border:
                    variantChoices[group.id] === opt.id
                      ? "2px solid #c41e3a"
                      : "1px solid #ddd",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                <input
                  type="radio"
                  name={group.id}
                  checked={variantChoices[group.id] === opt.id}
                  onChange={() =>
                    setVariantChoices((prev) => ({ ...prev, [group.id]: opt.id }))
                  }
                />
                <span style={{ flex: 1 }}>{opt.name}</span>
                <span>{formatPrice(opt.price)}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {addOnGroups.length > 0 && (
        <div style={{ margin: "24px 0 8px" }}>
          <h3 style={{ margin: 0 }}>Paid extras</h3>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666" }}>
            {sizeBasedExtras
              ? selectedSizeName
                ? `Prices for ${selectedSizeName}`
                : "Choose your size first — extra prices depend on klein / groß"
              : "Optional add-ons — pick from any category below"}
          </p>
        </div>
      )}

      {addOnGroups.map((group) => (
        <div
          key={group.id}
          style={{
            margin: "16px 0",
            opacity: extrasBlocked ? 0.55 : 1,
            pointerEvents: extrasBlocked ? "none" : "auto"
          }}
        >
          <h4 style={{ marginBottom: 4, color: "#c41e3a" }}>{group.name}</h4>
          <div style={{ display: "grid", gap: 8 }}>
            {group.options.map((opt) => {
              const checked = (addOnChoices[group.id] ?? []).includes(opt.id)
              const displayPrice = getAddOnDisplayPrice(opt, selectedSizeName)
              return (
                <label
                  key={opt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 10,
                    border: checked ? "2px solid #c41e3a" : "1px solid #ddd",
                    borderRadius: 8,
                    cursor: extrasBlocked ? "not-allowed" : "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={extrasBlocked}
                    onChange={() => toggleAddOn(group, opt.id)}
                  />
                  <span style={{ flex: 1 }}>{opt.name}</span>
                  <span>+{displayPrice.toFixed(2)} €</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}

      <div style={{ margin: "20px 0" }}>
        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
          Special instructions (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. no onions, extra crispy..."
          rows={3}
          maxLength={200}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontFamily: "inherit"
          }}
        />
      </div>

      <div style={{ margin: "20px 0" }}>
        <label>Quantity: </label>
        <input
          type="number"
          value={qty}
          min={1}
          max={20}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          style={{ width: 60, padding: 5, marginLeft: 8 }}
        />
      </div>

      <p style={{ fontSize: 22, fontWeight: 600, margin: "16px 0" }}>
        {unitPrice.toFixed(2)} €
        {qty > 1 && (
          <span style={{ fontSize: 16, fontWeight: 400, color: "#555" }}>
            {" "}
            ({(unitPrice * qty).toFixed(2)} € total)
          </span>
        )}
      </p>

      {error && <p style={{ color: "#b00020", marginBottom: 12 }}>{error}</p>}

      <button
        onClick={addToCart}
        style={{
          padding: "12px 24px",
          fontSize: 16,
          background: "#c41e3a",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          width: "100%"
        }}
      >
        Add to Cart
      </button>
    </div>
  )
}
