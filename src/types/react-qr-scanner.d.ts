declare module "react-qr-scanner" {
  import type { ComponentType } from "react"

  export type QrScannerProps = {
    delay?: number
    style?: React.CSSProperties
    onError?: (error: Error) => void
    onScan?: (data: { text?: string } | null) => void
  }

  const QrScanner: ComponentType<QrScannerProps>
  export default QrScanner
}
