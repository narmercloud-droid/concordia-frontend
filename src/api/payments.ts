import api from "./client.js"

function unwrap<T>(res: { data?: { data?: T; success?: boolean } & T }): T {
  if (res.data && "data" in res.data && res.data.data !== undefined) {
    return res.data.data as T
  }
  return res.data as T
}

export type PaymentConfig = {
  cardPaymentsEnabled: boolean
  paypalClientId: string | null
  currency: string
}

export const getPaymentConfig = async () => {
  const res = await api.get("/api/payments/config")
  return unwrap<PaymentConfig>(res)
}

export const createPayPalOrder = async (orderId: string) => {
  const res = await api.post("/api/payments/paypal/create-order", { orderId })
  return unwrap<{ paypalOrderId: string; orderId: string }>(res)
}

export const capturePayPalOrder = async (orderId: string) => {
  const res = await api.post("/api/payments/paypal/capture", { orderId })
  return unwrap<{ success: boolean; captureId?: string; alreadyPaid?: boolean }>(res)
}
