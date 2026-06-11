import React, { Suspense, useState } from "react"
import { useNavigate } from "react-router-dom"

type ScanResult = { text?: string } | null

type QrScannerProps = {
  delay?: number
  onError: () => void
  onScan: (data: ScanResult) => void
  style?: React.CSSProperties
}

const LazyQrScanner = React.lazy(async () => {
  const mod = await import("react-qr-scanner")
  return { default: mod.default as React.ComponentType<QrScannerProps> }
})

function QrScannerPanel({
  onScan,
  onError
}: {
  onScan: (data: ScanResult) => void
  onError: () => void
}) {
  return (
    <LazyQrScanner delay={300} onError={onError} onScan={onScan} style={{ width: "100%" }} />
  )
}

export default function CourierScanPage() {
  const navigate = useNavigate()
  const [cameraError, setCameraError] = useState(false)

  const handleScan = (data: ScanResult) => {
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
      {!cameraError && (
        <Suspense fallback={<p>Loading camera…</p>}>
          <QrScannerPanel onScan={handleScan} onError={handleError} />
        </Suspense>
      )}
      {cameraError && (
        <p style={{ color: "red", marginTop: 16 }}>
          Camera unavailable — please scan using your phone&apos;s camera app.
        </p>
      )}
    </div>
  )
}
