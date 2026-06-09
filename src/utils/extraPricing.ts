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

type VariantGroupLike = {
  id: string
  name: string
  options: Array<{ id: string; name: string }>
}

function normalizeGroupName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
}

export function normalizeSizeKey(sizeName: string): "klein" | "gross" | null {
  const n = sizeName.toLowerCase()
  if (n.includes("klein") || n.includes("small") || n.includes("24")) return "klein"
  if (n.includes("groß") || n.includes("gross") || n.includes("large") || n.includes("30")) {
    return "gross"
  }
  return null
}

function isSizeLikeOptionName(name: string): boolean {
  return normalizeSizeKey(name) != null
}

export function isSizeVariantGroup(group: VariantGroupLike): boolean {
  const name = normalizeGroupName(group.name)
  if (
    name === "grosse" ||
    name === "size" ||
    name.includes("grosse") ||
    name.includes("size") ||
    name.includes("taille") ||
    name.includes("rozmiar")
  ) {
    return true
  }
  if (group.id.startsWith("size-")) return true

  const sizeOptions = group.options.filter((o) => isSizeLikeOptionName(o.name))
  return sizeOptions.length >= 2
}

export function hasSizeVariantGroup(
  variantGroups: VariantGroupLike[]
): boolean {
  return variantGroups.some(isSizeVariantGroup)
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
  variantGroups: VariantGroupLike[],
  variantChoices: Record<string, string>
): string | null {
  const sizeGroup = variantGroups.find(isSizeVariantGroup)
  if (sizeGroup) {
    const choiceId = variantChoices[sizeGroup.id]
    const selected = sizeGroup.options.find((o) => o.id === choiceId)
    if (selected) return selected.name
  }

  for (const group of variantGroups) {
    const choiceId = variantChoices[group.id]
    if (!choiceId) continue
    const selected = group.options.find((o) => o.id === choiceId)
    if (selected && isSizeLikeOptionName(selected.name)) {
      return selected.name
    }
  }

  return null
}
