const CUSTOMER_MANIFEST = "/manifest.json"
const ADMIN_MANIFEST = "/admin-manifest.json"
const CUSTOMER_THEME = "#1b7340"
const ADMIN_THEME = "#222222"

function ensureMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement("meta")
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

/** Point the installable web app at admin vs customer based on the current path. */
export function applyWebAppManifest(pathname = window.location.pathname) {
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/")
  const href = isAdmin ? ADMIN_MANIFEST : CUSTOMER_MANIFEST
  const theme = isAdmin ? ADMIN_THEME : CUSTOMER_THEME
  const title = isAdmin ? "Concordia Admin" : "Pizzeria Concordia"

  let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement("link")
    link.rel = "manifest"
    document.head.appendChild(link)
  }
  if (link.getAttribute("href") !== href) {
    link.setAttribute("href", href)
  }

  ensureMeta("theme-color", theme)
  ensureMeta("apple-mobile-web-app-title", title)
  ensureMeta("application-name", title)
}
