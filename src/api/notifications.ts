import api from "./client.js"

export type PushRegistrationOptions = {
  allowOffers?: boolean
  allowOrders?: boolean
  branchId?: string | null
}

export const registerPushSubscription = (
  token: string,
  options: PushRegistrationOptions = {}
) =>
  api.post("/api/notifications/push-subscribe", {
    token,
    allowOffers: options.allowOffers !== false,
    allowOrders: options.allowOrders !== false,
    branchId: options.branchId ?? undefined
  })

export const unregisterPushSubscription = (token: string) =>
  api.delete("/api/notifications/push-subscribe", { data: { token } })

export const updateNotificationPreferences = (prefs: {
  allowPush?: boolean
  allowOffers?: boolean
  allowSMS?: boolean
}) => api.put("/api/notifications/preferences", prefs)

/** @deprecated use registerPushSubscription */
export const savePushToken = (token: string, options?: PushRegistrationOptions) =>
  registerPushSubscription(token, options)

export type MarketingSmsPayload = {
  message: string
  branchId?: string
  segment?: "all" | "recent"
}

export const sendMarketingSMS = (payload: MarketingSmsPayload) =>
  api.post("/api/notifications/marketing/sms", payload)

/** @deprecated use sendMarketingSMS */
export const sendBulkSMS = sendMarketingSMS
