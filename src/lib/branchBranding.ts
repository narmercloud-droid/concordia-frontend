/**
 * Brand marks — homepage/header use CSS wordmark (ConcordiaWordmark).
 * Full illustrated PNGs kept for print / legacy reference only.
 */
export const BRAND_LOGO_REFERENCE = "/images/concordia-logo-reference.png"
export const BRAND_LOGO_WORDMARK = "/images/concordia-logo-wordmark.png"
export const BRAND_LOGO_FANCY = "/images/concordia-logo-fancy.png?v=20260620"
export const BRAND_LOGO_PEOPLE_TIERED = "/images/concordia-logo-people-tiered.png?v=20260619"
export const BRAND_LOGO_HERO = "/images/concordia-logo-fancy.png?v=20260619"
export const BRAND_LOGO_IMAGE = "/images/concordia-logo-fancy.png?v=20260619"

/** Vector fallbacks for print / compact header when PNG is too tall. */
export const BRAND_LOGO_SVG = "/brand/svg/concordia-logo-compact.svg"
export const BRAND_LOGO_FULL_SVG = "/brand/svg/concordia-logo-full.svg"
export const BRAND_MARK_SVG = "/brand/svg/concordia-mark.svg"

export const BRAND_ORDER_URL_KEMPEN =
  "https://concordia-restaurant-de.vercel.app/branch/concordia-kempen"

export const BRAND_PRINT = {
  letterhead: "/brand/print/letterhead.html",
  flyerQr: "/brand/print/flyer-order-qr.html",
  tableTent: "/brand/print/table-tent-qr.html"
} as const

/**
 * Upload one photo per owner into public/images/owners/
 * Use the same left-to-right order as the logo (see OWNER_PHOTO_SLOTS).
 *
 * Accepted: .jpg .jpeg .png .webp — name exactly owner-1 … owner-5
 */
export const OWNER_PHOTOS_DIR = "/images/owners"

export type OwnerPhotoSlot = {
  /** File base name without extension, e.g. owner-1 */
  id: string
  /** Position in the logo (left → right) */
  position: 1 | 2 | 3 | 4 | 5
  /** Short note for alt text until names are wired in i18n */
  descriptionDe: string
}

export const OWNER_PHOTO_SLOTS: OwnerPhotoSlot[] = [
  { id: "owner-1", position: 1, descriptionDe: "Dritter Pizzabäcker — hinten links" },
  { id: "owner-2", position: 2, descriptionDe: "Zweiter Pizzabäcker — rechte Hand des Direktors" },
  { id: "owner-3", position: 3, descriptionDe: "Direktor — Mitte vorne (Anzug, kein Koch)" },
  { id: "owner-4", position: 4, descriptionDe: "Koch — hinten rechts" },
  { id: "owner-5", position: 5, descriptionDe: "Erster Pizzabäcker — linke Hand des Direktors (Pizza)" }
]

/** Director / family patriarch — center front, business suit in logo (owner-3). */
export const OWNER_DIRECTOR_PHOTO = `${OWNER_PHOTOS_DIR}/owner-3.png`

/** @deprecated Use OWNER_DIRECTOR_PHOTO */
export const OWNER_CEO_PHOTO = OWNER_DIRECTOR_PHOTO

/** First pizza chef — director's right hand, pizza peel (owner-5). */
export const OWNER_PIZZA_CHEF_1_PHOTO = `${OWNER_PHOTOS_DIR}/owner-5.png`

/** Second pizza chef — director's left hand, front row (owner-2). */
export const OWNER_PIZZA_CHEF_2_PHOTO = `${OWNER_PHOTOS_DIR}/owner-2.png`

/** Third pizza chef — back row left (owner-1). */
export const OWNER_PIZZA_CHEF_3_PHOTO = `${OWNER_PHOTOS_DIR}/owner-1.png`

/** Fourth family chef — back right (owner-4). */
export const OWNER_KITCHEN_CHEF_PHOTO = `${OWNER_PHOTOS_DIR}/owner-4.png`

/** Portrait crops used on Team and About pages (same files, one source of truth). */
export const TEAM_MEMBER_PHOTOS = {
  director: `${OWNER_PHOTOS_DIR}/owner-3-logo-portrait.png`,
  pizzaChef1: `${OWNER_PHOTOS_DIR}/owner-5-logo-portrait.png`,
  pizzaChef2: `${OWNER_PHOTOS_DIR}/owner-2-logo-portrait.png`,
  pizzaChef3: `${OWNER_PHOTOS_DIR}/owner-1-logo-portrait.png`,
  kitchenChef: `${OWNER_PHOTOS_DIR}/owner-4-logo-portrait.png`
} as const

export type TeamMemberPhotoKey = keyof typeof TEAM_MEMBER_PHOTOS

/** About page branch chefs — explicit portraits (can differ from Team page). */
export const ABOUT_BRANCH_CHEFS = [
  {
    branchKey: "kempen",
    chefs: [
      {
        chefKey: "alaan",
        photo: `${OWNER_PHOTOS_DIR}/owner-5-logo-portrait-no-peel.png`
      },
      {
        chefKey: "jiuan",
        photo: `${OWNER_PHOTOS_DIR}/owner-2-logo-portrait.png`
      }
    ]
  },
  {
    branchKey: "straelen",
    chefs: [
      { chefKey: "ahmad", photo: null },
      {
        chefKey: "siban",
        photo: `${OWNER_PHOTOS_DIR}/owner-1-logo-portrait.png`
      }
    ]
  }
] as const satisfies ReadonlyArray<{
  branchKey: "kempen" | "straelen"
  chefs: ReadonlyArray<{ chefKey: string; photo: string | null }>
}>

/** Path for an uploaded owner photo (use .jpg, .png, or .webp with this base name). */
export function getOwnerPhotoPath(slotId: string, ext: "jpg" | "png" | "webp" = "jpg"): string | null {
  const slot = OWNER_PHOTO_SLOTS.find((s) => s.id === slotId)
  if (!slot) return null
  return `${OWNER_PHOTOS_DIR}/${slot.id}.${ext}`
}
