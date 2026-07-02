import api from "./client.js"

function unwrap<T>(res: { data?: { data?: T; success?: boolean } & T }): T {
  if (res.data && "data" in res.data && res.data.data !== undefined) {
    return res.data.data as T
  }
  return res.data as T
}

export type PaymentMethods = {
  cash: boolean
  card: boolean
  apple_pay: boolean
  google_pay: boolean
  paypal: boolean
  klarna: boolean
  sepa: boolean
}

export type PaymentConfig = {
  cardPaymentsEnabled: boolean
  onlinePaymentsEnabled: boolean
  paypalClientId: string | null
  stripePublishableKey: string | null
  stripeAccountId: string | null
  stripeReady: boolean
  currency: string
  methods: PaymentMethods
}

export type StripePaymentSession = {
  clientSecret: string
  paymentIntentId: string
  stripeAccountId: string
  publishableKey: string | null
  customerSessionClientSecret?: string | null
  savePaymentMethodOffered?: boolean
}

export type BranchPaymentStatus = {
  branchId: string
  stripeAccountId: string | null
  stripeChargesEnabled: boolean
  stripeDetailsSubmitted: boolean
  stripePayoutsEnabled: boolean
  cardEnabled: boolean
  applePayEnabled: boolean
  googlePayEnabled: boolean
  paypalEnabled: boolean
  paypalClientId: string | null
  paypalWebhookId: string | null
  paypalConfigured: boolean
  paypalSecretSet: boolean
  stripeReady: boolean
  stripeConfigured: boolean
}

export const getPaymentConfig = async (branchId?: string) => {
  const res = await api.get("/api/payments/config", {
    params: branchId ? { branchId } : undefined
  })
  return unwrap<PaymentConfig>(res)
}

export const createStripePaymentIntent = async (orderId: string) => {
  const res = await api.post("/api/payments/stripe/create-intent", { orderId })
  return unwrap<StripePaymentSession>(res)
}

export const confirmStripePayment = async (orderId: string) => {
  const res = await api.post("/api/payments/stripe/confirm", { orderId })
  return unwrap<{ success: boolean; alreadyPaid?: boolean; paymentIntentId?: string }>(res)
}

export const createGiftCardStripePaymentIntent = async (purchaseId: string) => {
  const res = await api.post("/api/payments/gift-card/stripe/create-intent", { purchaseId })
  return unwrap<StripePaymentSession & { purchaseId: string }>(res)
}

export const confirmGiftCardStripePayment = async (purchaseId: string) => {
  const res = await api.post("/api/payments/gift-card/stripe/confirm", { purchaseId })
  return unwrap<{ success: boolean; code?: string; alreadyPaid?: boolean }>(res)
}

export const getBranchPaymentStatus = async (branchId: string) => {
  const res = await api.get(`/api/payments/branches/${branchId}/status`)
  return unwrap<BranchPaymentStatus>(res)
}

export const startBranchStripeOnboarding = async (
  branchId: string,
  returnUrl: string,
  refreshUrl?: string
) => {
  const res = await api.post(`/api/payments/branches/${branchId}/onboarding`, {
    returnUrl,
    refreshUrl: refreshUrl ?? returnUrl
  })
  return unwrap<{ url: string; stripeAccountId: string }>(res)
}

export const updateBranchPaymentSettings = async (
  branchId: string,
  data: Partial<
    Pick<
      BranchPaymentStatus,
      | "cardEnabled"
      | "applePayEnabled"
      | "googlePayEnabled"
      | "paypalEnabled"
      | "paypalClientId"
      | "paypalWebhookId"
    >
  > & { paypalClientSecret?: string }
) => {
  const res = await api.put(`/api/payments/branches/${branchId}/settings`, data)
  return unwrap<BranchPaymentStatus>(res)
}

export const createPayPalOrder = async (orderId: string) => {
  const res = await api.post("/api/payments/paypal/create-order", { orderId })
  return unwrap<{ paypalOrderId: string; orderId: string }>(res)
}

export const capturePayPalOrder = async (orderId: string) => {
  const res = await api.post("/api/payments/paypal/capture", { orderId })
  return unwrap<{ success: boolean; captureId?: string; alreadyPaid?: boolean }>(res)
}

export const createGiftCardPayPalOrder = async (purchaseId: string) => {
  const res = await api.post("/api/payments/gift-card/paypal/create-order", { purchaseId })
  return unwrap<{ paypalOrderId: string; purchaseId: string }>(res)
}

export const captureGiftCardPayPalOrder = async (purchaseId: string) => {
  const res = await api.post("/api/payments/gift-card/paypal/capture", { purchaseId })
  return unwrap<{ success: boolean; code?: string; captureId?: string; alreadyPaid?: boolean }>(
    res
  )
}
