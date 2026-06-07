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
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const requestId = useRef(0)

  useEffect(() => {
    const trimmed = value.trim()
    if (!trimmed) {
      setSuggestions([])
      setOpen(false)
      setActiveIndex(-1)
      return
    }

    const currentRequest = ++requestId.current
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await suggestAddresses(branchId, trimmed)
        if (currentRequest !== requestId.current) return
        const next = res.suggestions ?? []
        setSuggestions(next)
        setOpen(next.length > 0)
        setActiveIndex(-1)
      } catch {
        if (currentRequest !== requestId.current) return
        setSuggestions([])
        setOpen(false)
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false)
        }
      }
    }, 200)

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

  const pickSuggestion = (suggestion: AddressSuggestion) => {
    onSelect(suggestion)
    onChange(suggestion.label)
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault()
      pickSuggestion(suggestions[activeIndex])
    } else if (event.key === "Escape") {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  const showDropdown = open && (loading || suggestions.length > 0)

  return (
    <div ref={containerRef} className="address-autocomplete">
      <input
        className="customer-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (value.trim() && (loading || suggestions.length > 0)) {
            setOpen(true)
          }
        }}
        onKeyDown={handleKeyDown}
        autoComplete="street-address"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
      />
      {showDropdown && (
        <ul className="address-autocomplete__list" role="listbox">
          {loading && suggestions.length === 0 && (
            <li className="address-autocomplete__status">{t("checkout.searchingAddresses")}</li>
          )}
          {suggestions.map((s, index) => (
            <li key={s.label}>
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={`address-autocomplete__option${
                  index === activeIndex ? " address-autocomplete__option--active" : ""
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => pickSuggestion(s)}
              >
                <span className="address-autocomplete__street">{s.street}</span>
                <span className="address-autocomplete__meta">
                  {s.postalCode} {s.city}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
