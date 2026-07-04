/** Item row from fat menu API (variantGroups/addOnGroups embedded). */
export type FatMenuItem = {
  id: number
  name: string
  description?: string | null
  price: number
  imageUrl?: string | null
  itemNumber?: string | null
  variantGroups?: unknown[]
  addOnGroups?: unknown[]
  extraPricing?: { sizeBased?: boolean; hint?: string }
}

export function isFatMenuItem(item: unknown): item is FatMenuItem {
  return !!item && typeof item === "object" && "variantGroups" in item
}
