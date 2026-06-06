import { savePushToken } from "@/api/notifications"

export async function subscribeToPush() {
  if (!("serviceWorker" in navigator)) return null
  if (!("PushManager" in window)) return null

  try {
    const reg = await navigator.serviceWorker.register("/sw.js")

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: (import.meta as any).env.VITE_VAPID_PUBLIC_KEY
    })

    const token = JSON.stringify(sub)
    const storedToken = localStorage.getItem("pushToken")

    if (token !== storedToken) {
      try {
        await savePushToken(token)
        localStorage.setItem("pushToken", token)
      } catch (err) {
        if ((err as any)?.response?.status === 401) {
          localStorage.removeItem("pushToken")
          try {
            await savePushToken(token)
            localStorage.setItem("pushToken", token)
          } catch (retryErr) {
            console.error("Push token retry failed:", retryErr)
          }
        } else {
          console.error("Push token save failed:", err)
        }
      }
    }

    return token
  } catch (err) {
    console.error("Push subscription failed:", err)
    return null
  }
}

export async function unsubscribePush() {
  const reg = await navigator.serviceWorker.getRegistration()
  if (!reg) return

  const sub = await reg.pushManager.getSubscription()
  if (sub) await sub.unsubscribe()
}
