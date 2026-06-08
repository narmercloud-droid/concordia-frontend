export const INFO_PAGES = [
  { path: "/about", key: "about" },
  { path: "/contact", key: "contact" },
  { path: "/reviews", key: "reviews" },
  { path: "/offers", key: "offers" },
  { path: "/faq", key: "faq" }
] as const

/** Required German legal pages (Impressum, Datenschutz, AGB) plus shop terms + loyalty. */
export const LEGAL_PAGES = [
  { path: "/impressum", key: "impressum" },
  { path: "/datenschutz", key: "privacy" },
  { path: "/agb", key: "agb" },
  { path: "/terms", key: "terms" }
] as const

export const WIDE_CUSTOMER_PATHS = new Set([
  "/",
  ...INFO_PAGES.map((page) => page.path),
  ...LEGAL_PAGES.map((page) => page.path)
])
