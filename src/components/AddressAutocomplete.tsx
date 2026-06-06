import React, { useEffect, useRef, useState } from "react"
import { suggestAddresses } from "@/api/customer"

type Suggestion = {
  label: string
  street: string
  postalCode: string
  city: string
}

type Props = {
  branchId: string
  value: string
  postalCode?: string
  onChange: (street: string) => void
  onSelect: (suggestion: Suggestion) => void
  placeholder?: string
}

export default function AddressAutocomplete({
  branchId,
  value,
  postalCode,
  onChange,
  onSelect,
  placeholder
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
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
        const res = await suggestAddresses(branchId, value.trim(), postalCode)
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
  }, [branchId, value, postalCode])

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
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="street-address"
        style={{
          display: "block",
          width: "100%",
          padding: 10,
          borderRadius: 8,
          border: "1px solid #ccc"
        }}
      />
      {loading && (
        <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>Searching addresses...</p>
      )}
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
            border: "1px solid #ddd",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
