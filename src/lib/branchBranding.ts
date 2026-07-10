/**
 * Brand marks — V3 chef mascot (white / red / green).
 * Header lockup, hero, and icon live under /images/.
 */
export const BRAND_LOGO_HEADER = "/images/concordia-logo-web-header.webp?v=20260709"
export const BRAND_LOGO_HERO = "/images/concordia-logo-web-hero.webp?v=20260709"
export const BRAND_LOGO_ICON = "/images/concordia-logo-web-icon.webp?v=20260709"
export const BRAND_LOGO_IMAGE = BRAND_LOGO_HEADER
export const BRAND_LOGO_FANCY = BRAND_LOGO_ICON

/** Vector fallbacks for print / compact header when PNG is too tall. */
export const BRAND_LOGO_SVG = "/brand/svg/concordia-logo-compact.svg"
export const BRAND_LOGO_FULL_SVG = "/brand/svg/concordia-logo-full.svg"
export const BRAND_MARK_SVG = "/brand/svg/concordia-mark.svg"

export const BRAND_ORDER_URL_KEMPEN =
  "https://www.concordiapizza.de/branch/concordia-kempen"

export const BRAND_ORDER_URL_STRAELEN =
  "https://www.concordiapizza.de/branch/concordia-straelen"

export const BRAND_MENU_URL_KEMPEN =
  "https://www.concordiapizza.de/kempen-menu.html"

export const BRAND_MENU_URL_STRAELEN =
  "https://www.concordiapizza.de/straelen-menu.html"

export const BRAND_PRINT = {
  letterhead: "/brand/print/letterhead.html",
  flyerQr: "/brand/print/flyer-order-qr.html",
  tableTent: "/brand/print/table-tent-qr.html",
  posterKempen: "/brand/print/poster-online-order-kempen.html",
  posterStraelen: "/brand/print/poster-online-order-straelen.html"
} as const
