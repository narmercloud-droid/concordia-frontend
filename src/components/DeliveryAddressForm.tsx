import React, { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import {
  getBranchDeliveryAreas,
  lookupPostalCodeCity,
  reverseGeocodeLocation,
  suggestAddresses
} from "@/api/customer"
import type { DeliveryAddressFields } from "@/lib/deliveryAddress"

export type StreetSuggestion = {
  label: string
  street: string
  postalCode: string
  city: string
  lat?: number
  lng?: number
}

type Props = {
  branchId: string
  branchName?: string
  branchCity?: string
  branchLat?: number
  branchLng?: number
  value: DeliveryAddressFields
  onChange: (fields: DeliveryAddressFields) => void
  error?: string
}

function branchDisplayName(name?: string): string {
  return (name ?? "").replace(/^Concordia\s+/i, "").trim()
}

export default function DeliveryAddressForm({
  branchId,
  branchName,
  branchCity,
  branchLat,
  branchLng,
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
  const [locationFilled, setLocationFilled] = useState(false)
  const [showExtras, setShowExtras] = useState(Boolean(value.floor.trim()))
  const [activeIndex, setActiveIndex] = useState(-1)
  const [cityFromPlz, setCityFromPlz] = useState(false)
  const [plzLookupLoading, setPlzLookupLoading] = useState(false)
  const streetContainerRef = useRef<HTMLDivElement>(null)
  const houseNumberRef = useRef<HTMLInputElement>(null)
  const requestId = useRef(0)
  const valueRef = useRef(value)
  valueRef.current = value

  const { data: deliveryAreasData } = useQuery({
    queryKey: ["deliveryAreas", branchId],
    queryFn: () => getBranchDeliveryAreas(branchId),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const deliveryAreas = deliveryAreasData?.areas ?? []
  const deliveryMode = deliveryAreasData?.deliveryMode ?? "postcodes"
  const usePostcodeDropdown =
    deliveryAreas.length > 0 && deliveryMode === "postcodes"
  const matchedArea = useMemo(
    () => deliveryAreas.find((area) => area.postalCode === value.postalCode.trim()),
    [deliveryAreas, value.postalCode]
  )
  const cityAutoFilled = Boolean((usePostcodeDropdown && matchedArea?.city) || cityFromPlz)
  const canSearchStreets = /^\d{5}$/.test(value.postalCode.trim()) && value.street.trim().length >= 2
  const regionLabel = branchDisplayName(branchName) || branchCity || t("checkout.deliveryAreaFallback")

  const patch = (partial: Partial<DeliveryAddressFields>) => {
    if (
      partial.street !== undefined ||
      partial.postalCode !== undefined ||
      partial.city !== undefined
    ) {
      setLocationFilled(false)
    }
    onChange({ ...valueRef.current, ...partial })
  }

  const handlePostalCodeChange = (postalCode: string) => {
    const area = deliveryAreas.find((a) => a.postalCode === postalCode)
    if (area?.city) {
      setCityFromPlz(true)
      patch({
        postalCode,
        city: area.city
      })
      return
    }

    setCityFromPlz(false)
    patch({
      postalCode,
      city: postalCode.length < 5 ? "" : value.city
    })
  }

  useEffect(() => {
    const plz = value.postalCode.trim()
    if (!/^\d{5}$/.test(plz)) {
      setPlzLookupLoading(false)
      return
    }
    if (matchedArea?.city) return

    let cancelled = false
    const timer = window.setTimeout(async () => {
      setPlzLookupLoading(true)
      try {
        const result = await lookupPostalCodeCity(branchId, plz)
        if (cancelled) return
        if (result.city) {
          patch({ city: result.city })
          setCityFromPlz(true)
        }
      } catch {
        if (!cancelled) setCityFromPlz(false)
      } finally {
        if (!cancelled) setPlzLookupLoading(false)
      }
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [branchId, value.postalCode, matchedArea?.city])

  const handleUseLocation = () => {
    setLocationError("")
    setLocationFilled(false)
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
          setLocationFilled(true)
          window.setTimeout(() => {
            if (!result.houseNumber?.trim()) {
              houseNumberRef.current?.focus()
            }
          }, 100)
        } catch (err: unknown) {
          const apiMessage =
            (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
              ?.error?.message ?? ""
          if (apiMessage.toLowerCase().includes("outside")) {
            setLocationError(t("checkout.locationOutsideArea"))
          } else {
            setLocationError(t("checkout.locationResolveFailed"))
          }
        } finally {
          setLocating(false)
        }
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setLocationError(t("checkout.locationDenied"))
        } else {
          setLocationError(t("checkout.locationResolveFailed"))
        }
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
            : branchLat != null && branchLng != null
              ? { lat: branchLat, lng: branchLng }
              : undefined
        )
        if (currentRequest !== requestId.current) return
        const next = (res.suggestions ?? []).map((s) => ({
          label: s.label,
          street: s.street,
          postalCode: s.postalCode,
          city: s.city,
          lat: s.lat,
          lng: s.lng
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
    branchLat,
    branchLng,
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
    patch({
      street: suggestion.street,
      city: suggestion.city || value.city,
      postalCode: suggestion.postalCode || value.postalCode,
      lat: suggestion.lat ?? value.lat,
      lng: suggestion.lng ?? value.lng
    })
    setOpen(false)
    setActiveIndex(-1)
    houseNumberRef.current?.focus()
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

  return (
    <div className="delivery-address-form delivery-address-form--compact">
      <p className="customer-hint delivery-address-form__lead">
        {t("checkout.addressQuickLead", { region: regionLabel })}
      </p>

      <button
        type="button"
        className="customer-btn customer-btn--secondary delivery-address-form__locate-btn delivery-address-form__locate-btn--hero"
        onClick={handleUseLocation}
        disabled={locating}
        aria-busy={locating}
      >
        <span className="delivery-address-form__locate-icon" aria-hidden="true">
          📍
        </span>
        {locating ? t("checkout.locating") : t("checkout.useMyLocation")}
      </button>

      {locationFilled && (
        <p className="customer-alert customer-alert--success delivery-address-form__success" role="status">
          {t("checkout.locationFilled")}
        </p>
      )}
      {locationError && <p className="customer-error">{locationError}</p>}

      <div className="delivery-address-form__grid delivery-address-form__grid--compact">
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
                  {area.city ? ` · ${area.city}` : ""}
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
            value={plzLookupLoading && !value.city ? "" : value.city}
            onChange={(e) => {
              setCityFromPlz(false)
              patch({ city: e.target.value })
            }}
            readOnly={cityAutoFilled}
            autoComplete="address-level2"
            aria-readonly={cityAutoFilled}
          />
          {plzLookupLoading && (
            <p className="customer-hint">{t("checkout.cityLookupLoading")}</p>
          )}
        </div>

        <div
          className="delivery-address-form__cell delivery-address-form__cell--street"
          ref={streetContainerRef}
        >
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
                  <li key={`${s.street}-${s.postalCode}-${index}`}>
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
                        {[s.postalCode, s.city].filter(Boolean).join(" ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="delivery-address-form__cell delivery-address-form__cell--house">
          <label className="customer-label" htmlFor="checkout-house-number">
            {t("checkout.addressHouseNumber")}
          </label>
          <input
            id="checkout-house-number"
            ref={houseNumberRef}
            className="customer-input"
            placeholder={t("checkout.addressHouseNumberPlaceholder")}
            value={value.houseNumber}
            onChange={(e) => patch({ houseNumber: e.target.value })}
            autoComplete="off"
          />
        </div>
      </div>

      {!showExtras ? (
        <button
          type="button"
          className="delivery-address-form__more-btn"
          onClick={() => setShowExtras(true)}
        >
          {t("checkout.addressAddDetails")}
        </button>
      ) : (
        <div className="delivery-address-form__extras">
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
      )}

      {error && <p className="customer-error">{error}</p>}
    </div>
  )
}
