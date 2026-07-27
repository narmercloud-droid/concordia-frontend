import React, { useCallback, useEffect, useRef, useState } from "react"

type Props = {
  onScan: (text: string) => void
  paused?: boolean
}

type CameraState = "idle" | "requesting" | "active" | "denied" | "unsupported"

function readCameraSupport() {
  if (typeof navigator === "undefined") return false
  return Boolean(navigator.mediaDevices?.getUserMedia)
}

export default function CourierQrScanner({ onScan, paused = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef(0)
  const lastScanRef = useRef("")
  const detectorRef = useRef<BarcodeDetector | null>(null)

  const [cameraState, setCameraState] = useState<CameraState>(() =>
    readCameraSupport() ? "idle" : "unsupported"
  )
  const [cameraHint, setCameraHint] = useState<string | null>(null)
  const [manualToken, setManualToken] = useState("")

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startDetectionLoop = useCallback(() => {
    const detector = detectorRef.current
    if (!detector) return

    const tick = async () => {
      if (!videoRef.current || paused) return
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
      rafRef.current = requestAnimationFrame(() => {
        void tick()
      })
    }

    void tick()
  }, [onScan, paused])

  const enableCamera = useCallback(async () => {
    if (!readCameraSupport()) {
      setCameraState("unsupported")
      return
    }

    setCameraState("requesting")
    setCameraHint(null)
    stopCamera()

    try {
      detectorRef.current = null
      if (typeof BarcodeDetector !== "undefined") {
        try {
          detectorRef.current = new BarcodeDetector({ formats: ["qr_code"] })
        } catch {
          detectorRef.current = null
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      })

      streamRef.current = stream
      const video = videoRef.current
      if (!video) {
        stream.getTracks().forEach((track) => track.stop())
        setCameraState("idle")
        return
      }

      video.srcObject = stream
      video.setAttribute("playsinline", "true")
      video.muted = true
      await video.play()

      setCameraState("active")
      if (!detectorRef.current) {
        setCameraHint("Camera on — paste the driver link below if QR auto-scan is unavailable.")
      }
      startDetectionLoop()
    } catch (err) {
      stopCamera()
      const name = err instanceof DOMException ? err.name : ""
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraState("denied")
        setCameraHint("Camera blocked. Allow camera for this site in browser settings, then try again.")
        return
      }
      setCameraState("idle")
      setCameraHint(
        err instanceof Error
          ? err.message
          : "Could not open camera — paste the driver link below."
      )
    }
  }, [startDetectionLoop, stopCamera])

  useEffect(() => {
    if (paused || cameraState !== "active") return
    startDetectionLoop()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [cameraState, paused, startDetectionLoop])

  useEffect(() => () => stopCamera(), [stopCamera])

  const submitManual = () => {
    const value = manualToken.trim()
    if (!value) return
    onScan(value)
    setManualToken("")
  }

  return (
    <div className="courier-scan">
      <div className="courier-scan__camera">
        {cameraState !== "active" && (
          <div className="courier-scan__placeholder">
            {cameraState === "unsupported" && (
              <p>Camera not supported in this browser. Paste the driver link below.</p>
            )}
            {cameraState === "denied" && (
              <p>Camera access denied. Enable it in browser settings or paste the link below.</p>
            )}
            {cameraState === "idle" && (
              <>
                <p>Allow camera access to scan delivery QR codes.</p>
                <button type="button" className="courier-btn courier-btn--primary" onClick={() => void enableCamera()}>
                  Enable camera
                </button>
              </>
            )}
            {cameraState === "requesting" && <p>Opening camera…</p>}
          </div>
        )}
        <video
          ref={videoRef}
          className={`courier-scan__video${cameraState === "active" ? " courier-scan__video--live" : ""}`}
          playsInline
          muted
          autoPlay
        />
        {cameraState === "active" && <div className="courier-scan__overlay" aria-hidden="true" />}
      </div>

      {cameraState === "active" && (
        <button type="button" className="courier-btn courier-scan__retry" onClick={() => void enableCamera()}>
          Restart camera
        </button>
      )}

      {cameraState === "denied" && (
        <button type="button" className="courier-btn courier-scan__retry" onClick={() => void enableCamera()}>
          Try again
        </button>
      )}

      {cameraHint ? <p className="courier-scan__hint">{cameraHint}</p> : null}

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
