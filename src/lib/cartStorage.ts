import type { CartItem } from "@/store/cartStore"

const CART_STORAGE_KEY = "concordia_cart_v1"

export function loadCartItems(): CartItem[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item): item is CartItem =>
        item &&
        typeof item === "object" &&
        typeof item.cartKey === "string" &&
        typeof item.id === "number" &&
        typeof item.branchId === "string" &&
        typeof item.name === "string" &&
        typeof item.unitPrice === "number" &&
        typeof item.quantity === "number" &&
        Array.isArray(item.variants) &&
        Array.isArray(item.addOns)
    )
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY)
    return []
  }
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === "undefined") return

  try {
    if (items.length === 0) {
      window.localStorage.removeItem(CART_STORAGE_KEY)
      return
    }
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore quota / private-mode errors.
  }
}

export function clearCartStorage(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(CART_STORAGE_KEY)
}
