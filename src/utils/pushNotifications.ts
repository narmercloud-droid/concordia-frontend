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

/** Registers for browser push when VAPID is configured. Stores subscription locally for checkout. */
export async function subscribeToPush(): Promise<string | null> {
  if (!isPushConfigured()) return null
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null

  const vapidKey = getVapidPublicKey()!

  try {
    const reg = await navigator.serviceWorker.register("/sw.js")

    const existing = await reg.pushManager.getSubscription()
    if (existing) {
      const token = JSON.stringify(existing.toJSON())
      localStorage.setItem("pushToken", token)
      return token
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource
    })

    const token = JSON.stringify(sub.toJSON())
    localStorage.setItem("pushToken", token)
    return token
  } catch {
    return null
  }
}

export async function unsubscribePush() {
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return

  const sub = await reg.pushManager.getSubscription()
  if (sub) await sub.unsubscribe()
  localStorage.removeItem("pushToken")
}
