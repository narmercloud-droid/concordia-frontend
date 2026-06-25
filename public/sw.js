self.addEventListener("push", (event) => {
  try {
    if (!event.data) return
    const payload = event.data.json()
    const targetUrl = payload.url ?? payload.data?.url ?? "/offers"
    const title = payload.title || "Concordia"
    const body = payload.body || ""
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: "/brand/apple-touch-icon.png",
        badge: "/brand/apple-touch-icon-152.png",
        tag: payload.data?.kind === "offer" ? "concordia-offer" : "concordia-order",
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
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
        for (const client of list) {
          if ("focus" in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        if (clients.openWindow) return clients.openWindow(url)
      })
    )
  } catch (err) {
    console.error("Notification click error:", err)
  }
})
