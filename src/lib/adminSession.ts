import { clearAdminBranchSelection } from "@/context/adminBranchStore"

let redirectPending = false

export function isAdminApiUrl(url: string) {
  return (
    url.includes("/api/v1/manager") ||
    url.includes("/api/v1/super-admin") ||
    url.includes("/api/auth/admin") ||
    url.includes("/api/v1/admin") ||
    url.includes("/api/admin/") ||
    url.includes("/api/payments/branches")
  )
}

export function clearAdminSessionStorage() {
  localStorage.removeItem("admin")
  localStorage.removeItem("adminToken")
  clearAdminBranchSelection()
}

/** Force re-login when the admin token is rejected by the API. */
export function redirectToAdminLogin(reason: "expired" | "forbidden" = "expired") {
  if (redirectPending || typeof window === "undefined") return
  if (window.location.pathname.startsWith("/admin/login")) return

  redirectPending = true
  clearAdminSessionStorage()
  const params = new URLSearchParams({ session: reason })
  window.location.assign(`/admin/login?${params.toString()}`)
}
