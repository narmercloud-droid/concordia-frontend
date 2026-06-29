import React from "react"
import { useItemOptions } from "@/apps/customer/hooks/useItemOptions"
import { getAddOnDisplayPrice } from "@/utils/extraPricing"
import { formatCurrency } from "@/utils/format"

type HookReturn = ReturnType<typeof useItemOptions>

type Props = {
  options: HookReturn
  compact?: boolean
  showTitle?: boolean
}

export default function ItemOptionsFields({ options, compact = false, showTitle = true }: Props) {
  const {
    item,
    notes,
    setNotes,
    variantChoices,
    setVariantChoices,
    includedGroups,
    paidVariantGroups,
    addOnGroups,
    requiresSizeForExtras,
    selectedSizeName,
    extrasBlocked,
    toggleAddOn,
    formatOptionPrice,
    t
  } = options

  if (!item) return null

  const sectionStyle = compact ? { margin: "16px 0 8px" } : undefined

  return (
    <>
      {showTitle && (
        <>
          <h2 className="customer-title">
            {item.itemNumber ? (
              <>
                <span className="item-details__number">Nr. {item.itemNumber}</span>{" "}
              </>
            ) : null}
            {item.name}
          </h2>
          {item.description && <p className="customer-text">{item.description}</p>}
        </>
      )}

      {includedGroups.length > 0 && (
        <div className="customer-included-box">
          <p className="customer-included-box__title">{t("item.includedTitle")}</p>
          {includedGroups.map((group) => (
            <div key={group.id} className="customer-section" style={sectionStyle}>
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
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {paidVariantGroups.map((group) => (
        <div key={group.id} className="customer-section" style={sectionStyle}>
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
        <div className="customer-section" style={sectionStyle}>
          <h3 className="customer-subtitle" style={{ marginBottom: 4 }}>
            {t("item.paidExtras")}
          </h3>
          <p className="customer-hint">
            {requiresSizeForExtras
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
            ...sectionStyle,
            opacity: extrasBlocked ? 0.55 : 1,
            pointerEvents: extrasBlocked ? "none" : "auto"
          }}
        >
          <h4 style={{ marginBottom: 8, color: "var(--c-accent)" }}>{group.name}</h4>
          <div style={{ display: "grid", gap: 8 }}>
            {group.options.map((opt) => {
              const checked = (options.addOnChoices[group.id] ?? []).includes(opt.id)
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
          rows={compact ? 2 : 3}
          maxLength={200}
        />
      </div>
    </>
  )
}
