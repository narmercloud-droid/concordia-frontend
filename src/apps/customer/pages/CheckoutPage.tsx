import React, { useEffect, useMemo, useRef, useState } from "react"
import { getStoredPushToken, isPushConfigured, subscribeToPush } from "@/utils/pushNotifications"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Trans, useTranslation } from "react-i18next"
import {
  createOrder,
  getBranches,
  getBranchDeliveryAreas,
  getBranchTimeSlots,
  getDeliveryQuote,
  getFreeDrinkOptions,
  validatePromoCode
} from "@/api/customer"
import { listAddresses, type SavedAddress } from "@/api/addresses"
import { createStripePaymentIntent, getPaymentConfig } from "@/api/payments"
import PayPalCheckout from "@/apps/customer/components/PayPalCheckout"
import StripeCheckout from "@/apps/customer/components/StripeCheckout"
import PaymentMethodPicker from "@/apps/customer/components/PaymentMethodPicker"
import CheckoutLegalFooter from "@/apps/customer/components/CheckoutLegalFooter"
import CheckoutChoiceCard from "@/apps/customer/components/CheckoutChoiceCard"
import PriceVatNote from "@/apps/customer/components/PriceVatNote"
import WebsiteDiscountBanner from "@/apps/customer/components/WebsiteDiscountBanner"
import { hasMarketingConsent } from "@/apps/customer/components/CookieConsent"
import type { PaymentMethodId } from "@/apps/customer/components/PaymentMethodOption"
import DeliveryAddressForm from "@/components/DeliveryAddressForm"
import { useAuthStore } from "@/context/authStore"
import { useCartStore } from "@/store/cartStore"
import { saveCartItems } from "@/lib/cartStorage"
import { calcWebsiteDiscount } from "@/lib/websitePromo"
import {
  clearCheckoutDraft,
  loadCheckoutDraft,
  saveCheckoutDraft
} from "@/lib/checkoutDraft"
import { getApiErrorMessage, getOrderIdFromPayload } from "@/lib/apiErrors"
import {
  EMPTY_DELIVERY_ADDRESS,
  formatDeliveryAddress,
  isDeliveryAddressComplete,
  loadAddressFields,
  parseLegacyAddress,
  type DeliveryAddressFields
} from "@/lib/deliveryAddress"
import { formatCurrency } from "@/utils/format"
import { usePlatformPromo } from "@/hooks/usePlatformPromo"
import { listMyCoupons } from "@/api/coupons"
import {
  loadFulfillmentIntent,
  parseFulfillmentParam
} from "@/lib/fulfillmentIntent"

type FulfillmentType = "pickup" | "delivery"
type TimingMode = "asap" | "scheduled"
type PaymentChoice = "cash" | "card" | "apple_pay" | "google_pay" | "paypal" | "klarna" | "sepa"
type CheckoutMode = "guest" | "account"

type CheckoutValidationIssue = {
  id: string
  message: string
  focus?: () => void
}

export default function CheckoutPage() {
  const { t } = useTranslation()
  const platformPromo = usePlatformPromo()
  const navigate = useNavigate()
  const location = useLocation()
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
  const nameFieldRef = useRef<HTMLDivElement>(null)
  const phoneFieldRef = useRef<HTMLDivElement>(null)
  const addressSectionRef = useRef<HTMLDivElement>(null)
  const scheduleFieldRef = useRef<HTMLDivElement>(null)
  const marketingSectionRef = useRef<HTMLDivElement>(null)
  const orderSubmittedRef = useRef(false)
  const autoCouponAppliedRef = useRef(Boolean(savedDraft?.appliedVoucher))

  const authUser = useAuthStore((s) => s.user)
  const authToken = useAuthStore((s) => s.token)
  const isLoggedIn = !!authToken && !!authUser?.id

  const { data: walletData } = useQuery({
    queryKey: ["customerCoupons", branchId],
    queryFn: () => listMyCoupons(branchId!),
    enabled: isLoggedIn && !!branchId
  })

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
  const [pendingStripeSession, setPendingStripeSession] = useState<{
    orderId: string
    clientSecret: string
    stripeAccountId: string
    publishableKey: string
    customerSessionClientSecret?: string | null
    savePaymentMethodOffered?: boolean
  } | null>(null)
  const [awaitingPaymentOrderId, setAwaitingPaymentOrderId] = useState<string | null>(null)
  const [voucherInput, setVoucherInput] = useState(() => savedDraft?.voucherInput ?? "")
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string
    discountAmount: number
    kind?: "promo" | "gift" | "customer_coupon"
    balanceRemaining?: number
    freeDelivery?: boolean
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
  const [marketingPush, setMarketingPush] = useState(() => savedDraft?.marketingPush ?? false)
  const [birthday, setBirthday] = useState(() => savedDraft?.birthday ?? "")
  const [birthdayError, setBirthdayError] = useState("")
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>(() => {
    const token = localStorage.getItem("accessToken")
    const user = JSON.parse(localStorage.getItem("user") || "null")
    const loggedIn = !!token && !!user?.id
    if (loggedIn) return "account"
    return savedDraft?.checkoutMode ?? "guest"
  })
  const [validationModalOpen, setValidationModalOpen] = useState(false)
  const [validationIssues, setValidationIssues] = useState<CheckoutValidationIssue[]>([])

  const deliveryAddress = formatDeliveryAddress(addressFields)
  const postalCode = addressFields.postalCode.trim() || null

  const applySavedAddress = (address: SavedAddress) => {
    const parsed = parseLegacyAddress(address.street)
    setAddressFields({
      ...EMPTY_DELIVERY_ADDRESS,
      street: parsed.houseNumber ? parsed.street : address.street,
      houseNumber: parsed.houseNumber,
      city: address.city,
      postalCode: address.postalCode,
      floor: address.instructions ?? "",
      lat: address.lat ?? undefined,
      lng: address.lng ?? undefined
    })
    setAddressError("")
  }

  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches
  })

  const branchInfo = branches?.find(
    (b: { id: string; comingSoon?: boolean; isOpen?: boolean }) => b.id === branchId
  )
  const branchClosed =
    branchInfo != null && !branchInfo.comingSoon && branchInfo.isOpen === false
  const branchPromo = branchInfo?.promotions
  const freeDrinkMin = branchPromo?.freeDrinkMinOrder ?? 0
  const showFreeDrinkCheckout = platformPromo.showFreeDrinkCheckout
  const showLoyaltyCheckout = platformPromo.showLoyaltyCheckout
  const websiteDiscountEnabled = branchPromo?.websiteDiscountEnabled !== false
  const checkoutDiscountPct = websiteDiscountEnabled ? platformPromo.websiteOrderDiscountPct : 0
  const allowCheckoutVouchers = !(websiteDiscountEnabled && checkoutDiscountPct > 0)
  const qualifiesForFreeDrink =
    showFreeDrinkCheckout && freeDrinkMin > 0 && total >= freeDrinkMin

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["timeSlots", branchId],
    queryFn: () => getBranchTimeSlots(branchId!),
    enabled: !!branchId && (timingMode === "scheduled" || branchClosed)
  })

  const timeSlots: Array<{ label: string; value: string }> = slotsData?.slots ?? []

  const { data: paymentConfig } = useQuery({
    queryKey: ["paymentConfig", branchId],
    queryFn: () => getPaymentConfig(branchId!),
    enabled: !!branchId,
    staleTime: 60_000
  })

  const paymentMethods = paymentConfig?.methods ?? {
    cash: true,
    card: false,
    apple_pay: false,
    google_pay: false,
    paypal: false,
    klarna: false,
    sepa: false
  }
  const stripePaymentChoices = new Set<PaymentChoice>(["card", "apple_pay", "google_pay"])
  const needsStripePayment =
    stripePaymentChoices.has(paymentChoice) && paymentMethods[paymentChoice]
  const needsPayPalPayment = paymentChoice === "paypal" && paymentMethods.paypal
  const needsOnlinePayment = needsStripePayment || needsPayPalPayment

  useEffect(() => {
    if (paymentMethods[paymentChoice]) return
    const fallback = (
      ["cash", "card", "apple_pay", "google_pay", "paypal"] as PaymentChoice[]
    ).find((method) => paymentMethods[method])
    if (fallback) setPaymentChoice(fallback)
  }, [paymentConfig, paymentMethods, paymentChoice])

  useEffect(() => {
    if (!branchId) return
    const fromUrl = parseFulfillmentParam(
      new URLSearchParams(location.search).get("fulfillment")
    )
    const fromIntent = loadFulfillmentIntent(branchId)
    const next = fromUrl ?? fromIntent
    if (next) setFulfillmentType(next)
  }, [branchId, location.search])

  const { data: freeDrinkData, isLoading: freeDrinkLoading } = useQuery({
    queryKey: ["freeDrinkOptions", branchId],
    queryFn: () => getFreeDrinkOptions(branchId!),
    enabled: showFreeDrinkCheckout && !!branchId && qualifiesForFreeDrink,
    staleTime: 5 * 60_000
  })

  const { data: savedAddresses = [] } = useQuery({
    queryKey: ["customerAddresses"],
    queryFn: listAddresses,
    enabled: isLoggedIn && fulfillmentType === "delivery"
  })

  const { data: deliveryInfo } = useQuery({
    queryKey: ["deliveryAreas", branchId],
    queryFn: () => getBranchDeliveryAreas(branchId!),
    enabled: !!branchId && fulfillmentType === "delivery",
    staleTime: 60_000
  })

  const freeDrinkOptions = freeDrinkData?.options ?? []
  const needsFreeDrinkSelection = qualifiesForFreeDrink
  const freeDrinkChosen =
    freeDrinkChoice !== "" && typeof freeDrinkChoice === "number"
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
          postalCode ?? undefined,
          {
            lat: addressFields.lat,
            lng: addressFields.lng
          }
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
    if (branchClosed && timingMode === "asap") {
      setTimingMode("scheduled")
    }
  }, [branchClosed, timingMode])

  useEffect(() => {
    if (allowCheckoutVouchers) return
    if (appliedVoucher || voucherInput) {
      setAppliedVoucher(null)
      setVoucherInput("")
      setVoucherError("")
    }
  }, [allowCheckoutVouchers])

  useEffect(() => {
    if (!allowCheckoutVouchers) return
    if (autoCouponAppliedRef.current || appliedVoucher || !walletData?.activatedCouponId || !branchId) {
      return
    }

    const activated = walletData.coupons.find((c) => c.id === walletData.activatedCouponId)
    if (!activated) return

    autoCouponAppliedRef.current = true
    void validatePromoCode(activated.claimCode, total, branchId)
      .then((result) => {
        setAppliedVoucher({
          code: result.code,
          discountAmount: result.discountAmount,
          kind: result.kind,
          freeDelivery: result.freeDelivery,
          balanceRemaining: result.balanceRemaining
        })
        setVoucherInput(result.code)
        setVoucherError("")
      })
      .catch(() => {
        autoCouponAppliedRef.current = false
      })
  }, [walletData, appliedVoucher, branchId, total])

  useEffect(() => {
    if (!allowCheckoutVouchers || !appliedVoucher) return

    const timer = setTimeout(async () => {
      try {
        if (!branchId) return
        const result = await validatePromoCode(appliedVoucher.code, total, branchId)
        setAppliedVoucher({
          code: result.code,
          discountAmount: result.discountAmount,
          kind: result.kind,
          balanceRemaining: result.balanceRemaining,
          freeDelivery: result.freeDelivery
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
    if (orderSubmittedRef.current) return

    if (items.length === 0) {
      navigate("/customer/cart", { replace: true })
      return
    }

    const branchSet = new Set(items.map((item) => item.branchId))
    if (branchSet.size > 1) {
      const keepBranch = branchId ?? items[0]!.branchId
      const filtered = items.filter((item) => item.branchId === keepBranch)
      useCartStore.setState({ items: filtered })
      saveCartItems(filtered)
      setError(t("cart.branchMismatch"))
      return
    }
  }, [items, navigate, clearCart])

  const goToOrderConfirmation = (orderId: string) => {
    orderSubmittedRef.current = true
    clearCheckoutDraft()
    navigate(`/customer/order/${orderId}`, { replace: true, state: { justPlaced: true } })
    clearCart()
  }

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
        marketingPush,
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
    marketingPush,
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

  const estimatedFreeDeliveryGap = useMemo(() => {
    if (fulfillmentType !== "delivery") return null
    const zones = deliveryInfo?.radiusZones ?? []
    if (!zones.length) return null
    const gaps = zones
      .map((zone) => {
        const threshold =
          zone.freeDeliveryMinimum ??
          (deliveryInfo?.freeDeliveryAtMinimum !== false ? zone.minimumOrder : null)
        if (threshold == null || total >= threshold) return null
        return Math.round((threshold - total) * 100) / 100
      })
      .filter((gap): gap is number => gap != null && gap > 0)
    return gaps.length ? Math.min(...gaps) : null
  }, [deliveryInfo, fulfillmentType, total])

  const freeDeliveryGap = useMemo(() => {
    if (fulfillmentType !== "delivery") return null
    if (deliveryQuote?.allowed && deliveryQuote.freeDelivery) return null
    if (
      deliveryQuote?.allowed &&
      !deliveryQuote.freeDelivery &&
      (deliveryQuote.amountToFreeDelivery ?? 0) > 0
    ) {
      return deliveryQuote.amountToFreeDelivery!
    }
    return estimatedFreeDeliveryGap
  }, [fulfillmentType, deliveryQuote, estimatedFreeDeliveryGap])

  if (items.length === 0) return null

  const subtotal = total
  const discountPct = checkoutDiscountPct
  const websiteDiscount = calcWebsiteDiscount(subtotal, discountPct)
  const voucherDiscount = allowCheckoutVouchers ? (appliedVoucher?.discountAmount ?? 0) : 0
  const discountedSubtotal = Math.max(0, subtotal - websiteDiscount - voucherDiscount)
  const quotedDeliveryFee =
    fulfillmentType === "delivery" && deliveryQuote?.allowed ? deliveryQuote.deliveryFee : 0
  const deliveryFee =
    allowCheckoutVouchers &&
    appliedVoucher?.freeDelivery &&
    fulfillmentType === "delivery" &&
    deliveryQuote?.allowed
      ? 0
      : quotedDeliveryFee
  const grandTotal = discountedSubtotal + deliveryFee

  const handleApplyVoucher = async () => {
    const code = voucherInput.trim()
    if (!code) return
    if (!branchId) {
      setVoucherError(t("checkout.voucherInvalid"))
      return
    }

    setVoucherError("")
    setVoucherLoading(true)
    try {
      const result = await validatePromoCode(code, subtotal, branchId)
      setAppliedVoucher({
        code: result.code,
        discountAmount: result.discountAmount,
        kind: result.kind,
        freeDelivery: result.freeDelivery,
        balanceRemaining: result.balanceRemaining
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

  const scrollToField = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    const focusable = ref.current?.querySelector<HTMLElement>(
      "input:not([type=hidden]), select, textarea, button"
    )
    focusable?.focus()
  }

  const openValidationModal = (issues: CheckoutValidationIssue[]) => {
    if (issues.length === 0) return
    setValidationIssues(issues)
    setValidationModalOpen(true)
    setError(issues[0].message)
  }

  const closeValidationModal = (focusFirst = false, issues = validationIssues) => {
    setValidationModalOpen(false)
    if (focusFirst && issues[0]?.focus) {
      window.setTimeout(() => issues[0]?.focus?.(), 150)
    }
  }

  const validateCheckout = (): CheckoutValidationIssue[] => {
    setError("")
    setNameError("")
    setPhoneError("")
    setAddressError("")
    setScheduleError("")
    setFreeDrinkError("")
    setEmailError("")
    setBirthdayError("")

    const issues: CheckoutValidationIssue[] = []
    const addIssue = (
      id: string,
      message: string,
      options?: { focus?: () => void; setFieldError?: (message: string) => void }
    ) => {
      options?.setFieldError?.(message)
      issues.push({ id, message, focus: options?.focus })
    }

    if (!name.trim()) {
      addIssue("name", t("checkout.nameRequired"), {
        setFieldError: setNameError,
        focus: () => scrollToField(nameFieldRef)
      })
    }

    if (!phone.trim()) {
      addIssue("phone", t("checkout.phoneRequired"), {
        setFieldError: setPhoneError,
        focus: () => scrollToField(phoneFieldRef)
      })
    }

    if (fulfillmentType === "delivery") {
      if (quoteLoading) {
        addIssue("deliveryQuote", t("checkout.checkingDelivery"))
      } else if (!/^\d{5}$/.test(addressFields.postalCode.trim())) {
        addIssue("postcode", t("checkout.postcodeRequired"), {
          setFieldError: setAddressError,
          focus: () => scrollToField(addressSectionRef)
        })
      } else if (!addressFields.city.trim()) {
        addIssue("city", t("checkout.addressRequired"), {
          setFieldError: setAddressError,
          focus: () => scrollToField(addressSectionRef)
        })
      } else if (!addressFields.street.trim()) {
        addIssue("street", t("checkout.addressRequired"), {
          setFieldError: setAddressError,
          focus: () => scrollToField(addressSectionRef)
        })
      } else if (!addressFields.houseNumber.trim()) {
        addIssue("houseNumber", t("checkout.addressRequired"), {
          setFieldError: setAddressError,
          focus: () => scrollToField(addressSectionRef)
        })
      } else if (deliveryQuote && !deliveryQuote.allowed) {
        const message = deliveryQuote.message ?? t("checkout.completeAddress")
        addIssue("deliveryArea", message, {
          setFieldError: setAddressError,
          focus: () => scrollToField(addressSectionRef)
        })
      } else if (
        isDeliveryAddressComplete(addressFields) &&
        deliveryQuote === null
      ) {
        addIssue("deliveryQuote", t("checkout.deliveryQuoteFailed"), {
          setFieldError: setAddressError,
          focus: () => scrollToField(addressSectionRef)
        })
      } else if (
        deliveryQuote?.minimumOrder != null &&
        total < deliveryQuote.minimumOrder
      ) {
        addIssue("minimumOrder", t("checkout.minimumOrder", {
          amount: formatCurrency(deliveryQuote.minimumOrder)
        }), {
          focus: () => scrollToField(addressSectionRef)
        })
      }
    }

    if (timingMode === "scheduled" && !scheduledFor) {
      addIssue("schedule", t("checkout.scheduleRequired"), {
        setFieldError: setScheduleError,
        focus: () => scrollToField(scheduleFieldRef)
      })
    }

    if (branchClosed && timingMode === "asap") {
      addIssue("branchClosed", t("checkout.branchClosedAsap"), {
        focus: () => scrollToField(scheduleFieldRef)
      })
    }

    if (timingMode === "scheduled" && !slotsLoading && timeSlots.length === 0) {
      addIssue("noScheduleSlots", t("checkout.noScheduleSlots"), {
        setFieldError: setScheduleError,
        focus: () => scrollToField(scheduleFieldRef)
      })
    }

    if (needsFreeDrinkSelection && !freeDrinkChosen) {
      const message = t("checkout.freeDrinkRequired")
      addIssue("freeDrink", message, {
        setFieldError: setFreeDrinkError,
        focus: () => freeDrinkSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      })
    }

    if (marketingEmail && !customerEmail.trim()) {
      addIssue("email", t("checkout.emailRequiredForOffers"), {
        setFieldError: setEmailError,
        focus: () => scrollToField(marketingSectionRef)
      })
    }

    const hasMarketing = marketingEmail || marketingSMS || marketingWhatsApp
    if (hasMarketing && birthday) {
      const parsed = new Date(birthday)
      if (Number.isNaN(parsed.getTime())) {
        addIssue("birthday", t("checkout.birthdayInvalid"), {
          setFieldError: setBirthdayError,
          focus: () => scrollToField(marketingSectionRef)
        })
      }
    }

    if (!paymentMethods[paymentChoice]) {
      addIssue("payment", t("checkout.paymentMethodUnavailable"))
    }

    return issues
  }

  const beginOnlinePayment = async (orderId: string) => {
    if (needsStripePayment) {
      try {
        const session = await createStripePaymentIntent(orderId)
        if (!session.publishableKey) {
          setAwaitingPaymentOrderId(orderId)
          setError(t("checkout.paymentUnavailable"))
          return
        }
        setAwaitingPaymentOrderId(orderId)
        setPendingStripeSession({
          orderId,
          clientSecret: session.clientSecret,
          stripeAccountId: session.stripeAccountId,
          publishableKey: session.publishableKey,
          customerSessionClientSecret: session.customerSessionClientSecret,
          savePaymentMethodOffered: session.savePaymentMethodOffered
        })
      } catch (err: unknown) {
        setAwaitingPaymentOrderId(orderId)
        setError(getApiErrorMessage(err) ?? t("checkout.paymentFailed"))
      }
      return
    }

    if (needsPayPalPayment) {
      if (!paymentConfig?.paypalClientId) {
        setAwaitingPaymentOrderId(orderId)
        setError(t("checkout.paymentUnavailable"))
        return
      }
      setAwaitingPaymentOrderId(orderId)
      setPendingCardOrderId(orderId)
    }
  }

  const handleSubmit = async () => {
    if (pendingStripeSession || pendingCardOrderId) return

    if (awaitingPaymentOrderId) {
      await beginOnlinePayment(awaitingPaymentOrderId)
      return
    }
    if (branchesLoading) {
      openValidationModal([
        { id: "loading", message: t("common.processing") }
      ])
      return
    }

    const issues = validateCheckout()
    if (issues.length > 0) {
      openValidationModal(issues)
      return
    }

    if (checkoutMode === "account" && !isLoggedIn) {
      openValidationModal([
        {
          id: "account",
          message: t("checkout.accountLoginRequired")
        }
      ])
      return
    }

    try {
      const useAccount = checkoutMode === "account" && isLoggedIn
      let pushToken = getStoredPushToken()
      const wantsMarketingPush =
        marketingPush || marketingEmail || marketingSMS || marketingWhatsApp
      if (
        isPushConfigured() &&
        wantsMarketingPush &&
        !pushToken &&
        (hasMarketingConsent() || marketingPush)
      ) {
        pushToken = await subscribeToPush({
          allowOffers: wantsMarketingPush,
          allowOrders: true,
          branchId,
          syncBackend: true
        })
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
        deliveryLat: fulfillmentType === "delivery" ? addressFields.lat : undefined,
        deliveryLng: fulfillmentType === "delivery" ? addressFields.lng : undefined,
        postalCode: fulfillmentType === "delivery" ? postalCode ?? undefined : undefined,
        scheduledFor: timingMode === "scheduled" ? scheduledFor : null,
        paymentMethod: paymentChoice,
        promoCode: allowCheckoutVouchers ? appliedVoucher?.code : undefined,
        notes: orderNotes.trim() || undefined,
        pushToken: pushToken ?? undefined,
        termsAccepted: true
      })

      const orderId = getOrderIdFromPayload(res)
      if (!orderId) {
        setError(t("checkout.orderFailed"))
        return
      }

      if (needsOnlinePayment) {
        await beginOnlinePayment(orderId)
        return
      }

      goToOrderConfirmation(orderId)
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
    const orderId =
      pendingCardOrderId ?? pendingStripeSession?.orderId ?? awaitingPaymentOrderId ?? null
    setPendingCardOrderId(null)
    setPendingStripeSession(null)
    setAwaitingPaymentOrderId(null)
    if (orderId) goToOrderConfirmation(orderId)
  }

  const paymentLocked = !!awaitingPaymentOrderId

  const cashPaymentLabel =
    fulfillmentType === "pickup" ? t("checkout.paymentPickup") : t("checkout.paymentDelivery")

  return (
    <div className="customer-page customer-page--checkout">
      <h2 className="customer-title">{t("checkout.title")}</h2>

      {error && <div className="customer-alert customer-alert--error">{error}</div>}

      {awaitingPaymentOrderId && !pendingStripeSession && !pendingCardOrderId && (
        <div className="customer-alert customer-alert--warn" role="status">
          {t("checkout.paymentPendingRetry")}
        </div>
      )}

      {branchClosed && (
        <div className="customer-alert customer-alert--warn" role="status">
          {t("checkout.branchClosedBanner")}
        </div>
      )}

      <div className="customer-card checkout-account">
        {isLoggedIn && authUser ? (
          <div className="checkout-account__logged-in">
            <h3 className="customer-subtitle">{t("checkout.orderWithAccount")}</h3>
            <p className="customer-hint">
              {t("checkout.welcomeBack", { name: authUser.name })}
            </p>
            {showLoyaltyCheckout ? (
              <p className="customer-alert customer-alert--success">
                {t("checkout.loyaltyBalance", {
                  points: authUser.loyaltyPoints ?? 0,
                  tier: authUser.loyaltyTier ?? "bronze"
                })}
              </p>
            ) : null}
          </div>
        ) : (
          <>
        <h3 className="customer-subtitle">{t("checkout.howToOrder")}</h3>
        <div className="customer-toggle-group">
          <button
            type="button"
            onClick={() => setCheckoutMode("guest")}
            className={`customer-toggle${checkoutMode === "guest" ? " customer-toggle--active" : ""}`}
          >
            {t("checkout.orderAsGuest")}
          </button>
          <button
            type="button"
            onClick={() => setCheckoutMode("account")}
            className={`customer-toggle${checkoutMode === "account" ? " customer-toggle--active" : ""}`}
          >
            {t("checkout.orderWithAccount")}
          </button>
        </div>

        {checkoutMode === "account" && !isLoggedIn && (
          <div className="checkout-account__prompt">
            <p className="customer-hint">{t("checkout.accountBenefits")}</p>
            {showLoyaltyCheckout ? (
              <ul className="checkout-marketing__perks">
                <li>{t("checkout.loyaltyPerkPoints")}</li>
                <li>{t("checkout.loyaltyPerkTier")}</li>
                <li>{t("checkout.marketingPerkBirthday")}</li>
              </ul>
            ) : null}
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

        {showFreeDrinkCheckout && qualifiesForFreeDrink && (
          <p className="customer-alert customer-alert--success" style={{ marginTop: 12 }}>
            {branchPromo?.freeDrinkMessage ??
              t("checkout.freeDrinkQualify", { amount: freeDrinkMin })}
          </p>
        )}
        {showFreeDrinkCheckout && needsFreeDrinkSelection && (
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
        {showFreeDrinkCheckout && freeDrinkMin > 0 && !qualifiesForFreeDrink && (
          <p className="customer-hint">
            {t("checkout.freeDrinkMore", { amount: (freeDrinkMin - total).toFixed(2) })}
          </p>
        )}
        <p className="customer-hint checkout-summary__subtotal">
          {t("common.subtotal")}: {formatCurrency(subtotal)}
        </p>
        {websiteDiscount > 0 && (
          <WebsiteDiscountBanner percent={discountPct} amount={websiteDiscount} compact />
        )}
        {websiteDiscount > 0 && (
          <p className="customer-hint checkout-summary__food-note">
            {t("checkout.websiteDiscountFoodOnly")}
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
        {fulfillmentType === "delivery" && deliveryQuote?.allowed && deliveryQuote.freeDelivery && (
          <p className="customer-alert customer-alert--success" style={{ marginTop: 8 }}>
            {t("checkout.freeDeliveryQualify")}
          </p>
        )}
        {fulfillmentType === "delivery" && freeDeliveryGap != null && freeDeliveryGap > 0 && (
          <div className="customer-alert customer-alert--info" style={{ marginTop: 8 }}>
            <p style={{ margin: 0 }}>
              {t("checkout.freeDeliveryNudge", { amount: formatCurrency(freeDeliveryGap) })}
            </p>
            <Link
              to={`/branch/${branchId}`}
              className="customer-btn"
              style={{ marginTop: 8, display: "inline-block" }}
            >
              {t("checkout.freeDeliveryAddItems")}
            </Link>
          </div>
        )}
        {fulfillmentType === "delivery" && deliveryQuote?.allowed && (
          <p className="customer-hint">
            {appliedVoucher?.freeDelivery || deliveryQuote.freeDelivery
              ? t("checkout.deliveryFree")
              : t("checkout.deliveryFee", {
                  amount: formatCurrency(deliveryFee)
                })}
          </p>
        )}
        <p className="customer-total-line checkout-summary__total">
          {websiteDiscount > 0 ? (
            <>
              <span className="checkout-summary__original">
                {formatCurrency(grandTotal + websiteDiscount)}
              </span>
              {t("common.total")}: {formatCurrency(grandTotal)}
            </>
          ) : (
            <>{t("common.total")}: {formatCurrency(grandTotal)}</>
          )}
        </p>
        <p className="customer-hint">{paymentSummaryLabel(t, paymentChoice, cashPaymentLabel)}</p>
      </div>

      <div className="customer-field">
        {allowCheckoutVouchers ? (
          <>
        <label className="customer-label" htmlFor="checkout-voucher">
          {t("checkout.voucherLabel")}
        </label>
        {isLoggedIn && walletData?.activatedCouponId && (
          <p className="customer-hint" style={{ marginBottom: 8 }}>
            {t("checkout.walletCouponHint")}
          </p>
        )}
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
          </>
        ) : (
          <p className="customer-hint">{t("checkout.voucherNotCombinable")}</p>
        )}
      </div>

      <div className="customer-field">
        <label className="customer-label">{t("checkout.orderType")}</label>
        <div className="checkout-choice-grid checkout-choice-grid--2">
          <CheckoutChoiceCard
            active={fulfillmentType === "delivery"}
            title={t("checkout.delivery")}
            hint={t("checkout.deliveryHint")}
            icon={
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 7h11v8H3z" />
                <path d="M14 10h4l3 3v2h-7V10z" />
                <circle cx="7" cy="17" r="2" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            }
            onClick={() => setFulfillmentType("delivery")}
          />
          <CheckoutChoiceCard
            active={fulfillmentType === "pickup"}
            title={t("checkout.pickup")}
            hint={t("checkout.pickupHint")}
            icon={
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 8h12l-1 11H7L6 8z" />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
            }
            onClick={() => setFulfillmentType("pickup")}
          />
        </div>
      </div>

      <div className="customer-field" ref={scheduleFieldRef}>
        <label className="customer-label">{t("checkout.when")}</label>
        <div className="checkout-choice-grid checkout-choice-grid--2">
          <CheckoutChoiceCard
            active={timingMode === "asap"}
            disabled={branchClosed}
            title={t("checkout.asap")}
            hint={branchClosed ? t("checkout.asapUnavailableClosed") : t("checkout.asapHint")}
            icon={
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            }
            onClick={() => !branchClosed && setTimingMode("asap")}
          />
          <CheckoutChoiceCard
            active={timingMode === "scheduled"}
            title={t("checkout.scheduled")}
            hint={t("checkout.scheduledHint")}
            icon={
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="5" width="16" height="15" rx="2" />
                <path d="M8 3v4M16 3v4M4 10h16" />
              </svg>
            }
            onClick={() => setTimingMode("scheduled")}
          />
        </div>

        {timingMode === "scheduled" && (
          <div className="checkout-schedule-picker">
            <label className="customer-label" htmlFor="checkout-schedule-time">
              {t("checkout.chooseTimeDetailed")}
            </label>
            <select
              id="checkout-schedule-time"
              className={`customer-select${scheduleError ? " customer-select--invalid" : ""}`}
              value={scheduledFor}
              onChange={(e) => {
                setScheduledFor(e.target.value)
                setScheduleError("")
              }}
            >
              <option value="">{t("checkout.chooseTime")}</option>
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
            {scheduleError && <p className="customer-error">{scheduleError}</p>}
            {branchClosed && !slotsLoading && timeSlots.length === 0 && (
              <p className="customer-error">{t("checkout.noScheduleSlots")}</p>
            )}
          </div>
        )}
      </div>

      <div className="customer-field">
        <label className="customer-label">{t("checkout.paymentMethod")}</label>
        <PaymentMethodPicker
          methods={paymentMethods}
          selected={paymentChoice}
          paymentLocked={paymentLocked}
          onSelect={(method: PaymentMethodId) => {
            setPaymentChoice(method)
            setPendingCardOrderId(null)
            setPendingStripeSession(null)
          }}
        />
        {isLoggedIn && needsStripePayment && (
          <p className="customer-hint checkout-save-payment-hint">
            {t("checkout.savePaymentMethodHint")}
          </p>
        )}
      </div>

      <div className="customer-field" ref={nameFieldRef}>
        <label className="customer-label">{t("checkout.name")}</label>
        <input
          className={`customer-input${nameError ? " customer-input--invalid" : ""}`}
          placeholder={t("checkout.namePlaceholder")}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setNameError("")
          }}
        />
        {nameError && <p className="customer-error">{nameError}</p>}
      </div>

      <div className="customer-field" ref={phoneFieldRef}>
        <label className="customer-label">{t("checkout.phone")}</label>
        <input
          className={`customer-input${phoneError ? " customer-input--invalid" : ""}`}
          placeholder={t("checkout.phonePlaceholder")}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            setPhoneError("")
          }}
        />
        {phoneError && <p className="customer-error">{phoneError}</p>}
      </div>

      <div className="customer-field">
        <label className="customer-label" htmlFor="checkout-email">
          {t("checkout.email")} ({t("common.optional")})
        </label>
        <input
          id="checkout-email"
          className={`customer-input${emailError ? " customer-input--invalid" : ""}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t("checkout.emailPlaceholder")}
          value={customerEmail}
          onChange={(e) => {
            setCustomerEmail(e.target.value)
            setEmailError("")
          }}
        />
        <p className="customer-hint">{t("checkout.emailHint")}</p>
        {emailError && <p className="customer-error">{emailError}</p>}
      </div>

      {fulfillmentType === "delivery" && (
        <div className="customer-field" ref={addressSectionRef}>
          <h3 className="customer-subtitle">{t("checkout.address")}</h3>
          {isLoggedIn && savedAddresses.length > 0 && (
            <div className="checkout-saved-addresses">
              <p className="customer-label">{t("checkout.savedAddresses")}</p>
              <div className="checkout-saved-addresses__list">
                {savedAddresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    className="checkout-saved-addresses__chip"
                    onClick={() => applySavedAddress(address)}
                  >
                    {address.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <DeliveryAddressForm
            branchId={branchId!}
            branchName={branchInfo?.name}
            branchCity={branchInfo?.city}
            branchLat={branchInfo?.lat}
            branchLng={branchInfo?.lng}
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

      <div className="customer-card checkout-marketing" ref={marketingSectionRef}>
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
          {isPushConfigured() && hasMarketingConsent() ? (
            <label className="checkout-marketing__channel">
              <input
                type="checkbox"
                checked={marketingPush}
                onChange={(e) => setMarketingPush(e.target.checked)}
              />
              <span>{t("checkout.marketingPush")}</span>
            </label>
          ) : null}
        </div>
        {marketingEmail && !customerEmail.trim() && (
          <p className="customer-hint" style={{ marginTop: 12 }}>
            {t("checkout.marketingEmailNeedsAddress")}
          </p>
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

      {!pendingCardOrderId && !pendingStripeSession && (
        <>
        <PriceVatNote className="customer-hint checkout-price-vat" />
        <p className="customer-hint checkout-terms-notice checkout-terms-notice--implicit">
          <Trans
            i18nKey="checkout.implicitTermsNotice"
            components={{
              agbLink: <Link to="/agb" className="checkout-terms-link" />,
              widerrufLink: <Link to="/widerruf" className="checkout-terms-link" />
            }}
          />
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={createMutation.isPending || branchesLoading}
          className="customer-btn customer-btn--primary"
        >
          {createMutation.isPending || branchesLoading
            ? t("common.processing")
            : awaitingPaymentOrderId && !pendingStripeSession && !pendingCardOrderId
              ? t("checkout.retryPaymentPayable", { amount: formatCurrency(grandTotal) })
              : needsOnlinePayment
                ? t("checkout.continueToPaymentPayable", { amount: formatCurrency(grandTotal) })
                : t("checkout.placeOrderPayable", { amount: formatCurrency(grandTotal) })}
        </button>
        <CheckoutLegalFooter />
        </>
      )}

      {pendingStripeSession && needsStripePayment && (
        <>
        <StripeCheckout
          orderId={pendingStripeSession.orderId}
          publishableKey={pendingStripeSession.publishableKey}
          stripeAccountId={pendingStripeSession.stripeAccountId}
          clientSecret={pendingStripeSession.clientSecret}
          customerSessionClientSecret={pendingStripeSession.customerSessionClientSecret}
          savePaymentMethodOffered={pendingStripeSession.savePaymentMethodOffered}
          payableAmount={formatCurrency(grandTotal)}
          onSuccess={handleCardPaymentSuccess}
          onError={(message) => setError(message)}
        />
        <CheckoutLegalFooter />
        </>
      )}

      {pendingCardOrderId && paymentConfig?.paypalClientId && needsPayPalPayment && (
        <div className="customer-card" style={{ marginTop: 16 }}>
          <h3 className="customer-subtitle">{t("checkout.onlinePaymentTitle")}</h3>
          <PayPalCheckout
            orderId={pendingCardOrderId}
            paypalClientId={paymentConfig.paypalClientId}
            paypalMode={paymentConfig.paypalMode}
            currency={paymentConfig.currency}
            fundingSource="paypal"
            payableAmount={formatCurrency(grandTotal)}
            onSuccess={handleCardPaymentSuccess}
            onError={(message) => setError(message)}
          />
          <CheckoutLegalFooter />
        </div>
      )}

      {pendingCardOrderId && needsPayPalPayment && !paymentConfig?.paypalClientId && (
        <div className="customer-alert customer-alert--error" role="alert">
          {t("checkout.paymentUnavailable")}
        </div>
      )}

      {validationModalOpen && validationIssues.length > 0 && (
        <div
          className="customer-modal-backdrop"
          role="presentation"
          onClick={() => closeValidationModal(false)}
        >
          <div
            className="customer-modal checkout-validation-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="checkout-validation-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="checkout-validation-title" className="customer-subtitle">
              {t("checkout.validationTitle")}
            </h3>
            <p className="customer-hint">{t("checkout.validationLead")}</p>
            <ul className="checkout-validation-modal__list">
              {validationIssues.map((issue) => (
                <li key={issue.id}>{issue.message}</li>
              ))}
            </ul>
            <div className="checkout-validation-modal__actions">
              <button
                type="button"
                className="customer-btn customer-btn--primary"
                onClick={() => closeValidationModal(true, validationIssues)}
              >
                {t("checkout.validationFix")}
              </button>
              <button
                type="button"
                className="customer-btn"
                onClick={() => closeValidationModal(false)}
              >
                {t("common.close")}
              </button>
            </div>
          </div>
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
    apple_pay: "checkout.paymentApplePay",
    google_pay: "checkout.paymentGooglePay",
    paypal: "checkout.paymentPaypal",
    klarna: "checkout.paymentKlarna",
    sepa: "checkout.paymentSepa"
  }
  return t(keys[choice])
}

