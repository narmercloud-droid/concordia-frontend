export type FeaturedMenuItem = {
  id: number
  itemNumber?: string | null
  name: string
  description?: string | null
  price: number
  imageUrl?: string | null
}

export type FeaturedMenuCategory = {
  name: string
  items: FeaturedMenuItem[]
}

export const BEST_SELLERS_SECTION_ID = "best-sellers"

/** Kempen printed-menu numbers for the most-ordered signature dishes. */
const KEMPEN_BEST_SELLER_NUMBERS = ["01", "03", "13", "25", "33", "36"]

function firstItem(categories: FeaturedMenuCategory[], pattern: RegExp) {
  const cat = categories.find((c) => pattern.test(c.name))
  return cat?.items?.[0] ?? null
}

function dedupeItems(items: FeaturedMenuItem[], limit: number) {
  const seen = new Set<number>()
  return items
    .filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
    .slice(0, limit)
}

function itemsByNumbers(categories: FeaturedMenuCategory[], numbers: string[]) {
  return numbers
    .map((number) => {
      for (const cat of categories) {
        const item = (cat.items ?? []).find((entry) => entry.itemNumber === number)
        if (item) return item
      }
      return null
    })
    .filter((item): item is FeaturedMenuItem => item != null)
}

function itemsByIds(categories: FeaturedMenuCategory[], ids: number[]) {
  return ids
    .map((id) => {
      for (const cat of categories) {
        const item = (cat.items ?? []).find((entry) => entry.id === id)
        if (item) return item
      }
      return null
    })
    .filter((item): item is FeaturedMenuItem => item != null)
}

export type PickFeaturedOptions = {
  salesItemIds?: number[]
}

export function pickFeatured(
  categories: FeaturedMenuCategory[],
  limit = 6,
  options?: PickFeaturedOptions
) {
  if (options?.salesItemIds?.length) {
    const fromSales = itemsByIds(categories, options.salesItemIds)
    if (fromSales.length >= 3) {
      return dedupeItems(fromSales, limit)
    }
  }

  const curated = itemsByNumbers(categories, KEMPEN_BEST_SELLER_NUMBERS)
  if (curated.length >= 3) {
    return dedupeItems(curated, limit)
  }

  const picks = [
    firstItem(categories, /pizzen/i) ?? firstItem(categories, /pizza/i),
    firstItem(categories, /pasta/i),
    firstItem(categories, /salat/i),
    firstItem(categories, /al forno/i),
    firstItem(categories, /schnitzel/i),
    firstItem(categories, /baguette/i)
  ].filter((item): item is FeaturedMenuItem => item != null)

  return dedupeItems(curated.length ? [...curated, ...picks] : picks, limit)
}

export function categoryForItem(categories: FeaturedMenuCategory[], item: FeaturedMenuItem) {
  return categories.find((c) => (c.items ?? []).some((i) => i.id === item.id))?.name ?? ""
}
