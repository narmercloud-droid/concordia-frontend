import React, { useEffect, useMemo, useRef, useState } from "react"
import { getStoredPushToken, isPushConfigured, subscribeToPush } from "@/utils/pushNotifications"
import { Link, useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Trans, useTranslation } from "react-i18next"
import {
  createOrder,
  getBranches,
  getBranchTimeSlots,
  getDeliveryQuote,
  getFreeDrinkOptions,
  validatePromoCode
} from "@/api/customer"
import { getPaymentConfig } from "@/api/payments"
import PayPalCheckout from "@/apps/customer/components/PayPalCheckout"
import PaymentMethodOption from "@/apps/customer/components/PaymentMethodOption"
import DeliveryAddressForm from "@/components/DeliveryAddressForm"
import { useAuthStore } from "@/context/authStore"
import { useCartStore } from "@/store/cartStore"
import { calcWebsiteDiscount } from "@/lib/websitePromo"
import {
  clearCheckoutDraft,
  loadCheckoutDraft,
  saveCheckoutDraft
} from "@/lib/checkoutDraft"
import { getApiErrorMessage, getOrderIdFromPayload } from "@/lib/apiErrors"
import {
  formatDeliveryAddress,
  isDeliveryAddressComplete,
  loadAddressFields,
  type DeliveryAddressFields
} from "@/lib/deliveryAddress"
import { formatCurrency } from "@/utils/format"

type FulfillmentType = "pickup" | "delivery"
type TimingMode = "asap" | "scheduled"
type PaymentChoice = "cash" | "card" | "paypal" | "klarna" | "sepa"
type CheckoutMode = "guest" | "account"

export default function CheckoutPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const clearCart = useCartStore((s) => s.clearCart)
  const branchId = items[0]?.branchId
  const savedDraft = useMemo(
    () => (branchId ? loadCheckoutDraft(branchId) : null),
    [branchId]
  )
  const hadSavedDraft = useRef(Boolean(savedDraft))
  const freeDrinkSectionRef = useRef<HTMLDivElement>(null)

  const authUser = useAuthStore((s) => s.user)
  const authToken = useAuthStore((s) => s.token)
  const isLoggedIn = !!authToken && !!authUser?.id

  const [name, setName] = useState(() => savedDraft?.name ?? "")
  const [phone, setPhone] = useState(() => savedDraft?.phone ?? "")
  const [addressFields, setAddressFields] = useState<DeliveryAddressFields>(() =>
    loadAddressFields(savedDraft)
  )
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>(
    () => savedDraft?.fulfillmentType ?? "delivery"
  )
  const [timingMode, setTimingMode] = useState<TimingMode>(() => savedDraft?.timingMode ?? "asap")
  const [scheduledFor, setScheduledFor] = useState(() => savedDraft?.scheduledFor ?? "")
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
  const [orderNotes, setOrderNotes] = useState(() => savedDraft?.orderNotes ?? "")
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>(
    () => savedDraft?.paymentChoice ?? "cash"
  )
  const [pendingCardOrderId, setPendingCardOrderId] = useState<string | null>(null)
  const [voucherInput, setVoucherInput] = useState(() => savedDraft?.voucherInput ?? "")
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string
    discountAmount: number
    kind?: "promo" | "gift"
    balanceRemaining?: number
  } | null>(() => savedDraft?.appliedVoucher ?? null)
  const [voucherError, setVoucherError] = useState("")
  const [voucherLoading, setVoucherLoading] = useState(false)
  const [freeDrinkChoice, setFreeDrinkChoice] = useState<number | "">(
    () => savedDraft?.freeDrinkChoice ?? ""
  )
  const [freeDrinkError, setFreeDrinkError] = useState("")
  const [customerEmail, setCustomerEmail] = useState(() => savedDraft?.customerEmail ?? "")
  const [emailError, setEmailError] = useState("")
  const [marketingEmail, setMarketingEmail] = useState(() => savedDraft?.marketingEmail ?? false)
  const [marketingSMS, setMarketingSMS] = useState(() => savedDraft?.marketingSMS ?? false)
  const [marketingWhatsApp, setMarketingWhatsApp] = useState(
    () => savedDraft?.marketingWhatsApp ?? false
  )
  const [birthday, setBirthday] = useState(() => savedDraft?.birthday ?? "")
  const [birthdayError, setBirthdayError] = useState("")
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>(() => {
    const token = localStorage.getItem("accessToken")
    const user = JSON.parse(localStorage.getItem("user") || "null")
    const loggedIn = !!token && !!user?.id
    if (loggedIn) return "account"
    return savedDraft?.checkoutMode ?? "account"
  })

  const deliveryAddress = formatDeliveryAddress(addressFields)
  const postalCode = addressFields.postalCode.trim() || null

  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches
  })

  const branchInfo = branches?.find((b: { id: string }) => b.id === branchId)
  const branchPromo = branchInfo?.promotions
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

  const paymentMethods = paymentConfig?.methods ?? {
    cash: true,
    card: false,
    paypal: false,
    klarna: false,
    sepa: false
  }
  const onlinePaymentChoice =
    paymentChoice === "card" || paymentChoice === "paypal"
  const needsOnlinePayment = onlinePaymentChoice && paymentMethods[paymentChoice]

  const { data: freeDrinkData, isLoading: freeDrinkLoading } = useQuery({
    queryKey: ["freeDrinkOptions", branchId],
    queryFn: () => getFreeDrinkOptions(branchId!),
    enabled: !!branchId && qualifiesForFreeDrink,
    staleTime: 5 * 60_000
  })

  const freeDrinkOptions = freeDrinkData?.options ?? []
  const needsFreeDrinkSelection = qualifiesForFreeDrink
  const freeDrinkChosen =
    freeDrinkChoice !== "" && typeof freeDrinkChoice === "number"
  const freeDrinkBlocking =
    needsFreeDrinkSelection &&
    (freeDrinkLoading || freeDrinkOptions.length === 0 || !freeDrinkChosen)

  const createMutation = useMutation({
    mutationFn: createOrder
  })

  useEffect(() => {
    if (fulfillmentType !== "delivery" || !branchId || !isDeliveryAddressComplete(addressFields)) {
      setDeliveryQuote(null)
      return
    }

    const timer = setTimeout(async () => {
      setQuoteLoading(true)
      try {
        const quote = await getDeliveryQuote(
          branchId,
          deliveryAddress,
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
  }, [addressFields, branchId, deliveryAddress, fulfillmentType, postalCode, total])

  useEffect(() => {
    if (!appliedVoucher) return

    const timer = setTimeout(async () => {
      try {
        if (!branchId) return
        const result = await validatePromoCode(appliedVoucher.code, total, branchId)
        setAppliedVoucher({
          code: result.code,
          discountAmount: result.discountAmount,
          kind: result.kind,
          balanceRemaining: result.balanceRemaining
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

  useEffect(() => {
    if (!branchId) return

    const timer = window.setTimeout(() => {
      saveCheckoutDraft({
        branchId,
        name,
        phone,
        address: deliveryAddress,
        addressFields,
        fulfillmentType,
        timingMode,
        scheduledFor,
        orderNotes,
        paymentChoice,
        voucherInput,
        appliedVoucher,
        freeDrinkChoice,
        customerEmail,
        marketingEmail,
        marketingSMS,
        marketingWhatsApp,
        birthday,
        checkoutMode
      })
    }, 200)

    return () => window.clearTimeout(timer)
  }, [
    branchId,
    name,
    phone,
    addressFields,
    deliveryAddress,
    fulfillmentType,
    timingMode,
    scheduledFor,
    orderNotes,
    paymentChoice,
    voucherInput,
    appliedVoucher,
    freeDrinkChoice,
    customerEmail,
    marketingEmail,
    marketingSMS,
    marketingWhatsApp,
    birthday,
    checkoutMode
  ])

  useEffect(() => {
    if (!isLoggedIn || !authUser) return
    setCheckoutMode("account")
    if (!hadSavedDraft.current || !name) {
      if (authUser.name) setName(authUser.name)
    }
    if (!hadSavedDraft.current || !customerEmail) {
      if (authUser.email) setCustomerEmail(authUser.email)
    }
    if (!hadSavedDraft.current || !phone) {
      if (authUser.phone) setPhone(authUser.phone)
    }
  }, [isLoggedIn, authUser, name, customerEmail, phone])

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
      !isDeliveryAddressComplete(addressFields) ||
      !deliveryQuote?.allowed ||
      (deliveryQuote.minimumOrder != null && total < deliveryQuote.minimumOrder))

  const validateCheckout = () => {
    setError("")
    setNameError("")
    setPhoneError("")
    setAddressError("")
    setScheduleError("")
    setFreeDrinkError("")
    setEmailError("")
    setBirthdayError("")

    if (!name.trim()) {
      setNameError(t("checkout.nameRequired"))
      return false
    }

    if (!phone.trim()) {
      setPhoneError(t("checkout.phoneRequired"))
      return false
    }

    if (fulfillmentType === "delivery") {
      if (!/^\d{5}$/.test(addressFields.postalCode.trim())) {
        setAddressError(t("checkout.postcodeRequired"))
        return false
      }
      if (!addressFields.city.trim()) {
        setAddressError(t("checkout.addressRequired"))
        return false
      }
      if (!addressFields.street.trim()) {
        setAddressError(t("checkout.addressRequired"))
        return false
      }
      if (!addressFields.houseNumber.trim()) {
        setAddressError(t("checkout.addressRequired"))
        return false
      }
    }

    if (timingMode === "scheduled" && !scheduledFor) {
      setScheduleError(t("checkout.scheduleRequired"))
      return false
    }

    if (needsFreeDrinkSelection && !freeDrinkChosen) {
      const message = t("checkout.freeDrinkRequired")
      setError(message)
      setFreeDrinkError(message)
      freeDrinkSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return false
    }

    if (marketingEmail && !customerEmail.trim()) {
      setEmailError(t("checkout.emailRequiredForOffers"))
      return false
    }

    const hasMarketing = marketingEmail || marketingSMS || marketingWhatsApp
    if (hasMarketing && birthday) {
      const parsed = new Date(birthday)
      if (Number.isNaN(parsed.getTime())) {
        setBirthdayError(t("checkout.birthdayInvalid"))
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (branchesLoading) {
      setError(t("common.processing"))
      return
    }

    if (!validateCheckout()) return

    if (checkoutMode === "account" && !isLoggedIn) {
      setError(t("checkout.accountLoginRequired"))
      return
    }

    try {
      const useAccount = checkoutMode === "account" && isLoggedIn
      let pushToken = getStoredPushToken()
      if (isPushConfigured() && !pushToken) {
        pushToken = await subscribeToPush()
      }

      const res = await createMutation.mutateAsync({
        branchId,
        items,
        isGuest: !useAccount,
        customerId: useAccount ? authUser.id : undefined,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        freeDrinkChoice:
          needsFreeDrinkSelection && freeDrinkChosen ? Number(freeDrinkChoice) : undefined,
        marketingEmail,
        marketingSMS,
        marketingWhatsApp,
        birthday: birthday || undefined,
        fulfillmentType,
        deliveryAddress: fulfillmentType === "delivery" ? deliveryAddress : undefined,
        scheduledFor: timingMode === "scheduled" ? scheduledFor : null,
        paymentMethod: paymentChoice,
        promoCode: appliedVoucher?.code,
        notes: orderNotes.trim() || undefined,
        pushToken: pushToken ?? undefined
      })

      const orderId = getOrderIdFromPayload(res)
      if (!orderId) {
        setError(t("checkout.orderFailed"))
        return
      }

      if (needsOnlinePayment) {
        setPendingCardOrderId(orderId)
        return
      }

      clearCart()
      clearCheckoutDraft()
      navigate(`/customer/order/${orderId}`)
    } catch (err: unknown) {
      const message = getApiErrorMessage(err) ?? t("checkout.orderFailed")
      setError(message)
      if (message.includes("Gratisgetränk") || message.toLowerCase().includes("free drink")) {
        setFreeDrinkError(t("checkout.freeDrinkRequired"))
        freeDrinkSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  const handleCardPaymentSuccess = () => {
    const orderId = pendingCardOrderId
    clearCart()
    clearCheckoutDraft()
    setPendingCardOrderId(null)
    if (orderId) navigate(`/customer/order/${orderId}`)
  }

  const cashPaymentLabel =
    fulfillmentType === "pickup" ? t("checkout.paymentPickup") : t("checkout.paymentDelivery")

  return (
    <div className="customer-page">
      <h2 className="customer-title">{t("checkout.title")}</h2>

      {error && <div className="customer-alert customer-alert--error">{error}</div>}

      <div className="customer-card checkout-account">
        {isLoggedIn && authUser ? (
          <div className="checkout-account__logged-in">
            <h3 className="customer-subtitle">{t("checkout.orderWithAccount")}</h3>
            <p className="customer-hint">
              {t("checkout.welcomeBack", { name: authUser.name })}
            </p>
            <p className="customer-alert customer-alert--success">
              {t("checkout.loyaltyBalance", {
                points: authUser.loyaltyPoints ?? 0,
                tier: authUser.loyaltyTier ?? "bronze"
              })}
            </p>
          </div>
        ) : (
          <>
        <h3 className="customer-subtitle">{t("checkout.howToOrder")}</h3>
        <div className="customer-toggle-group">
          <button
            type="button"
            onClick={() => setCheckoutMode("account")}
            className={`customer-toggle${checkoutMode === "account" ? " customer-toggle--active" : ""}`}
          >
            {t("checkout.orderWithAccount")}
          </button>
          <button
            type="button"
            onClick={() => setCheckoutMode("guest")}
            className={`customer-toggle${checkoutMode === "guest" ? " customer-toggle--active" : ""}`}
          >
            {t("checkout.orderAsGuest")}
          </button>
        </div>

        {checkoutMode === "account" && !isLoggedIn && (
          <div className="checkout-account__prompt">
            <p className="customer-hint">{t("checkout.accountBenefits")}</p>
            <ul className="checkout-marketing__perks">
              <li>{t("checkout.loyaltyPerkPoints")}</li>
              <li>{t("checkout.loyaltyPerkTier")}</li>
              <li>{t("checkout.marketingPerkBirthday")}</li>
            </ul>
            <div className="customer-btn-row">
              <Link
                to="/customer/login?redirect=%2Fcustomer%2Fcheckout"
                className="customer-btn customer-btn--primary"
              >
                {t("auth.login")}
              </Link>
              <Link to="/customer/register?redirect=%2Fcustomer%2Fcheckout" className="customer-btn">
                {t("auth.register")}
              </Link>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      <div className="customer-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <h3 className="customer-subtitle" style={{ margin: 0 }}>
            {t("checkout.summary")}
          </h3>
          <Link to="/customer/cart" className="customer-hint" style={{ color: "var(--c-accent)" }}>
            {t("cart.edit")}
          </Link>
        </div>
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
        {needsFreeDrinkSelection && (
          <div
            ref={freeDrinkSectionRef}
            className="checkout-free-drink checkout-free-drink--summary"
            style={{ marginTop: 12 }}
          >
            <label className="customer-label">{t("checkout.freeDrinkTitle")}</label>
            <p className="customer-hint">{t("checkout.freeDrinkHint")}</p>
            {freeDrinkLoading ? (
              <p className="customer-hint">{t("common.processing")}</p>
            ) : (
              <div className="checkout-free-drink__options" role="radiogroup">
                {freeDrinkOptions.map((drink) => (
                  <label
                    key={drink.id}
                    className={`checkout-free-drink__option${
                      freeDrinkChoice === drink.id ? " checkout-free-drink__option--active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="freeDrink"
                      value={drink.id}
                      checked={freeDrinkChoice === drink.id}
                      onChange={() => {
                        setFreeDrinkChoice(drink.id)
                        setFreeDrinkError("")
                        setError("")
                      }}
                    />
                    <span>{drink.label}</span>
                  </label>
                ))}
              </div>
            )}
            {!freeDrinkChosen && !freeDrinkLoading && (
              <p className="customer-error">{t("checkout.freeDrinkRequired")}</p>
            )}
            {freeDrinkError && <p className="customer-error">{freeDrinkError}</p>}
          </div>
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
        <p className="customer-hint">{paymentSummaryLabel(t, paymentChoice, cashPaymentLabel)}</p>
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
              {appliedVoucher.kind === "gift" && appliedVoucher.balanceRemaining != null
                ? t("checkout.giftCardActive", {
                    code: appliedVoucher.code,
                    amount: formatCurrency(appliedVoucher.discountAmount),
                    remaining: formatCurrency(appliedVoucher.balanceRemaining)
                  })
                : t("checkout.voucherActive", {
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

      <div className="customer-field">
        <label className="customer-label">{t("checkout.paymentMethod")}</label>
        <div className="checkout-payment-grid">
          <PaymentMethodOption
            method="cash"
            label={t("checkout.payCash")}
            active={paymentChoice === "cash"}
            enabled={paymentMethods.cash}
            comingSoon={t("checkout.comingSoon")}
            onSelect={() => {
              setPaymentChoice("cash")
              setPendingCardOrderId(null)
            }}
          />
          <PaymentMethodOption
            method="card"
            label={t("checkout.payCard")}
            active={paymentChoice === "card"}
            enabled={paymentMethods.card}
            comingSoon={t("checkout.comingSoon")}
            onSelect={() => {
              setPaymentChoice("card")
              setPendingCardOrderId(null)
            }}
          />
          <PaymentMethodOption
            method="paypal"
            label={t("checkout.payPayPal")}
            active={paymentChoice === "paypal"}
            enabled={paymentMethods.paypal}
            comingSoon={t("checkout.comingSoon")}
            onSelect={() => {
              setPaymentChoice("paypal")
              setPendingCardOrderId(null)
            }}
          />
          <PaymentMethodOption
            method="klarna"
            label={t("checkout.payKlarna")}
            active={paymentChoice === "klarna"}
            enabled={paymentMethods.klarna}
            comingSoon={t("checkout.comingSoon")}
            onSelect={() => setPaymentChoice("klarna")}
          />
          <PaymentMethodOption
            method="sepa"
            label={t("checkout.paySepa")}
            active={paymentChoice === "sepa"}
            enabled={paymentMethods.sepa}
            comingSoon={t("checkout.comingSoon")}
            onSelect={() => setPaymentChoice("sepa")}
          />
        </div>
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
          <h3 className="customer-subtitle">{t("checkout.address")}</h3>
          <p className="customer-hint" style={{ marginBottom: 12 }}>
            {t("checkout.addressStructuredHint")}
          </p>
          <DeliveryAddressForm
            branchId={branchId!}
            branchCity={branchInfo?.city}
            value={addressFields}
            onChange={(fields) => {
              setAddressFields(fields)
              setAddressError("")
            }}
            error={addressError}
          />
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

      <div className="customer-card checkout-marketing">
        <h3 className="customer-subtitle">{t("checkout.marketingTitle")}</h3>
        <p className="customer-hint">{t("checkout.marketingHint")}</p>
        <div className="checkout-marketing__channels">
          <label className="checkout-marketing__channel">
            <input
              type="checkbox"
              checked={marketingSMS}
              onChange={(e) => setMarketingSMS(e.target.checked)}
            />
            <span>{t("checkout.marketingSMS")}</span>
          </label>
          <label className="checkout-marketing__channel">
            <input
              type="checkbox"
              checked={marketingWhatsApp}
              onChange={(e) => setMarketingWhatsApp(e.target.checked)}
            />
            <span>{t("checkout.marketingWhatsApp")}</span>
          </label>
          <label className="checkout-marketing__channel">
            <input
              type="checkbox"
              checked={marketingEmail}
              onChange={(e) => {
                setMarketingEmail(e.target.checked)
                if (!e.target.checked) setEmailError("")
              }}
            />
            <span>{t("checkout.marketingEmail")}</span>
          </label>
        </div>
        {marketingEmail && (
          <div style={{ marginTop: 12 }}>
            <input
              className="customer-input"
              type="email"
              placeholder={t("checkout.emailPlaceholder")}
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value)
                setEmailError("")
              }}
              autoComplete="email"
            />
            {emailError && <p className="customer-error">{emailError}</p>}
          </div>
        )}
        {(marketingEmail || marketingSMS || marketingWhatsApp) && (
          <div className="checkout-marketing__birthday" style={{ marginTop: 12 }}>
            <label className="customer-label">{t("checkout.birthdayLabel")}</label>
            <p className="customer-hint">{t("checkout.birthdayHint")}</p>
            <input
              className="customer-input"
              type="date"
              value={birthday}
              onChange={(e) => {
                setBirthday(e.target.value)
                setBirthdayError("")
              }}
              max={new Date().toISOString().slice(0, 10)}
            />
            {birthdayError && <p className="customer-error">{birthdayError}</p>}
          </div>
        )}
        <p className="customer-hint checkout-marketing__legal">{t("checkout.marketingLegal")}</p>
      </div>

      {!pendingCardOrderId && (
        <>
        <p className="customer-hint checkout-terms-notice">
          <Trans
            i18nKey="checkout.termsNotice"
            components={{
              termsLink: <Link to="/terms" className="checkout-terms-link" />
            }}
          />
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={createMutation.isPending || deliveryBlocked || branchesLoading || freeDrinkBlocking}
          className="customer-btn customer-btn--primary"
        >
          {createMutation.isPending || branchesLoading
            ? t("common.processing")
            : freeDrinkBlocking
              ? t("checkout.freeDrinkRequired")
              : deliveryBlocked && fulfillmentType === "delivery"
                ? quoteLoading
                  ? t("checkout.checkingDelivery")
                  : t("checkout.completeAddress")
                : needsOnlinePayment
                  ? t("checkout.continueToPayment")
                  : t("checkout.placeOrder")}
        </button>
        </>
      )}

      {pendingCardOrderId && paymentConfig?.paypalClientId && needsOnlinePayment && (
        <div className="customer-card" style={{ marginTop: 16 }}>
          <h3 className="customer-subtitle">{t("checkout.onlinePaymentTitle")}</h3>
          <PayPalCheckout
            orderId={pendingCardOrderId}
            paypalClientId={paymentConfig.paypalClientId}
            currency={paymentConfig.currency}
            fundingSource={paymentChoice === "card" ? "card" : "paypal"}
            onSuccess={handleCardPaymentSuccess}
            onError={(message) => setError(message)}
          />
        </div>
      )}
    </div>
  )
}

function paymentSummaryLabel(
  t: (key: string, opts?: Record<string, string>) => string,
  choice: PaymentChoice,
  cashLabel: string
) {
  if (choice === "cash") return t("checkout.payment", { method: cashLabel })
  const keys: Record<PaymentChoice, string> = {
    cash: "checkout.payment",
    card: "checkout.paymentCard",
    paypal: "checkout.paymentPaypal",
    klarna: "checkout.paymentKlarna",
    sepa: "checkout.paymentSepa"
  }
  return t(keys[choice])
}

