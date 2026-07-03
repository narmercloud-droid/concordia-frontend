import api from "./client.js"

function unwrap<T>(res: { data?: { data?: T; success?: boolean } & T }): T {
  if (res.data && "data" in res.data && res.data.data !== undefined) {
    return res.data.data as T
  }
  return res.data as T
}

export const purchaseGiftCard = async (
  branchId: string,
  data: {
    amount: number
    purchaserName: string
    purchaserEmail?: string
    purchaserPhone?: string
    recipientName?: string
    message?: string
    paymentMethod: string
    termsAccepted?: boolean
  }
) => {
  const res = await api.post(`/api/branches/${branchId}/gift-cards`, {
    ...data,
    termsAccepted: data.termsAccepted ?? false
  })
  return unwrap<{
    purchaseId: string
    code: string | null
    amount: number
    branchId: string
    paymentRequired: boolean
    payAtBranch?: boolean
    paymentMethod: string
  }>(res)
}

export const getGiftCardPurchase = async (purchaseId: string) => {
  const res = await api.get(`/api/gift-cards/${purchaseId}`)
  return unwrap<{
    purchaseId: string
    branchId: string
    code: string | null
    amount: number
    balance: number
    paymentStatus: string
    paymentMethod: string
  }>(res)
}
