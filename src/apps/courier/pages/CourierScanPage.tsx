import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import QrScanner from "react-qr-scanner"

export default function CourierScanPage() {
  const navigate = useNavigate()
  const [cameraError, setCameraError] = useState(false)

  const handleScan = (data: any) => {
    if (!data?.text) return

    let token = data.text.trim()
    try {
      const url = new URL(token)
      const fromQuery = url.searchParams.get("token")
      if (fromQuery) token = fromQuery
    } catch {
      // Raw token scanned — use as-is
    }

    navigate(`/courier/order?token=${encodeURIComponent(token)}`)
  }

  const handleError = () => {
    setCameraError(true)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Scan Order QR Code</h2>
      <QrScanner
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: "100%" }}
      />
      {cameraError && (
        <p style={{ color: "red", marginTop: 16 }}>
          Camera unavailable — please scan using your phone's camera app.
        </p>
      )}
    </div>
  )
}
