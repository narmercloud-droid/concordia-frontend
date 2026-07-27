import React, { useCallback, useEffect, useId, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"

type Props = {
  onScan: (text: string) => void
  paused?: boolean
}

type CameraState = "idle" | "requesting" | "active" | "denied" | "error"

function pickRearCamera(cameras: Array<{ id: string; label: string }>) {
  if (!cameras.length) return null
  const rear = cameras.find((cam) => /back|rear|environment|hint/i.test(cam.label))
  return rear?.id ?? cameras[cameras.length - 1]?.id ?? cameras[0]?.id ?? null
}

export default function CourierQrScanner({ onScan, paused = false }: Props) {
  const regionId = useId().replace(/:/g, "")
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScanRef = useRef("")
  const onScanRef = useRef(onScan)
  const pausedRef = useRef(paused)

  const [cameraState, setCameraState] = useState<CameraState>("idle")
  const [cameraHint, setCameraHint] = useState<string | null>(null)
  const [manualToken, setManualToken] = useState("")

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current
    if (!scanner) return
    try {
      if (scanner.isScanning) {
        await scanner.stop()
      }
      scanner.clear()
    } catch {
      // ignore stop errors during teardown
    }
    scannerRef.current = null
  }, [])

  const enableCamera = useCallback(async () => {
    setCameraState("requesting")
    setCameraHint(null)
    await stopScanner()

    try {
      const scanner = new Html5Qrcode(regionId, { verbose: false })
      scannerRef.current = scanner

      let cameraConfig: string | { facingMode: string } = { facingMode: "environment" }
      try {
        const cameras = await Html5Qrcode.getCameras()
        const rearId = pickRearCamera(cameras)
        if (rearId) cameraConfig = rearId
      } catch {
        // Safari/iOS often blocks camera enumeration until permission is granted — use facingMode.
        cameraConfig = { facingMode: "environment" }
      }

      await scanner.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72)
            return { width: size, height: size }
          },
          aspectRatio: 1
        },
        (decodedText) => {
          if (pausedRef.current) return
          const raw = decodedText.trim()
          if (!raw || raw === lastScanRef.current) return
          lastScanRef.current = raw
          onScanRef.current(raw)
        },
        () => {
          // QR not found in frame — ignore
        }
      )

      setCameraState("active")
    } catch (err) {
      await stopScanner()
      const name = err instanceof DOMException ? err.name : ""
      const message = err instanceof Error ? err.message : String(err)

      if (name === "NotAllowedError" || name === "PermissionDeniedError" || /permission/i.test(message)) {
        setCameraState("denied")
        setCameraHint(
          "Camera blocked. On iPhone: Settings → Safari → Camera → Allow. On Android: tap the lock icon in the address bar and allow Camera, then try again."
        )
        return
      }

      setCameraState("error")
      setCameraHint(
        message ||
          "Could not open the camera. Try Safari or Chrome, or paste the driver link below."
      )
    }
  }, [regionId, stopScanner])

  useEffect(() => {
    if (!paused) {
      lastScanRef.current = ""
    }
  }, [paused])

  useEffect(() => () => {
    void stopScanner()
  }, [stopScanner])

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
            {cameraState === "denied" && (
              <p>Camera access denied. Allow camera for this site, or paste the driver link below.</p>
            )}
            {cameraState === "error" && (
              <p>Could not start the camera on this phone. Paste the driver link below if scanning fails.</p>
            )}
            {cameraState === "idle" && (
              <>
                <p>Tap below and allow camera access to scan delivery QR codes.</p>
                <button
                  type="button"
                  className="courier-btn courier-btn--primary"
                  onClick={() => void enableCamera()}
                >
                  Enable camera
                </button>
              </>
            )}
            {cameraState === "requesting" && <p>Opening camera…</p>}
          </div>
        )}
        <div
          id={regionId}
          className={`courier-scan__reader${cameraState === "active" ? " courier-scan__reader--live" : ""}`}
        />
      </div>

      {cameraState === "active" && (
        <button type="button" className="courier-btn courier-scan__retry" onClick={() => void enableCamera()}>
          Restart camera
        </button>
      )}

      {(cameraState === "denied" || cameraState === "error") && (
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
