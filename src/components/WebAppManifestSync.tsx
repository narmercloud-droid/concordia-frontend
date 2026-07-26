import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { applyWebAppManifest } from "@/lib/webAppManifest.js"

/** Keeps the PWA manifest linked to admin vs customer as the SPA route changes. */
export default function WebAppManifestSync() {
  const { pathname } = useLocation()

  useEffect(() => {
    applyWebAppManifest(pathname)
  }, [pathname])

  return null
}
