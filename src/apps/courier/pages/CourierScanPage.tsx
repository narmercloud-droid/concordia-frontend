import React, { useCallback, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import CourierQrScanner from "../components/CourierQrScanner.js"
import { addCourierRouteToken, parseCourierToken } from "@/lib/courierRoute.js"
import { acceptCourierOrder } from "@/api/courierOrder.js"
import "./CourierPages.css"

type ScanFeedback = {
  kind: "success" | "duplicate" | "error"
  message: string
}

export default function CourierScanPage() {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null)
  const [paused, setPaused] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleScan = useCallback(
    async (raw: string) => {
      if (busy) return
      const token = parseCourierToken(raw)
      if (!token) {
        setFeedback({ kind: "error", message: "Invalid QR code — no driver token found." })
        return
      }

      const added = addCourierRouteToken(token)
      if (!added.added && added.reason === "duplicate") {
        setFeedback({ kind: "duplicate", message: "Order already in your route." })
        setPaused(true)
        window.setTimeout(() => setPaused(false), 1500)
        return
      }

      setBusy(true)
      setPaused(true)
      try {
        await acceptCourierOrder(token)
        setFeedback({
          kind: "success",
          message: `Order #${token.slice(0, 8).toUpperCase()} added. Scan the next slip or open your route.`
        })
      } catch {
        setFeedback({
          kind: "success",
          message: `Order added — open it from your route to accept if needed.`
        })
      } finally {
        setBusy(false)
        window.setTimeout(() => setPaused(false), 1200)
      }
    },
    [busy]
  )

  return (
    <div className="courier-page">
      <div className="courier-page__header">
        <h1>Scan orders</h1>
        <p className="courier-page__lead">
          Scan each delivery slip like Lieferando — keep scanning to build your route.
        </p>
      </div>

      <CourierQrScanner onScan={(text) => void handleScan(text)} paused={paused || busy} />

      {feedback ? (
        <p className={`courier-feedback courier-feedback--${feedback.kind}`}>{feedback.message}</p>
      ) : null}

      <div className="courier-page__actions">
        <Link to="/courier" className="courier-btn courier-btn--primary">
          View my route
        </Link>
        <button type="button" className="courier-btn" onClick={() => navigate("/courier")}>
          Done scanning
        </button>
      </div>
    </div>
  )
}
