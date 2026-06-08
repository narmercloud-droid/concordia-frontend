import { useEffect, useState } from "react"

/** True when the browser tab is visible — use to pause background polling. */
export function useDocumentVisible() {
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || !document.hidden
  )

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden)
    document.addEventListener("visibilitychange", onChange)
    return () => document.removeEventListener("visibilitychange", onChange)
  }, [])

  return visible
}
