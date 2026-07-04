export const SITE_URL = "https://www.concordiapizza.de"
export const SITE_NAME = "Pizzeria Concordia"
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/concordia-logo-web-hero.png?v=20260627`

export type PageSeo = {
  title: string
  description: string
  canonical: string
  noindex?: boolean
  ogType?: string
}

function branchLocationLabel(branch?: { name?: string; city?: string | null }) {
  return (
    branch?.name?.replace(/^Concordia\s+/i, "").trim() ||
    branch?.city?.trim() ||
    ""
  )
}

export function seoForPath(
  pathname: string,
  branch?: { id?: string; name?: string; city?: string | null }
): PageSeo {
  const canonical = `${SITE_URL}${pathname === "/" ? "/" : pathname}`

  if (pathname === "/") {
    return {
      title: "Pizzeria Concordia – Pizza online bestellen | Kempen & Straelen",
      description:
        "Pizza, Pasta und mehr online bestellen bei Pizzeria Concordia in Kempen und Straelen. Lieferung oder Abholung – frisch aus dem Ofen.",
      canonical: `${SITE_URL}/`
    }
  }

  const branchMatch = pathname.match(/^\/branch\/([^/]+)/)
  if (branchMatch) {
    const branchId = branchMatch[1]
    const place = branchLocationLabel(branch) || branchId
    if (pathname.endsWith("/checkout")) {
      return {
        title: `Bestellen – Pizzeria Concordia ${place}`,
        description: `Online bestellen bei Pizzeria Concordia ${place}. Lieferung oder Abholung.`,
        canonical,
        noindex: true
      }
    }
    if (pathname.includes("/item/")) {
      return {
        title: `Gericht – Pizzeria Concordia ${place}`,
        description: `Speisekarte und online bestellen bei Pizzeria Concordia ${place}.`,
        canonical
      }
    }
    return {
      title: `Pizza ${place} bestellen – Pizzeria Concordia | Speisekarte`,
      description: `Pizza, Pasta und mehr in ${place} online bestellen. Lieferung und Abholung bei Pizzeria Concordia. Speisekarte ansehen und direkt bestellen.`,
      canonical
    }
  }

  const staticPages: Record<string, Pick<PageSeo, "title" | "description">> = {
    "/about": {
      title: "Über uns – Pizzeria Concordia",
      description: "Pizzeria Concordia in Kempen und Straelen – italienische Küche mit deutscher Herzlichkeit."
    },
    "/contact": {
      title: "Kontakt – Pizzeria Concordia",
      description: "Kontaktieren Sie Pizzeria Concordia in Kempen oder Straelen – Telefon, Adresse und Anfrageformular."
    },
    "/reviews": {
      title: "Bewertungen – Pizzeria Concordia",
      description: "Kundenbewertungen für Pizzeria Concordia Kempen und Straelen."
    },
    "/offers": {
      title: "Angebote – Pizzeria Concordia",
      description: "Aktuelle Angebote, Aktionen und Rabatte bei Pizzeria Concordia."
    },
    "/faq": {
      title: "FAQ – Pizzeria Concordia",
      description: "Häufige Fragen zu Bestellung, Lieferung, Abholung und Zahlung bei Pizzeria Concordia."
    },
    "/gutschein": {
      title: "Geschenkgutschein – Pizzeria Concordia",
      description: "Geschenkgutscheine für Pizzeria Concordia online kaufen."
    },
    "/impressum": {
      title: "Impressum – Pizzeria Concordia",
      description: "Impressum und Anbieterkennzeichnung der Pizzeria Concordia."
    },
    "/datenschutz": {
      title: "Datenschutz – Pizzeria Concordia",
      description: "Datenschutzerklärung der Pizzeria Concordia."
    },
    "/agb": {
      title: "AGB – Pizzeria Concordia",
      description: "Allgemeine Geschäftsbedingungen der Pizzeria Concordia."
    },
    "/terms": {
      title: "Treueprogramm – Pizzeria Concordia",
      description: "Teilnahmebedingungen Treueprogramm Pizzeria Concordia."
    },
    "/widerruf": {
      title: "Widerruf – Pizzeria Concordia",
      description: "Widerrufsbelehrung für Bestellungen bei Pizzeria Concordia."
    }
  }

  if (staticPages[pathname]) {
    return { ...staticPages[pathname], canonical }
  }

  if (pathname.startsWith("/customer/checkout") || pathname.startsWith("/customer/cart")) {
    return {
      title: "Kasse – Pizzeria Concordia",
      description: "Bestellung abschließen bei Pizzeria Concordia.",
      canonical,
      noindex: true
    }
  }

  if (pathname.startsWith("/customer/order/")) {
    return {
      title: "Bestellstatus – Pizzeria Concordia",
      description: "Ihre Bestellung bei Pizzeria Concordia.",
      canonical,
      noindex: true
    }
  }

  return {
    title: SITE_NAME,
    description:
      "Pizza, Pasta und mehr online bestellen bei Pizzeria Concordia in Kempen und Straelen.",
    canonical
  }
}

function upsertMeta(
  selector: string,
  attrs: Record<string, string>,
  content: string
) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement("meta")
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value)
    }
    document.head.appendChild(el)
  }
  el.setAttribute("content", content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement("link")
    el.setAttribute("rel", rel)
    document.head.appendChild(el)
  }
  el.setAttribute("href", href)
}

export function applyPageSeo(seo: PageSeo) {
  document.title = seo.title
  upsertMeta('meta[name="description"]', { name: "description" }, seo.description)
  upsertLink("canonical", seo.canonical)
  upsertMeta('meta[property="og:title"]', { property: "og:title" }, seo.title)
  upsertMeta(
    'meta[property="og:description"]',
    { property: "og:description" },
    seo.description
  )
  upsertMeta('meta[property="og:url"]', { property: "og:url" }, seo.canonical)
  upsertMeta('meta[property="og:type"]', { property: "og:type" }, seo.ogType ?? "website")
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME)
  upsertMeta('meta[property="og:image"]', { property: "og:image" }, DEFAULT_OG_IMAGE)
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image")
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, seo.title)
  upsertMeta(
    'meta[name="twitter:description"]',
    { name: "twitter:description" },
    seo.description
  )
  upsertMeta('meta[name="robots"]', { name: "robots" }, seo.noindex ? "noindex, nofollow" : "index, follow")
}
