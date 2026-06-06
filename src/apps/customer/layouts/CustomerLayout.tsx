import React, { useEffect, useState } from "react"
import { Link, Outlet } from "react-router-dom"
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
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 48px" }}>
      <header
        style={{
          padding: "8px 0 28px",
          borderBottom: "1px solid #e8e2da",
          marginBottom: 8
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: "#1a1816",
            textDecoration: "none"
          }}
        >
          Concordia
        </Link>
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
