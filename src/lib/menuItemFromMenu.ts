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

export function isFatMenuItem(item: unknown): boolean {
  if (!item || typeof item !== "object") return false
  const row = item as FatMenuItem
  return (
    (Array.isArray(row.variantGroups) && row.variantGroups.length > 0) ||
    (Array.isArray(row.addOnGroups) && row.addOnGroups.length > 0)
  )
}
