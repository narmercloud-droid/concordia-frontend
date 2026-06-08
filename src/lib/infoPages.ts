export const INFO_PAGES = [
  { path: "/about", key: "about" },
  { path: "/contact", key: "contact" },
  { path: "/reviews", key: "reviews" },
  { path: "/offers", key: "offers" },
  { path: "/faq", key: "faq" },
  { path: "/terms", key: "terms" },
  { path: "/loyalty-terms", key: "loyaltyTerms" }
] as const

export const WIDE_CUSTOMER_PATHS = new Set([
  "/",
  ...INFO_PAGES.map((page) => page.path)
])
