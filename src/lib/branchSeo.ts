import { BRANCH_CONTACT } from "@/lib/branchContact"
import { SITE_URL } from "@/lib/seo"

export type BranchSeoProfile = {
  id: string
  name: string
  streetAddress: string
  postalCode: string
  addressLocality: string
  telephone: string
  latitude: number
  longitude: number
  cuisine: string[]
  menuUrl: string
  areaServed: string[]
}

export const BRANCH_SEO: Record<string, BranchSeoProfile> = {
  "concordia-kempen": {
    id: "concordia-kempen",
    name: "Pizzeria Concordia Kempen",
    streetAddress: "Concordienplatz 1",
    postalCode: "47906",
    addressLocality: "Kempen",
    telephone: BRANCH_CONTACT["concordia-kempen"].phoneHref.replace(/^tel:/, ""),
    latitude: 51.3703503,
    longitude: 6.4105939,
    cuisine: ["Pizza", "Pasta", "Italian", "Schnitzel"],
    menuUrl: `${SITE_URL}/kempen-menu.html`,
    areaServed: ["Kempen", "St. Hubert", "Tönisvorst", "Grefrath"]
  },
  "concordia-straelen": {
    id: "concordia-straelen",
    name: "Pizzeria Concordia Straelen",
    streetAddress: "Venloer Straße 22",
    postalCode: "47638",
    addressLocality: "Straelen",
    telephone: BRANCH_CONTACT["concordia-straelen"].phoneHref.replace(/^tel:/, ""),
    latitude: 51.4412,
    longitude: 6.2684,
    cuisine: ["Pizza", "Pasta", "Italian", "Döner"],
    menuUrl: `${SITE_URL}/straelen-menu.html`,
    areaServed: ["Straelen", "Wachtendonk", "Herongen", "Nettetal"]
  }
}

export function restaurantJsonLd(branchId: string) {
  const branch = BRANCH_SEO[branchId]
  if (!branch) return null
  const orderUrl = `${SITE_URL}/branch/${branchId}`
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${orderUrl}#restaurant`,
    name: branch.name,
    image: `${SITE_URL}/images/concordia-logo-web-hero.webp?v=20260709`,
    url: orderUrl,
    telephone: branch.telephone,
    priceRange: "€€",
    servesCuisine: branch.cuisine,
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.streetAddress,
      addressLocality: branch.addressLocality,
      postalCode: branch.postalCode,
      addressCountry: "DE"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: branch.latitude,
      longitude: branch.longitude
    },
    areaServed: branch.areaServed.map((name) => ({
      "@type": "City",
      name
    })),
    hasMenu: branch.menuUrl,
    acceptsReservations: false,
    potentialAction: {
      "@type": "OrderAction",
      target: orderUrl,
      deliveryMethod: [
        "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet",
        "http://purl.org/goodrelations/v1#DeliveryModePickUp"
      ]
    }
  }
}
