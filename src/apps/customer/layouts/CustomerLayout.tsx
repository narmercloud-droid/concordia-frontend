import React, { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { subscribeToPush } from "@/utils/pushNotifications"

export default function CustomerLayout() {
  const [pushDenied, setPushDenied] = useState(false)

  useEffect(() => {
    if (!("Notification" in window)) {
      console.warn("Browser does not support notifications.")
      return
    }

    if (Notification.permission === "denied") {
      console.warn("Push notifications denied by user.")
      setPushDenied(true)
      return
    }

    subscribeToPush().catch((err) => {
      console.error("Failed to subscribe to push notifications:", err)
    })
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <header style={{ padding: "10px 0", fontSize: 24, fontWeight: 600 }}>
        Concordia
      </header>

      {pushDenied && (
        <div
          style={{
            backgroundColor: "#fff4e5",
            color: "#663c00",
            border: "1px solid #ffd7a8",
            padding: 12,
            borderRadius: 6,
            marginBottom: 20
          }}
        >
          Notifications are disabled. Enable them in browser settings to receive order updates.
        </div>
      )}

      <main style={{ marginTop: 20 }}>
        <Outlet />
      </main>
    </div>
  )
}
