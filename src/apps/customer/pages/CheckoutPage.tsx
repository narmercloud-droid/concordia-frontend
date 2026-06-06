import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  createOrder,
  getBranches,
  getBranchDeliveryAreas,
  getBranchTimeSlots,
  getDeliveryQuote
} from "@/api/customer"
import AddressAutocomplete from "@/components/AddressAutocomplete"
import { useCartStore } from "@/store/cartStore"

type FulfillmentType = "pickup" | "delivery"
type TimingMode = "asap" | "scheduled"

export default function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const clearCart = useCartStore((s) => s.clearCart)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [street, setStreet] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [city, setCity] = useState("Kempen")
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

  const fullAddress = useMemo(() => {
    const parts = [street.trim(), `${postalCode.trim()} ${city.trim()}`.trim()].filter(Boolean)
    return parts.join(", ")
  }, [street, postalCode, city])

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches
  })

  const { data: deliveryAreasData } = useQuery({
    queryKey: ["deliveryAreas", branchId],
    queryFn: () => getBranchDeliveryAreas(branchId!),
    enabled: !!branchId && fulfillmentType === "delivery"
  })

  const deliveryAreas = deliveryAreasData?.areas ?? []

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
    if (fulfillmentType !== "delivery" || !branchId) {
      setDeliveryQuote(null)
      return
    }

    const postcodeReady = /^\d{5}$/.test(postalCode.trim())
    const streetReady = street.trim().length >= 3
    if (!postcodeReady && !streetReady) {
      setDeliveryQuote(null)
      return
    }

    const timer = setTimeout(async () => {
      setQuoteLoading(true)
      try {
        const quote = await getDeliveryQuote(
          branchId,
          fullAddress || `${postalCode.trim()} Kempen`,
          total,
          postalCode.trim() || undefined
        )
        setDeliveryQuote(quote)
      } catch {
        setDeliveryQuote(null)
      } finally {
        setQuoteLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [branchId, fulfillmentType, fullAddress, postalCode, street, total])

  useEffect(() => {
    if (items.length === 0) {
      navigate("/customer/cart")
      return
    }

    const branches = new Set(items.map((item) => item.branchId))
    if (branches.size > 1) {
      clearCart()
      navigate("/customer")
    }
  }, [items, navigate, clearCart])

  if (items.length === 0) return null

  const deliveryBlocked =
    fulfillmentType === "delivery" &&
    (quoteLoading ||
      !postalCode.trim() ||
      !street.trim() ||
      !deliveryQuote?.allowed ||
      (deliveryQuote.minimumOrder != null && total < deliveryQuote.minimumOrder))

  const handlePostcodeChange = (value: string) => {
    setPostalCode(value)
    const area = deliveryAreas.find((a) => a.postalCode === value)
    if (area?.city) setCity(area.city)
  }

  const handleSubmit = async () => {
    setError("")
    setNameError("")
    setPhoneError("")
    setAddressError("")
    setScheduleError("")

    if (!name.trim()) {
      setNameError("Name is required.")
      return
    }

    if (!phone.trim()) {
      setPhoneError("Phone number is required.")
      return
    }

    if (fulfillmentType === "delivery") {
      if (!street.trim()) {
        setAddressError("Street and house number are required.")
        return
      }
      if (!/^\d{5}$/.test(postalCode.trim())) {
        setAddressError("Please choose a valid postcode.")
        return
      }
    }

    if (timingMode === "scheduled" && !scheduledFor) {
      setScheduleError("Please choose a scheduled time.")
      return
    }

    try {
      const res = await createMutation.mutateAsync({
        branchId,
        items,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        fulfillmentType,
        deliveryAddress: fulfillmentType === "delivery" ? fullAddress : undefined,
        scheduledFor: timingMode === "scheduled" ? scheduledFor : null,
        paymentMethod: "cash",
        notes: orderNotes.trim() || undefined
      })

      const orderId = res?.id
      if (!orderId) {
        setError("Order failed. Please try again.")
        return
      }

      clearCart()
      navigate(`/customer/order/${orderId}`)
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        "Order failed. Please try again."
      setError(message)
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16 }}>
      <h2>Checkout</h2>

      {error && (
        <div style={{ color: "#b00020", marginBottom: 16, padding: 12, background: "#ffeaea", borderRadius: 8 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <h3>Order Summary</h3>
        {items.map((i) => (
          <div key={i.cartKey} style={{ marginBottom: 8, fontSize: 14 }}>
            <div>
              {i.name} × {i.quantity} = {(i.quantity * i.unitPrice).toFixed(2)} €
            </div>
            {i.variants.length > 0 && (
              <div style={{ color: "#666" }}>{i.variants.map((v) => v.name).join(", ")}</div>
            )}
            {i.addOns.length > 0 && (
              <div style={{ color: "#666" }}>
                + {i.addOns.map((a) => a.name).join(", ")}
              </div>
            )}
            {i.notes && <div style={{ color: "#666", fontStyle: "italic" }}>{i.notes}</div>}
          </div>
        ))}
        {qualifiesForFreeDrink && (
          <p
            style={{
              marginTop: 10,
              padding: 10,
              background: "#e8f5e9",
              borderRadius: 8,
              color: "#2e7d32",
              fontSize: 14
            }}
          >
            {branchPromo?.freeDrinkMessage ??
              `You qualify for a free drink (orders from €${freeDrinkMin}).`}
          </p>
        )}
        {freeDrinkMin > 0 && !qualifiesForFreeDrink && (
          <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
            Order €{(freeDrinkMin - total).toFixed(2)} more for a free drink.
          </p>
        )}
        {fulfillmentType === "delivery" && deliveryQuote?.allowed && (
          <p style={{ fontSize: 14, color: deliveryQuote.freeDelivery ? "#2e7d32" : "#555" }}>
            Delivery:{" "}
            {deliveryQuote.freeDelivery
              ? "Free (minimum order reached)"
              : `${deliveryQuote.deliveryFee.toFixed(2)} €`}
          </p>
        )}
        <p style={{ fontSize: 18, fontWeight: 600 }}>
          Total:{" "}
          {(total + (fulfillmentType === "delivery" && deliveryQuote?.allowed
            ? deliveryQuote.deliveryFee
            : 0)).toFixed(2)}{" "}
          €
        </p>
        <p style={{ fontSize: 14, color: "#555" }}>
          Payment: Cash on {fulfillmentType === "pickup" ? "pickup" : "delivery"}
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600 }}>Order type</label>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {(["delivery", "pickup"] as FulfillmentType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFulfillmentType(type)}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                border: fulfillmentType === type ? "2px solid #c41e3a" : "1px solid #ccc",
                background: fulfillmentType === type ? "#fff5f5" : "#fff",
                fontWeight: fulfillmentType === type ? 600 : 400,
                textTransform: "capitalize"
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600 }}>When do you want it?</label>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            type="button"
            onClick={() => setTimingMode("asap")}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: timingMode === "asap" ? "2px solid #c41e3a" : "1px solid #ccc",
              background: timingMode === "asap" ? "#fff5f5" : "#fff",
              fontWeight: timingMode === "asap" ? 600 : 400
            }}
          >
            As soon as possible
          </button>
          <button
            type="button"
            onClick={() => setTimingMode("scheduled")}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: timingMode === "scheduled" ? "2px solid #c41e3a" : "1px solid #ccc",
              background: timingMode === "scheduled" ? "#fff5f5" : "#fff",
              fontWeight: timingMode === "scheduled" ? 600 : 400
            }}
          >
            Schedule
          </button>
        </div>

        {timingMode === "scheduled" && (
          <div style={{ marginTop: 12 }}>
            <select
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            >
              <option value="">Choose a time...</option>
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
            {scheduleError && <p style={{ color: "#b00020", marginTop: 4 }}>{scheduleError}</p>}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Your Name</label>
        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ display: "block", width: "100%", padding: 10, marginTop: 4, borderRadius: 8, border: "1px solid #ccc" }}
        />
        {nameError && <p style={{ color: "#b00020", marginTop: 4 }}>{nameError}</p>}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Phone Number</label>
        <input
          placeholder="e.g. 0171 1234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ display: "block", width: "100%", padding: 10, marginTop: 4, borderRadius: 8, border: "1px solid #ccc" }}
        />
        {phoneError && <p style={{ color: "#b00020", marginTop: 4 }}>{phoneError}</p>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Order notes (optional)</label>
        <textarea
          placeholder="e.g. ring the doorbell, contactless handover..."
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          rows={2}
          maxLength={300}
          style={{
            display: "block",
            width: "100%",
            padding: 10,
            marginTop: 4,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontFamily: "inherit"
          }}
        />
      </div>

      {fulfillmentType === "delivery" && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Delivery address</label>

          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 13, color: "#555" }}>Postcode</label>
            <select
              value={postalCode}
              onChange={(e) => handlePostcodeChange(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: 10,
                marginTop: 4,
                borderRadius: 8,
                border: "1px solid #ccc"
              }}
            >
              <option value="">Choose your postcode...</option>
              {deliveryAreas.map((area) => (
                <option key={area.postalCode} value={area.postalCode}>
                  {area.postalCode} {area.city ?? "Kempen"} (min. €{area.minimumOrder.toFixed(0)})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 13, color: "#555" }}>Street & house number</label>
            <div style={{ marginTop: 4 }}>
              <AddressAutocomplete
                branchId={branchId!}
                value={street}
                postalCode={postalCode || undefined}
                onChange={setStreet}
                onSelect={(s) => {
                  setStreet(s.street)
                  setPostalCode(s.postalCode)
                  setCity(s.city)
                }}
                placeholder="Start typing your street..."
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 13, color: "#555" }}>City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                display: "block",
                width: "100%",
                padding: 10,
                marginTop: 4,
                borderRadius: 8,
                border: "1px solid #ccc"
              }}
            />
          </div>

          {addressError && <p style={{ color: "#b00020", marginTop: 4 }}>{addressError}</p>}
          {quoteLoading && (
            <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>Checking delivery...</p>
          )}
          {deliveryQuote && !deliveryQuote.allowed && (
            <p style={{ color: "#b00020", marginTop: 6, fontSize: 13 }}>{deliveryQuote.message}</p>
          )}
          {deliveryQuote?.allowed && deliveryQuote.minimumOrder != null && total < deliveryQuote.minimumOrder && (
            <p style={{ color: "#b00020", marginTop: 6, fontSize: 13 }}>
              Minimum order: €{deliveryQuote.minimumOrder.toFixed(2)}
            </p>
          )}
          {deliveryQuote?.allowed && deliveryQuote.freeDelivery && (
            <p style={{ color: "#2e7d32", marginTop: 6, fontSize: 13 }}>
              You qualify for free delivery!
            </p>
          )}
          {deliveryAreas.length === 0 && (
            <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
              Delivery areas are loading...
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={createMutation.isPending || deliveryBlocked}
        style={{
          width: "100%",
          padding: "14px 20px",
          fontSize: 16,
          fontWeight: 600,
          background: deliveryBlocked ? "#ccc" : "#c41e3a",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: createMutation.isPending || deliveryBlocked ? "not-allowed" : "pointer",
          opacity: deliveryBlocked ? 0.85 : 1
        }}
      >
        {createMutation.isPending
          ? "Processing..."
          : deliveryBlocked && fulfillmentType === "delivery"
            ? quoteLoading
              ? "Checking delivery..."
              : "Complete delivery address"
            : "Place Order (Cash)"}
      </button>
    </div>
  )
}
