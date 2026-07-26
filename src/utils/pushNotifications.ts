import { registerPushSubscription } from "@/api/notifications"

function getVapidPublicKey(): string | null {
  const key = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim()
  return key || null
}

export function isPushConfigured(): boolean {
  return !!getVapidPublicKey()
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function getStoredPushToken(): string | null {
  try {
    return localStorage.getItem("pushToken")
  } catch {
    return null
  }
}

export function getPushPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported"
  return Notification.permission
}

export type PushSubscribeOptions = {
  allowOffers?: boolean
  allowOrders?: boolean
  branchId?: string | null
  syncBackend?: boolean
}

/** Registers for browser push when VAPID is configured. Optionally syncs to backend. */
export async function subscribeToPush(options: PushSubscribeOptions = {}): Promise<string | null> {
  if (!isPushConfigured()) return null
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null

  const vapidKey = getVapidPublicKey()!
  const syncBackend = options.syncBackend !== false

  try {
    const reg = await navigator.serviceWorker.register("/sw.js")

    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource
      })
    }

    const token = JSON.stringify(sub.toJSON())
    localStorage.setItem("pushToken", token)

    if (syncBackend) {
      await registerPushSubscription(token, {
        allowOffers: options.allowOffers,
        allowOrders: options.allowOrders,
        branchId: options.branchId
      })
    }

    return token
  } catch {
    return null
  }
}

export async function enableOfferNotifications(branchId?: string | null) {
  const token = await subscribeToPush({
    allowOffers: true,
    allowOrders: true,
    branchId,
    syncBackend: true
  })
  return !!token
}

/** Enable transactional order status notifications and attach the token to this order. */
export async function enableOrderNotifications(
  orderId: string,
  branchId?: string | null
): Promise<boolean> {
  if (!orderId) return false

  const permission =
    typeof Notification !== "undefined" ? await Notification.requestPermission() : "denied"
  if (permission !== "granted") return false

  const token = await subscribeToPush({
    allowOrders: true,
    branchId,
    syncBackend: true
  })
  if (!token) return false

  try {
    const { attachOrderPushSubscription } = await import("@/api/customer")
    await attachOrderPushSubscription(orderId, token)
  } catch {
    return false
  }

  return true
}

export function isOrderPushDismissed(orderId: string): boolean {
  try {
    return localStorage.getItem(`concordia-order-push-dismissed:${orderId}`) === "1"
  } catch {
    return false
  }
}

export function dismissOrderPushPrompt(orderId: string) {
  try {
    localStorage.setItem(`concordia-order-push-dismissed:${orderId}`, "1")
  } catch {
    // ignore
  }
}

export async function unsubscribePush() {
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return

  const sub = await reg.pushManager.getSubscription()
  if (sub) await sub.unsubscribe()
  localStorage.removeItem("pushToken")
}

export function isOfferPushDismissed(): boolean {
  try {
    return localStorage.getItem("concordia-offer-push-dismissed") === "1"
  } catch {
    return false
  }
}

export function dismissOfferPushPrompt() {
  try {
    localStorage.setItem("concordia-offer-push-dismissed", "1")
  } catch {
    // ignore
  }
}
