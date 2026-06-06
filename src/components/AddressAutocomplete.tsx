import React, { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { suggestAddresses } from "@/api/customer"

export type AddressSuggestion = {
  label: string
  street: string
  postalCode: string
  city: string
}

type Props = {
  branchId: string
  value: string
  onChange: (address: string) => void
  onSelect: (suggestion: AddressSuggestion) => void
  placeholder?: string
}

export default function AddressAutocomplete({
  branchId,
  value,
  onChange,
  onSelect,
  placeholder
}: Props) {
  const { t } = useTranslation()
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value.trim().length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await suggestAddresses(branchId, value.trim())
        setSuggestions(res.suggestions ?? [])
        setOpen((res.suggestions ?? []).length > 0)
      } catch {
        setSuggestions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [branchId, value])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        className="customer-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="street-address"
      />
      {loading && <p className="customer-hint">{t("checkout.searchingAddresses")}</p>}
      {open && suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            zIndex: 20,
            top: "100%",
            left: 0,
            right: 0,
            margin: "4px 0 0",
            padding: 0,
            listStyle: "none",
            background: "#fff",
            border: "1px solid #e8e2da",
            borderRadius: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            maxHeight: 220,
            overflowY: "auto"
          }}
        >
          {suggestions.map((s) => (
            <li key={s.label}>
              <button
                type="button"
                onClick={() => {
                  onSelect(s)
                  onChange(s.label)
                  setOpen(false)
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 14
                }}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
