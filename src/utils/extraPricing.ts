const SIZE_EXTRA_RATES = {
  klein: { standard: 1, premium: 1.5 },
  gross: { standard: 1.5, premium: 2 }
} as const

const PREMIUM_NAMES = new Set([
  "Krabben",
  "Meeresfrüchte",
  "Hähnchenbruststreifen",
  "Mit Käse überbacken"
])

export function normalizeSizeKey(sizeName: string): "klein" | "gross" | null {
  const n = sizeName.toLowerCase()
  if (n.includes("klein") || n.includes("24")) return "klein"
  if (n.includes("groß") || n.includes("gross") || n.includes("30")) return "gross"
  return null
}

export function getAddOnDisplayPrice(
  option: { name: string; price: number; pricesBySize?: Record<string, number> | null },
  sizeName: string | null
): number {
  if (option.pricesBySize && sizeName) {
    const key = normalizeSizeKey(sizeName)
    if (key && option.pricesBySize[key] != null) {
      return option.pricesBySize[key]
    }
  }
  return option.price
}

export function findSizeVariantName(
  variantGroups: Array<{ id: string; name: string; options: Array<{ id: string; name: string }> }>,
  variantChoices: Record<string, string>
): string | null {
  const sizeGroup = variantGroups.find(
    (g) => g.name === "Größe" || g.name.toLowerCase().includes("größe")
  )
  if (!sizeGroup) return null
  const choiceId = variantChoices[sizeGroup.id]
  return sizeGroup.options.find((o) => o.id === choiceId)?.name ?? null
}
