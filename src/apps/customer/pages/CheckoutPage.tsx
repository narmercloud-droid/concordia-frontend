import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import {
  createOrder,
  getBranches,
  getBranchTimeSlots,
  getDeliveryQuote
} from "@/api/customer"
import AddressAutocomplete from "@/components/AddressAutocomplete"
import { useCartStore } from "@/store/cartStore"
import { formatCurrency } from "@/utils/format"

type FulfillmentType = "pickup" | "delivery"
type TimingMode = "asap" | "scheduled"

function extractPostalCode(address: string): string | null {
  const match = address.match(/\b(\d{5})\b/)
  return match ? match[1] : null
}

export default function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const clearCart = useCartStore((s) => s.clearCart)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("delivery")
  const [timingMode, setTimingMode] = useState<TimingMode>("asap")
  const [scheduledFor, setScheduledFor] = useState("")
  const [error, setError] = useState("")
  const [nameError, setNameError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [addressError, setAddressError] = useState("")
  const [scheduleError, setScheduleError] = useState("")
  const [deliveryQuote, setDeliveryQuote] = useState<{
    allowed: boolean
    deliveryFee: number
    freeDelivery: boolean
    message?: string
    minimumOrder?: number
  } | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")

  const branchId = items[0]?.branchId
  const postalCode = extractPostalCode(address)

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches
  })

  const branchPromo = branches?.find((b: { id: string }) => b.id === branchId)?.promotions
  const freeDrinkMin = branchPromo?.freeDrinkMinOrder ?? 0
  const qualifiesForFreeDrink = freeDrinkMin > 0 && total >= freeDrinkMin

  const { data: slotsData } = useQuery({
    queryKey: ["timeSlots", branchId],
    queryFn: () => getBranchTimeSlots(branchId!),
    enabled: !!branchId && timingMode === "scheduled"
  })

  const timeSlots: Array<{ label: string; value: string }> = slotsData?.slots ?? []

  const createMutation = useMutation({
    mutationFn: createOrder
  })

  useEffect(() => {
    if (fulfillmentType !== "delivery" || !branchId || address.trim().length < 5) {
      setDeliveryQuote(null)
      return
    }

    const timer = setTimeout(async () => {
      setQuoteLoading(true)
      try {
        const quote = await getDeliveryQuote(
          branchId,
          address.trim(),
          total,
          postalCode ?? undefined
        )
        setDeliveryQuote(quote)
      } catch {
        setDeliveryQuote(null)
      } finally {
        setQuoteLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [address, branchId, fulfillmentType, postalCode, total])

  useEffect(() => {
    if (items.length === 0) {
      navigate("/customer/cart")
      return
    }

    const branchSet = new Set(items.map((item) => item.branchId))
    if (branchSet.size > 1) {
      clearCart()
      navigate("/customer")
    }
  }, [items, navigate, clearCart])

  if (items.length === 0) return null

  const deliveryFee =
    fulfillmentType === "delivery" && deliveryQuote?.allowed ? deliveryQuote.deliveryFee : 0
  const grandTotal = total + deliveryFee

  const deliveryBlocked =
    fulfillmentType === "delivery" &&
    (quoteLoading ||
      address.trim().length < 8 ||
      !deliveryQuote?.allowed ||
      (deliveryQuote.minimumOrder != null && total < deliveryQuote.minimumOrder))

  const handleSubmit = async () => {
    setError("")
    setNameError("")
    setPhoneError("")
    setAddressError("")
    setScheduleError("")

    if (!name.trim()) {
      setNameError(t("checkout.nameRequired"))
      return
    }

    if (!phone.trim()) {
      setPhoneError(t("checkout.phoneRequired"))
      return
    }

    if (fulfillmentType === "delivery") {
      if (address.trim().length < 8) {
        setAddressError(t("checkout.addressRequired"))
        return
      }
      if (!postalCode) {
        setAddressError(t("checkout.postcodeRequired"))
        return
      }
    }

    if (timingMode === "scheduled" && !scheduledFor) {
      setScheduleError(t("checkout.scheduleRequired"))
      return
    }

    try {
      const res = await createMutation.mutateAsync({
        branchId,
        items,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        fulfillmentType,
        deliveryAddress: fulfillmentType === "delivery" ? address.trim() : undefined,
        scheduledFor: timingMode === "scheduled" ? scheduledFor : null,
        paymentMethod: "cash",
        notes: orderNotes.trim() || undefined
      })

      const orderId = res?.id
      if (!orderId) {
        setError(t("checkout.orderFailed"))
        return
      }

      clearCart()
      navigate(`/customer/order/${orderId}`)
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        t("checkout.orderFailed")
      setError(message)
    }
  }

  const paymentMethod =
    fulfillmentType === "pickup" ? t("checkout.paymentPickup") : t("checkout.paymentDelivery")

  return (
    <div className="customer-page">
      <h2 className="customer-title">{t("checkout.title")}</h2>

      {error && <div className="customer-alert customer-alert--error">{error}</div>}

      <div className="customer-card">
        <h3 className="customer-subtitle">{t("checkout.summary")}</h3>
        {items.map((i) => (
          <div key={i.cartKey} className="customer-summary-line">
            <div>
              {i.name} × {i.quantity} = {formatCurrency(i.quantity * i.unitPrice)}
            </div>
            {i.variants.length > 0 && (
              <div className="customer-card__meta">{i.variants.map((v) => v.name).join(", ")}</div>
            )}
            {i.addOns.length > 0 && (
              <div className="customer-card__meta">
                + {i.addOns.map((a) => a.name).join(", ")}
              </div>
            )}
            {i.notes && <div className="customer-card__meta">{i.notes}</div>}
          </div>
        ))}

        {qualifiesForFreeDrink && (
          <p className="customer-alert customer-alert--success" style={{ marginTop: 12 }}>
            {branchPromo?.freeDrinkMessage ??
              t("checkout.freeDrinkQualify", { amount: freeDrinkMin })}
          </p>
        )}
        {freeDrinkMin > 0 && !qualifiesForFreeDrink && (
          <p className="customer-hint">
            {t("checkout.freeDrinkMore", { amount: (freeDrinkMin - total).toFixed(2) })}
          </p>
        )}
        {fulfillmentType === "delivery" && deliveryQuote?.allowed && (
          <p className="customer-hint">
            {deliveryQuote.freeDelivery
              ? t("checkout.deliveryFree")
              : t("checkout.deliveryFee", {
                  amount: formatCurrency(deliveryQuote.deliveryFee)
                })}
          </p>
        )}
        <p className="customer-total-line">
          {t("common.total")}: {formatCurrency(grandTotal)}
        </p>
        <p className="customer-hint">{t("checkout.payment", { method: paymentMethod })}</p>
      </div>

      <div className="customer-field">
        <label className="customer-label">{t("checkout.orderType")}</label>
        <div className="customer-toggle-group">
          {(["delivery", "pickup"] as FulfillmentType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFulfillmentType(type)}
              className={`customer-toggle${fulfillmentType === type ? " customer-toggle--active" : ""}`}
            >
              {t(`checkout.${type}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="customer-field">
        <label className="customer-label">{t("checkout.when")}</label>
        <div className="customer-toggle-group">
          <button
            type="button"
            onClick={() => setTimingMode("asap")}
            className={`customer-toggle${timingMode === "asap" ? " customer-toggle--active" : ""}`}
          >
            {t("checkout.asap")}
          </button>
          <button
            type="button"
            onClick={() => setTimingMode("scheduled")}
            className={`customer-toggle${timingMode === "scheduled" ? " customer-toggle--active" : ""}`}
          >
            {t("checkout.scheduled")}
          </button>
        </div>

        {timingMode === "scheduled" && (
          <div style={{ marginTop: 12 }}>
            <select
              className="customer-select"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            >
              <option value="">{t("checkout.chooseTime")}</option>
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
            {scheduleError && <p className="customer-error">{scheduleError}</p>}
          </div>
        )}
      </div>

      <div className="customer-field">
        <label className="customer-label">{t("checkout.name")}</label>
        <input
          className="customer-input"
          placeholder={t("checkout.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {nameError && <p className="customer-error">{nameError}</p>}
      </div>

      <div className="customer-field">
        <label className="customer-label">{t("checkout.phone")}</label>
        <input
          className="customer-input"
          placeholder={t("checkout.phonePlaceholder")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {phoneError && <p className="customer-error">{phoneError}</p>}
      </div>

      {fulfillmentType === "delivery" && (
        <div className="customer-field">
          <label className="customer-label">{t("checkout.address")}</label>
          <AddressAutocomplete
            branchId={branchId!}
            value={address}
            onChange={setAddress}
            onSelect={(s) => setAddress(s.label)}
            placeholder={t("checkout.addressPlaceholder")}
          />
          <p className="customer-hint">{t("checkout.addressHint")}</p>
          {addressError && <p className="customer-error">{addressError}</p>}
          {quoteLoading && <p className="customer-hint">{t("checkout.checkingDelivery")}</p>}
          {deliveryQuote && !deliveryQuote.allowed && (
            <p className="customer-error">{deliveryQuote.message}</p>
          )}
          {deliveryQuote?.allowed &&
            deliveryQuote.minimumOrder != null &&
            total < deliveryQuote.minimumOrder && (
              <p className="customer-error">
                {t("checkout.minimumOrder", {
                  amount: formatCurrency(deliveryQuote.minimumOrder)
                })}
              </p>
            )}
          {deliveryQuote?.allowed && deliveryQuote.freeDelivery && (
            <p className="customer-hint" style={{ color: "var(--c-success)" }}>
              {t("checkout.freeDeliveryQualify")}
            </p>
          )}
        </div>
      )}

      <div className="customer-field">
        <label className="customer-label">
          {t("checkout.notes")} ({t("common.optional")})
        </label>
        <textarea
          className="customer-textarea"
          placeholder={t("checkout.notesPlaceholder")}
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          rows={2}
          maxLength={300}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={createMutation.isPending || deliveryBlocked}
        className="customer-btn customer-btn--primary"
      >
        {createMutation.isPending
          ? t("common.processing")
          : deliveryBlocked && fulfillmentType === "delivery"
            ? quoteLoading
              ? t("checkout.checkingDelivery")
              : t("checkout.completeAddress")
            : t("checkout.placeOrder")}
      </button>
    </div>
  )
}
