import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import {
  createOrder,
  getBranches,
  getBranchTimeSlots,
  getDeliveryQuote,
  validatePromoCode
} from "@/api/customer"
import { getPaymentConfig } from "@/api/payments"
import PayPalCardCheckout from "@/apps/customer/components/PayPalCardCheckout"
import AddressAutocomplete from "@/components/AddressAutocomplete"
import { useCartStore } from "@/store/cartStore"
import { calcWebsiteDiscount } from "@/lib/websitePromo"
import { formatCurrency } from "@/utils/format"

type FulfillmentType = "pickup" | "delivery"
type TimingMode = "asap" | "scheduled"
type PaymentChoice = "cash" | "card"

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
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>("cash")
  const [pendingCardOrderId, setPendingCardOrderId] = useState<string | null>(null)
  const [voucherInput, setVoucherInput] = useState("")
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string
    discountAmount: number
  } | null>(null)
  const [voucherError, setVoucherError] = useState("")
  const [voucherLoading, setVoucherLoading] = useState(false)

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

  const { data: paymentConfig } = useQuery({
    queryKey: ["paymentConfig"],
    queryFn: getPaymentConfig,
    staleTime: 5 * 60_000
  })

  const cardPaymentsEnabled = paymentConfig?.cardPaymentsEnabled ?? false

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
    if (!appliedVoucher) return

    const timer = setTimeout(async () => {
      try {
        const result = await validatePromoCode(appliedVoucher.code, total)
        setAppliedVoucher({
          code: result.code,
          discountAmount: result.discountAmount
        })
        setVoucherError("")
      } catch (err: any) {
        const message =
          err?.response?.data?.error?.message ??
          err?.response?.data?.message ??
          t("checkout.voucherInvalid")
        setVoucherError(message)
        setAppliedVoucher(null)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [total, appliedVoucher?.code, t])

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

  const subtotal = total
  const websiteDiscount = calcWebsiteDiscount(subtotal)
  const voucherDiscount = appliedVoucher?.discountAmount ?? 0
  const discountedSubtotal = Math.max(0, subtotal - websiteDiscount - voucherDiscount)
  const deliveryFee =
    fulfillmentType === "delivery" && deliveryQuote?.allowed ? deliveryQuote.deliveryFee : 0
  const grandTotal = discountedSubtotal + deliveryFee

  const handleApplyVoucher = async () => {
    const code = voucherInput.trim()
    if (!code) return

    setVoucherError("")
    setVoucherLoading(true)
    try {
      const result = await validatePromoCode(code, subtotal)
      setAppliedVoucher({
        code: result.code,
        discountAmount: result.discountAmount
      })
      setVoucherInput(result.code)
    } catch (err: any) {
      setAppliedVoucher(null)
      const message =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        t("checkout.voucherInvalid")
      setVoucherError(message)
    } finally {
      setVoucherLoading(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherInput("")
    setVoucherError("")
  }

  const deliveryBlocked =
    fulfillmentType === "delivery" &&
    (quoteLoading ||
      address.trim().length < 8 ||
      !deliveryQuote?.allowed ||
      (deliveryQuote.minimumOrder != null && total < deliveryQuote.minimumOrder))

  const validateCheckout = () => {
    setError("")
    setNameError("")
    setPhoneError("")
    setAddressError("")
    setScheduleError("")

    if (!name.trim()) {
      setNameError(t("checkout.nameRequired"))
      return false
    }

    if (!phone.trim()) {
      setPhoneError(t("checkout.phoneRequired"))
      return false
    }

    if (fulfillmentType === "delivery") {
      if (address.trim().length < 8) {
        setAddressError(t("checkout.addressRequired"))
        return false
      }
      if (!postalCode) {
        setAddressError(t("checkout.postcodeRequired"))
        return false
      }
    }

    if (timingMode === "scheduled" && !scheduledFor) {
      setScheduleError(t("checkout.scheduleRequired"))
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateCheckout()) return

    try {
      const res = await createMutation.mutateAsync({
        branchId,
        items,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        fulfillmentType,
        deliveryAddress: fulfillmentType === "delivery" ? address.trim() : undefined,
        scheduledFor: timingMode === "scheduled" ? scheduledFor : null,
        paymentMethod: paymentChoice === "card" ? "card" : "cash",
        promoCode: appliedVoucher?.code,
        notes: orderNotes.trim() || undefined
      })

      const orderId = res?.id
      if (!orderId) {
        setError(t("checkout.orderFailed"))
        return
      }

      if (paymentChoice === "card") {
        setPendingCardOrderId(orderId)
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

  const handleCardPaymentSuccess = () => {
    const orderId = pendingCardOrderId
    clearCart()
    setPendingCardOrderId(null)
    if (orderId) navigate(`/customer/order/${orderId}`)
  }

  const cashPaymentLabel =
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
        <p className="customer-hint" style={{ marginTop: 12 }}>
          {t("common.subtotal")}: {formatCurrency(subtotal)}
        </p>
        {websiteDiscount > 0 && (
          <p className="customer-alert customer-alert--success" style={{ marginTop: 8 }}>
            {t("checkout.websiteDiscountApplied", {
              percent: 10,
              amount: formatCurrency(websiteDiscount)
            })}
          </p>
        )}
        {voucherDiscount > 0 && appliedVoucher && (
          <p className="customer-alert customer-alert--success" style={{ marginTop: 8 }}>
            {t("checkout.voucherApplied", {
              code: appliedVoucher.code,
              amount: formatCurrency(voucherDiscount)
            })}
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
        <p className="customer-hint">
          {paymentChoice === "cash"
            ? t("checkout.payment", { method: cashPaymentLabel })
            : t("checkout.paymentCard")}
        </p>
      </div>

      <div className="customer-field">
        <label className="customer-label" htmlFor="checkout-voucher">
          {t("checkout.voucherLabel")}
        </label>
        <div className="checkout-voucher">
          <input
            id="checkout-voucher"
            className="customer-input checkout-voucher__input"
            placeholder={t("checkout.voucherPlaceholder")}
            value={voucherInput}
            onChange={(e) => {
              setVoucherInput(e.target.value.toUpperCase())
              if (appliedVoucher) setAppliedVoucher(null)
              setVoucherError("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                void handleApplyVoucher()
              }
            }}
            disabled={voucherLoading}
          />
          <button
            type="button"
            className="checkout-voucher__btn"
            onClick={() => void handleApplyVoucher()}
            disabled={voucherLoading || !voucherInput.trim()}
          >
            {voucherLoading ? t("common.processing") : t("checkout.voucherApply")}
          </button>
        </div>
        {voucherError && <p className="customer-error">{voucherError}</p>}
        {appliedVoucher && (
          <div className="checkout-voucher__applied">
            <span>
              {t("checkout.voucherActive", {
                code: appliedVoucher.code,
                amount: formatCurrency(appliedVoucher.discountAmount)
              })}
            </span>
            <button
              type="button"
              className="checkout-voucher__remove"
              onClick={handleRemoveVoucher}
            >
              {t("checkout.voucherRemove")}
            </button>
          </div>
        )}
      </div>

      {cardPaymentsEnabled && (
        <div className="customer-field">
          <label className="customer-label">{t("checkout.paymentMethod")}</label>
          <div className="customer-toggle-group">
            <button
              type="button"
              onClick={() => {
                setPaymentChoice("cash")
                setPendingCardOrderId(null)
              }}
              className={`customer-toggle${paymentChoice === "cash" ? " customer-toggle--active" : ""}`}
            >
              {t("checkout.payCash")}
            </button>
            <button
              type="button"
              onClick={() => setPaymentChoice("card")}
              className={`customer-toggle${paymentChoice === "card" ? " customer-toggle--active" : ""}`}
            >
              {t("checkout.payCard")}
            </button>
          </div>
        </div>
      )}

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
          <p className="customer-hint">{t("checkout.addressHintLive")}</p>
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

      {!pendingCardOrderId && (
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
              : paymentChoice === "card"
                ? t("checkout.continueToPayment")
                : t("checkout.placeOrder")}
        </button>
      )}

      {pendingCardOrderId && paymentConfig?.paypalClientId && (
        <PayPalCardCheckout
          orderId={pendingCardOrderId}
          paypalClientId={paymentConfig.paypalClientId}
          currency={paymentConfig.currency}
          onSuccess={handleCardPaymentSuccess}
          onError={(message) => setError(message)}
        />
      )}
    </div>
  )
}
