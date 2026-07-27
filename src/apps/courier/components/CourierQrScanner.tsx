import React, { useEffect, useRef, useState } from "react"

type Props = {
  onScan: (text: string) => void
  paused?: boolean
}

export default function CourierQrScanner({ onScan, paused = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualToken, setManualToken] = useState("")
  const lastScanRef = useRef("")

  useEffect(() => {
    if (paused) return

    let cancelled = false
    let raf = 0
    const detector =
      typeof BarcodeDetector !== "undefined"
        ? new BarcodeDetector({ formats: ["qr_code"] })
        : null

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()

        if (!detector) {
          setCameraError("Camera active — paste the driver link below if QR auto-scan is unavailable.")
          return
        }

        const tick = async () => {
          if (cancelled || paused || !videoRef.current) return
          try {
            const codes = await detector.detect(videoRef.current)
            const raw = codes[0]?.rawValue?.trim()
            if (raw && raw !== lastScanRef.current) {
              lastScanRef.current = raw
              onScan(raw)
            }
          } catch {
            // ignore frame errors
          }
          raf = requestAnimationFrame(() => {
            void tick()
          })
        }
        void tick()
      } catch (err) {
        setCameraError(
          err instanceof Error
            ? err.message
            : "Camera unavailable — paste the driver link from the receipt below."
        )
      }
    }

    void start()

    return () => {
      cancelled = true
      if (raf) cancelAnimationFrame(raf)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [onScan, paused])

  const submitManual = () => {
    const value = manualToken.trim()
    if (!value) return
    onScan(value)
    setManualToken("")
  }

  return (
    <div className="courier-scan">
      <div className="courier-scan__camera">
        <video ref={videoRef} className="courier-scan__video" playsInline muted />
        {!cameraError && <div className="courier-scan__overlay" aria-hidden="true" />}
      </div>

      {cameraError ? <p className="courier-scan__hint">{cameraError}</p> : null}

      <label className="courier-scan__manual">
        <span>Paste driver link or token</span>
        <input
          type="text"
          value={manualToken}
          onChange={(e) => setManualToken(e.target.value)}
          placeholder="https://…/courier/order?token=…"
          autoComplete="off"
          spellCheck={false}
        />
        <button type="button" onClick={submitManual} disabled={!manualToken.trim()}>
          Add order
        </button>
      </label>
    </div>
  )
}
