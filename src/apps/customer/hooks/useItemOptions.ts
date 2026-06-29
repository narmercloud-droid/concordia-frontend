import { useEffect, useMemo, useState } from "react"

import { useQuery } from "@tanstack/react-query"

import { useTranslation } from "react-i18next"

import { getItemDetails } from "@/api/customer"

import { useCartStore, type CartItem, type CartSelection } from "@/store/cartStore"

import {
  findSizeVariantName,
  getAddOnDisplayPrice,
  hasSizeVariantGroup
} from "@/utils/extraPricing"

import { formatCurrency } from "@/utils/format"



export type ItemOption = {

  id: string

  name: string

  price: number

  included?: boolean

  pricesBySize?: Record<string, number> | null

}



export type ItemOptionGroup = {

  id: string

  name: string

  required: boolean

  minSelect: number

  maxSelect: number

  included?: boolean

  options: ItemOption[]

}



function choicesFromCartItem(

  cartItem: CartItem,

  variantGroups: ItemOptionGroup[],

  addOnGroups: ItemOptionGroup[]

) {

  const variantChoices: Record<string, string> = {}

  for (const group of variantGroups) {

    const match = cartItem.variants.find((v) => group.options.some((o) => o.id === v.id))

    if (match) variantChoices[group.id] = match.id

  }



  const addOnChoices: Record<string, string[]> = {}

  for (const group of addOnGroups) {

    const ids = cartItem.addOns

      .filter((a) => group.options.some((o) => o.id === a.id))

      .map((a) => a.id)

    if (ids.length) addOnChoices[group.id] = ids

  }



  return { variantChoices, addOnChoices }

}



export function useItemOptions(

  branchId: string,

  itemId: number,

  editCartKey?: string | null

) {

  const { t, i18n } = useTranslation()

  const editCartItem = useCartStore((s) =>

    editCartKey ? s.items.find((i) => i.cartKey === editCartKey) ?? null : null

  )

  const isEditMode = !!editCartKey && !!editCartItem



  const [qty, setQty] = useState(1)

  const [notes, setNotes] = useState("")

  const [variantChoices, setVariantChoices] = useState<Record<string, string>>({})

  const [addOnChoices, setAddOnChoices] = useState<Record<string, string[]>>({})

  const [error, setError] = useState("")

  const [initialized, setInitialized] = useState(false)



  const addItem = useCartStore((s) => s.addItem)

  const replaceItem = useCartStore((s) => s.replaceItem)



  const {
    data: item,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["itemDetails", branchId, itemId, i18n.language],
    queryFn: () => getItemDetails(branchId, String(itemId)),
    enabled: !!branchId && !!itemId,
    retry: 3,
    retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 12_000),
    staleTime: 5 * 60_000
  })



  const variantGroups: ItemOptionGroup[] = item?.variantGroups ?? []

  const addOnGroups: ItemOptionGroup[] = item?.addOnGroups ?? []

  const sizeBasedExtras = item?.extraPricing?.sizeBased === true
  const requiresSizeForExtras = sizeBasedExtras && hasSizeVariantGroup(variantGroups)



  useEffect(() => {

    if (!isEditMode || !editCartItem || !item || initialized) return

    const { variantChoices: vc, addOnChoices: ac } = choicesFromCartItem(

      editCartItem,

      variantGroups,

      addOnGroups

    )

    setQty(editCartItem.quantity)

    setNotes(editCartItem.notes ?? "")

    setVariantChoices(vc)

    setAddOnChoices(ac)

    setInitialized(true)

  }, [isEditMode, editCartItem, item, variantGroups, addOnGroups, initialized])



  const selectedSizeName = useMemo(

    () => findSizeVariantName(variantGroups, variantChoices),

    [variantGroups, variantChoices]

  )



  const includedGroups = variantGroups.filter((g) => g.included)

  const paidVariantGroups = variantGroups.filter((g) => !g.included)



  const selectedVariants = useMemo(() => {

    const selections: CartSelection[] = []

    for (const group of variantGroups) {

      const choiceId = variantChoices[group.id]

      const opt = group.options.find((o) => o.id === choiceId)

      if (opt) {

        selections.push({

          id: opt.id,

          name: opt.name,

          price: opt.included ? 0 : opt.price

        })

      }

    }

    return selections

  }, [variantGroups, variantChoices])



  const selectedAddOns = useMemo(() => {

    const selections: CartSelection[] = []

    for (const group of addOnGroups) {

      const ids = addOnChoices[group.id] ?? []

      for (const id of ids) {

        const opt = group.options.find((o) => o.id === id)

        if (opt) {

          selections.push({

            id: opt.id,

            name: opt.name,

            price: getAddOnDisplayPrice(opt, selectedSizeName)

          })

        }

      }

    }

    return selections

  }, [addOnGroups, addOnChoices, selectedSizeName])



  const unitPrice = useMemo(() => {

    if (!item) return 0

    const paidVariantTotal = selectedVariants

      .filter((v) => v.price > 0)

      .reduce((sum, v) => sum + v.price, 0)

    const base = paidVariantTotal > 0 ? paidVariantTotal : item.price

    const extras = selectedAddOns.reduce((sum, a) => sum + a.price, 0)

    return base + extras

  }, [item, selectedVariants, selectedAddOns])



  const extrasBlocked = requiresSizeForExtras && !selectedSizeName



  const toggleAddOn = (group: ItemOptionGroup, optionId: string) => {

    if (extrasBlocked) return

    setAddOnChoices((prev) => {

      const current = prev[group.id] ?? []

      const exists = current.includes(optionId)

      let next: string[]

      if (exists) {

        next = current.filter((id) => id !== optionId)

      } else if (group.maxSelect === 1) {

        next = [optionId]

      } else if (group.maxSelect > 0 && current.length >= group.maxSelect) {

        return prev

      } else {

        next = [...current, optionId]

      }

      return { ...prev, [group.id]: next }

    })

  }



  const validate = () => {

    for (const group of variantGroups) {

      if (group.required && !variantChoices[group.id]) {

        return t("item.chooseRequired", { name: group.name })

      }

    }

    if (requiresSizeForExtras && !selectedSizeName) {

      return t("item.chooseSizeFirst")

    }

    for (const group of addOnGroups) {

      const count = (addOnChoices[group.id] ?? []).length

      if (group.required && count < Math.max(1, group.minSelect)) {

        return t("item.chooseRequired", { name: group.name })

      }

      if (group.minSelect > 0 && count < group.minSelect) {

        return t("item.chooseMin", { count: group.minSelect, name: group.name })

      }

    }

    return ""

  }



  const reset = () => {

    setQty(1)

    setNotes("")

    setVariantChoices({})

    setAddOnChoices({})

    setError("")

    setInitialized(false)

  }



  const addToCart = (onAdded?: () => void) => {

    if (!item) return false

    const validationError = validate()

    if (validationError) {

      setError(validationError)

      return false

    }

    setError("")



    const payload = {

      id: itemId,

      branchId,

      name: item.name,

      unitPrice,

      quantity: qty,

      variants: selectedVariants,

      addOns: selectedAddOns,

      notes: notes.trim() || undefined

    }



    if (isEditMode && editCartKey) {

      replaceItem(editCartKey, payload)

    } else {

      addItem(payload)

    }



    onAdded?.()

    return true

  }



  const formatOptionPrice = (price: number, included?: boolean) =>

    included ? t("common.free") : formatCurrency(price)



  return {

    item,

    isLoading,

    isError,

    refetchItem: refetch,

    isEditMode,

    qty,

    setQty,

    notes,

    setNotes,

    variantChoices,

    setVariantChoices,

    addOnChoices,

    setAddOnChoices,

    error,

    includedGroups,

    paidVariantGroups,

    addOnGroups,

    sizeBasedExtras,

    requiresSizeForExtras,

    selectedSizeName,

    extrasBlocked,

    unitPrice,

    toggleAddOn,

    addToCart,

    reset,

    formatOptionPrice,

    t

  }

}

