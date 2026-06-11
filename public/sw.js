self.addEventListener("push", (event) => {
  try {
    if (!event.data) return
    const payload = event.data.json()
    const targetUrl = payload.url ?? payload.data?.url ?? "/"
    event.waitUntil(
      self.registration.showNotification(payload.title || "Notification", {
        body: payload.body || "",
        icon: "/images/concordia-logo.png",
        data: targetUrl
      })
    )
  } catch (err) {
    console.error("Push error:", err)
  }
})

self.addEventListener("notificationclick", (event) => {
  try {
    event.notification.close()
    const url = event.notification.data || "/"
    event.waitUntil(clients.openWindow(url))
  } catch (err) {
    console.error("Notification click error:", err)
  }
})
