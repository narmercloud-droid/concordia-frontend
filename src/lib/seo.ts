export const SITE_URL = "https://www.concordiapizza.de"
export const SITE_NAME = "Pizzeria Concordia"
export const DEFAULT_HOME_TITLE =
  "Pizza bestellen Kempen & Straelen | Pizzeria Concordia – Online Lieferung & Abholung"
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/concordia-logo-web-hero.webp?v=20260709`

export type PageSeo = {
  title: string
  description: string
  canonical: string
  noindex?: boolean
  ogType?: string
  jsonLd?: Record<string, unknown> | null
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
      title: DEFAULT_HOME_TITLE,
      description:
        "Pizza und Pizzeria in Kempen und Straelen online bestellen: frische Pizza, Pasta, Schnitzel und mehr. Lieferung oder Abholung bei Pizzeria Concordia – Speisekarte und Bestellung auf concordiapizza.de.",
      canonical: `${SITE_URL}/`
    }
  }

  const branchMatch = pathname.match(/^\/branch\/([^/]+)/)
  if (branchMatch) {
    const branchId = branchMatch[1]
    const place = branchLocationLabel(branch) || branchId
    const branchSeo: Record<string, Pick<PageSeo, "title" | "description">> = {
      "concordia-straelen": {
        title: "Pizza Straelen bestellen | Pizzeria Concordia – Speisekarte & Lieferung",
        description:
          "Pizza bestellen in Straelen: Pizzeria Concordia an der Venloer Straße 22. Pizza, Pasta, Döner und mehr – online bestellen zur Lieferung oder Abholung."
      },
      "concordia-kempen": {
        title: "Pizza Kempen bestellen | Pizzeria Concordia – Speisekarte & Lieferung",
        description:
          "Pizza bestellen in Kempen: Pizzeria Concordia am Concordienplatz 1. Pizza, Pasta und mehr – online bestellen zur Lieferung oder Abholung in Kempen und Umgebung."
      }
    }
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
    if (branchSeo[branchId]) {
      return {
        ...branchSeo[branchId],
        canonical,
        ogType: "restaurant.menu"
      }
    }
    return {
      title: `Pizza ${place} bestellen – Pizzeria Concordia | Speisekarte`,
      description: `Pizza und Pizzeria in ${place}: online bestellen bei Pizzeria Concordia. Lieferung und Abholung – Speisekarte ansehen und direkt bestellen.`,
      canonical
    }
  }

  const staticPages: Record<string, Pick<PageSeo, "title" | "description">> = {
    "/about": {
      title: "Über uns – Pizzeria Concordia Kempen & Straelen",
      description:
        "Pizzeria Concordia in Kempen und Straelen – italienische Küche, frische Pizza und Pasta. Lernen Sie unsere Filialen kennen."
    },
    "/contact": {
      title: "Kontakt – Pizzeria Concordia Kempen & Straelen",
      description:
        "Kontakt Pizzeria Concordia: Telefon und Adresse für Kempen (Concordienplatz 1) und Straelen (Venloer Straße 22)."
    },
    "/reviews": {
      title: "Bewertungen – Pizzeria Concordia Kempen & Straelen",
      description: "Kundenbewertungen für unsere Pizzeria in Kempen und Straelen."
    },
    "/offers": {
      title: "Pizza Angebote Kempen & Straelen – Pizzeria Concordia",
      description:
        "Aktuelle Pizza-Angebote und Rabatte bei Pizzeria Concordia in Kempen und Straelen – online bestellen und sparen."
    },
    "/faq": {
      title: "FAQ – Pizza bestellen bei Pizzeria Concordia",
      description:
        "Häufige Fragen zu Pizza-Bestellung, Lieferung, Abholung und Zahlung bei Pizzeria Concordia Kempen und Straelen."
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
      "Pizza und Pizzeria in Kempen und Straelen online bestellen bei Pizzeria Concordia.",
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

function upsertJsonLd(id: string, data: Record<string, unknown> | null) {
  const existing = document.getElementById(id)
  if (!data) {
    existing?.remove()
    return
  }
  let el = existing as HTMLScriptElement | null
  if (!el) {
    el = document.createElement("script")
    el.type = "application/ld+json"
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export function applyPageSeo(seo: PageSeo, jsonLd?: Record<string, unknown> | null) {
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
  upsertMeta(
    'meta[name="robots"]',
    { name: "robots" },
    seo.noindex ? "noindex, nofollow" : "index, follow"
  )
  upsertJsonLd("concordia-page-jsonld", jsonLd ?? seo.jsonLd ?? null)
}
