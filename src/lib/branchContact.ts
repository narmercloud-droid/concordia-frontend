/** Public contact details per branch (from official Pizzeria Concordia listings). */
export type BranchContactDetails = {
  phoneDisplay: string
  phoneHref: string
  email: string
  mapsUrl: string
}

/** General website enquiries (not tied to a specific branch). */
export const GENERAL_CONTACT_EMAIL = "info@concordiapizza.de"

export const BRANCH_CONTACT: Record<string, BranchContactDetails> = {
  "concordia-kempen": {
    phoneDisplay: "02152 9591952",
    phoneHref: "tel:+4921529591952",
    email: "kempen@concordiapizza.de",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Pizzeria+Concordia+Concordienplatz+1+47906+Kempen"
  },
  "concordia-straelen": {
    phoneDisplay: "02834 1748",
    phoneHref: "tel:+4928341748",
    email: "straelen@concordiapizza.de",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Pizzeria+Concordia+II+Venloerstraße+22+47638+Straelen"
  }
}
