import api from "./client.js"

function unwrap<T>(res: { data?: { data?: T; success?: boolean } & T }): T {
  if (res.data && "data" in res.data && res.data.data !== undefined) {
    return res.data.data as T
  }
  return res.data as T
}

export type OrderReview = {
  id: string
  foodRating: number
  deliveryRating: number | null
  rating: number | null
  comment: string | null
  createdAt: string
}

export type OrderReviewState = {
  orderId: string
  branchId: string
  fulfillmentType: string
  status: string
  canReview: boolean
  hasReview: boolean
  review: OrderReview | null
}

export type SubmitOrderReviewInput = {
  orderId: string
  foodRating: number
  deliveryRating?: number | null
  comment?: string
}

export const getOrderReviewState = async (orderId: string) => {
  const res = await api.get(`/api/reviews/order/${orderId}`)
  return unwrap<OrderReviewState>(res)
}

export const submitOrderReview = async (input: SubmitOrderReviewInput, isGuest: boolean) => {
  const path = isGuest ? "/api/reviews/guest" : "/api/reviews"
  const res = await api.post(path, input)
  return unwrap<OrderReview>(res)
}
