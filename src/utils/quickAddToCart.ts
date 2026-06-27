import { getItemDetails } from "@/api/customer"
import type { CartSelection } from "@/store/cartStore"
import {
  findSizeVariantName,
  getAddOnDisplayPrice,
  hasSizeVariantGroup
} from "@/utils/extraPricing"

type ItemOption = {
  id: string
  name: string
  price: number
  included?: boolean
  pricesBySize?: Record<string, number> | null
}

type ItemOptionGroup = {
  id: string
  name: string
  required: boolean
  minSelect: number
  maxSelect: number
  included?: boolean
  options: ItemOption[]
}

export type QuickAddResult = "added" | "needs_options"

type CartLineInput = {
  id: number
  branchId: string
  name: string
  unitPrice: number
  quantity: number
  variants: CartSelection[]
  addOns: CartSelection[]
  notes?: string
}

function buildDefaultChoices(variantGroups: ItemOptionGroup[]) {
  const variantChoices: Record<string, string> = {}

  for (const group of variantGroups) {
    if (group.options.length > 0) {
      variantChoices[group.id] = group.options[0].id
    }
  }

  return variantChoices
}

function buildSelections(
  variantGroups: ItemOptionGroup[],
  addOnGroups: ItemOptionGroup[],
  variantChoices: Record<string, string>,
  addOnChoices: Record<string, string[]>
) {
  const variants: CartSelection[] = []
  for (const group of variantGroups) {
    const choiceId = variantChoices[group.id]
    const opt = group.options.find((o) => o.id === choiceId)
    if (opt) {
      variants.push({
        id: opt.id,
        name: opt.name,
        price: opt.included ? 0 : opt.price
      })
    }
  }

  const selectedSizeName = findSizeVariantName(variantGroups, variantChoices)
  const addOns: CartSelection[] = []
  for (const group of addOnGroups) {
    const ids = addOnChoices[group.id] ?? []
    for (const id of ids) {
      const opt = group.options.find((o) => o.id === id)
      if (opt) {
        addOns.push({
          id: opt.id,
          name: opt.name,
          price: getAddOnDisplayPrice(opt, selectedSizeName)
        })
      }
    }
  }

  return { variants, addOns }
}

function calcUnitPrice(
  basePrice: number,
  variants: CartSelection[],
  addOns: CartSelection[]
) {
  const paidVariantTotal = variants
    .filter((v) => v.price > 0)
    .reduce((sum, v) => sum + v.price, 0)
  const base = paidVariantTotal > 0 ? paidVariantTotal : basePrice
  const extras = addOns.reduce((sum, a) => sum + a.price, 0)
  return base + extras
}

function needsManualOptions(
  variantGroups: ItemOptionGroup[],
  addOnGroups: ItemOptionGroup[]
) {
  for (const group of variantGroups) {
    if (group.required && group.options.length === 0) return true
  }

  if (variantGroups.length > 2) return true

  if (hasSizeVariantGroup(variantGroups) && addOnGroups.length > 0) return true

  for (const group of addOnGroups) {
    if (group.required || group.minSelect > 0) return true
  }

  return false
}

export async function quickAddItemToCart(
  branchId: string,
  itemId: number,
  addItem: (item: CartLineInput) => void
): Promise<QuickAddResult> {
  const item = await getItemDetails(branchId, String(itemId))
  const variantGroups: ItemOptionGroup[] = item?.variantGroups ?? []
  const addOnGroups: ItemOptionGroup[] = item?.addOnGroups ?? []
  const variantChoices = buildDefaultChoices(variantGroups)
  const addOnChoices: Record<string, string[]> = {}

  if (needsManualOptions(variantGroups, addOnGroups)) {
    return "needs_options"
  }

  const { variants, addOns } = buildSelections(
    variantGroups,
    addOnGroups,
    variantChoices,
    addOnChoices
  )

  addItem({
    id: itemId,
    branchId,
    name: item.name,
    unitPrice: calcUnitPrice(item.price, variants, addOns),
    quantity: 1,
    variants,
    addOns
  })

  return "added"
}
