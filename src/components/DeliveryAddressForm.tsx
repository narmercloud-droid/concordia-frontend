import React, { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import {
  getBranchDeliveryAreas,
  reverseGeocodeLocation,
  suggestAddresses
} from "@/api/customer"
import type { DeliveryAddressFields } from "@/lib/deliveryAddress"

export type StreetSuggestion = {
  label: string
  street: string
  postalCode: string
  city: string
}

type Props = {
  branchId: string
  branchCity?: string
  value: DeliveryAddressFields
  onChange: (fields: DeliveryAddressFields) => void
  error?: string
}

export default function DeliveryAddressForm({
  branchId,
  branchCity,
  value,
  onChange,
  error
}: Props) {
  const { t } = useTranslation()
  const [suggestions, setSuggestions] = useState<StreetSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [activeIndex, setActiveIndex] = useState(-1)
  const streetContainerRef = useRef<HTMLDivElement>(null)
  const requestId = useRef(0)

  const { data: deliveryAreasData } = useQuery({
    queryKey: ["deliveryAreas", branchId],
    queryFn: () => getBranchDeliveryAreas(branchId),
    enabled: !!branchId,
    staleTime: 10 * 60_000
  })

  const deliveryAreas = deliveryAreasData?.areas ?? []
  const deliveryMode = deliveryAreasData?.deliveryMode ?? "postcodes"
  const usePostcodeDropdown =
    deliveryAreas.length > 0 && deliveryMode === "postcodes"
  const matchedArea = useMemo(
    () => deliveryAreas.find((area) => area.postalCode === value.postalCode.trim()),
    [deliveryAreas, value.postalCode]
  )
  const cityAutoFilled = Boolean(usePostcodeDropdown && matchedArea?.city)
  const canSearchStreets = /^\d{5}$/.test(value.postalCode.trim()) && value.street.trim().length >= 2

  const patch = (partial: Partial<DeliveryAddressFields>) => {
    onChange({ ...value, ...partial })
  }

  const handlePostalCodeChange = (postalCode: string) => {
    const area = deliveryAreas.find((a) => a.postalCode === postalCode)
    patch({
      postalCode,
      city: area?.city ?? (postalCode.length < 5 ? "" : value.city)
    })
  }

  const handleUseLocation = () => {
    setLocationError("")
    if (!navigator.geolocation) {
      setLocationError(t("checkout.locationUnsupported"))
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await reverseGeocodeLocation(
            branchId,
            position.coords.latitude,
            position.coords.longitude
          )
          patch({
            street: result.street,
            houseNumber: result.houseNumber,
            city: result.city,
            postalCode: result.postalCode,
            lat: result.lat,
            lng: result.lng
          })
        } catch {
          setLocationError(t("checkout.locationResolveFailed"))
        } finally {
          setLocating(false)
        }
      },
      () => {
        setLocationError(t("checkout.locationDenied"))
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    )
  }

  useEffect(() => {
    if (!canSearchStreets) {
      setSuggestions([])
      setOpen(false)
      setActiveIndex(-1)
      return
    }

    const currentRequest = ++requestId.current
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await suggestAddresses(
          branchId,
          value.street.trim(),
          value.postalCode.trim(),
          value.city.trim() || branchCity,
          value.lat != null && value.lng != null
            ? { lat: value.lat, lng: value.lng }
            : undefined
        )
        if (currentRequest !== requestId.current) return
        const next = (res.suggestions ?? []).map((s) => ({
          label: s.label,
          street: s.street,
          postalCode: s.postalCode,
          city: s.city
        }))
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
    }, 250)

    return () => clearTimeout(timer)
  }, [
    branchId,
    branchCity,
    value.street,
    value.postalCode,
    value.city,
    value.lat,
    value.lng,
    canSearchStreets
  ])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!streetContainerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const pickSuggestion = (suggestion: StreetSuggestion) => {
    patch({ street: suggestion.street })
    setOpen(false)
    setActiveIndex(-1)
  }

  const handleStreetKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
  const postcodeReady = /^\d{5}$/.test(value.postalCode.trim())
  const addressHint =
    deliveryMode === "radius"
      ? t("checkout.addressRadiusHint")
      : t("checkout.addressStructuredHint")

  return (
    <div className="delivery-address-form">
      <div className="delivery-address-form__locate-row">
        <button
          type="button"
          className="customer-btn customer-btn--secondary delivery-address-form__locate"
          onClick={handleUseLocation}
          disabled={locating}
        >
          {locating ? t("checkout.locating") : t("checkout.useMyLocation")}
        </button>
        {locationError && <p className="customer-error">{locationError}</p>}
      </div>

      <p className="customer-hint" style={{ marginBottom: 12 }}>
        {addressHint}
      </p>

      <div className="delivery-address-form__grid">
        <div className="delivery-address-form__cell">
          <label className="customer-label" htmlFor="checkout-postal-code">
            {t("checkout.addressPostalCode")}
          </label>
          {usePostcodeDropdown ? (
            <select
              id="checkout-postal-code"
              className="customer-select"
              value={value.postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
            >
              <option value="">{t("checkout.addressSelectPostcode")}</option>
              {deliveryAreas.map((area) => (
                <option key={area.postalCode} value={area.postalCode}>
                  {area.postalCode}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="checkout-postal-code"
              className="customer-input"
              inputMode="numeric"
              maxLength={5}
              placeholder={t("checkout.addressPostalCodePlaceholder")}
              value={value.postalCode}
              onChange={(e) =>
                handlePostalCodeChange(e.target.value.replace(/\D/g, "").slice(0, 5))
              }
              autoComplete="postal-code"
            />
          )}
        </div>

        <div className="delivery-address-form__cell">
          <label className="customer-label" htmlFor="checkout-city">
            {t("checkout.addressCity")}
          </label>
          <input
            id="checkout-city"
            className={`customer-input${cityAutoFilled ? " customer-input--readonly" : ""}`}
            placeholder={t("checkout.addressCityPlaceholder")}
            value={value.city}
            onChange={(e) => patch({ city: e.target.value })}
            readOnly={cityAutoFilled}
            autoComplete="address-level2"
            aria-readonly={cityAutoFilled}
          />
          {cityAutoFilled && (
            <p className="customer-hint">{t("checkout.addressCityAutoFilled")}</p>
          )}
        </div>

        <div className="delivery-address-form__cell delivery-address-form__cell--wide" ref={streetContainerRef}>
          <label className="customer-label" htmlFor="checkout-street">
            {t("checkout.addressStreet")}
          </label>
          <div className="address-autocomplete">
            <input
              id="checkout-street"
              className="customer-input"
              placeholder={t("checkout.addressStreetPlaceholder")}
              value={value.street}
              onChange={(e) => patch({ street: e.target.value })}
              onFocus={() => {
                if (canSearchStreets && (loading || suggestions.length > 0)) {
                  setOpen(true)
                }
              }}
              onKeyDown={handleStreetKeyDown}
              autoComplete="off"
              role="combobox"
              aria-expanded={showDropdown}
              aria-autocomplete="list"
              disabled={!postcodeReady}
            />
            {!postcodeReady && (
              <p className="customer-hint">{t("checkout.addressEnterPostcodeFirst")}</p>
            )}
            {showDropdown && (
              <ul className="address-autocomplete__list" role="listbox">
                {loading && suggestions.length === 0 && (
                  <li className="address-autocomplete__status">{t("checkout.searchingAddresses")}</li>
                )}
                {suggestions.map((s, index) => (
                  <li key={`${s.street}-${index}`}>
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
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="delivery-address-form__cell">
          <label className="customer-label" htmlFor="checkout-house-number">
            {t("checkout.addressHouseNumber")}
          </label>
          <input
            id="checkout-house-number"
            className="customer-input"
            placeholder={t("checkout.addressHouseNumberPlaceholder")}
            value={value.houseNumber}
            onChange={(e) => patch({ houseNumber: e.target.value })}
            autoComplete="off"
          />
        </div>

        <div className="delivery-address-form__cell">
          <label className="customer-label" htmlFor="checkout-floor">
            {t("checkout.addressFloor")} ({t("common.optional")})
          </label>
          <input
            id="checkout-floor"
            className="customer-input"
            placeholder={t("checkout.addressFloorPlaceholder")}
            value={value.floor}
            onChange={(e) => patch({ floor: e.target.value })}
            autoComplete="off"
          />
        </div>
      </div>

      {error && <p className="customer-error">{error}</p>}
    </div>
  )
}
