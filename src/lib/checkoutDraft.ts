import type { DeliveryAddressFields } from "@/lib/deliveryAddress"

const STORAGE_KEY = "concordia_checkout_draft"

export type CheckoutDraftFulfillment = "pickup" | "delivery"
export type CheckoutDraftTiming = "asap" | "scheduled"
export type CheckoutDraftPayment =
  | "cash"
  | "card"
  | "apple_pay"
  | "google_pay"
  | "paypal"
  | "klarna"
  | "sepa"
export type CheckoutDraftMode = "guest" | "account"

export type CheckoutDraftVoucher = {
  code: string
  discountAmount: number
  kind?: "promo" | "gift"
  balanceRemaining?: number
}

export type CheckoutDraft = {
  branchId: string
  name: string
  phone: string
  address: string
  addressFields?: DeliveryAddressFields
  fulfillmentType: CheckoutDraftFulfillment
  timingMode: CheckoutDraftTiming
  scheduledFor: string
  orderNotes: string
  paymentChoice: CheckoutDraftPayment
  voucherInput: string
  appliedVoucher: CheckoutDraftVoucher | null
  freeDrinkChoice: number | ""
  customerEmail: string
  marketingEmail: boolean
  marketingSMS: boolean
  marketingWhatsApp: boolean
  marketingPush?: boolean
  birthday: string
  checkoutMode: CheckoutDraftMode
}

export function loadCheckoutDraft(branchId: string): CheckoutDraft | null {
  if (typeof window === "undefined" || !branchId) return null

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CheckoutDraft
    if (parsed.branchId !== branchId) return null
    return parsed
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function saveCheckoutDraft(draft: CheckoutDraft): void {
  if (typeof window === "undefined" || !draft.branchId) return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Ignore quota / private-mode errors.
  }
}

export function clearCheckoutDraft(): void {
  if (typeof window === "undefined") return
  window.sessionStorage.removeItem(STORAGE_KEY)
}
