self.addEventListener("push", (event) => {
  try {
    if (!event.data) return
    const data = event.data.json()
    event.waitUntil(
      self.registration.showNotification(data.title || "Notification", {
        body: data.body || "",
        icon: "/images/concordia-logo.png",
        data: data.url || "/"
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
