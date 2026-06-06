import { create } from "zustand"
import { MenuItem } from "@/types/Menu"

export interface CartItem {
  item: MenuItem
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: MenuItem) => void
  removeItem: (id: string) => void
  increase: (id: string) => void
  decrease: (id: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>((set) => ({
  items: JSON.parse(localStorage.getItem("cart") || "[]"),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.item.id === item.id)
      let updated

      if (existing) {
        updated = state.items.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      } else {
        updated = [...state.items, { item, quantity: 1 }]
      }

      localStorage.setItem("cart", JSON.stringify(updated))
      return { items: updated }
    }),

  removeItem: (id) =>
    set((state) => {
      const updated = state.items.filter((i) => i.item.id !== id)
      localStorage.setItem("cart", JSON.stringify(updated))
      return { items: updated }
    }),

  increase: (id) =>
    set((state) => {
      const updated = state.items.map((i) =>
        i.item.id === id ? { ...i, quantity: i.quantity + 1 } : i
      )
      localStorage.setItem("cart", JSON.stringify(updated))
      return { items: updated }
    }),

  decrease: (id) =>
    set((state) => {
      const updated = state.items
        .map((i) =>
          i.item.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)

      localStorage.setItem("cart", JSON.stringify(updated))
      return { items: updated }
    }),

  clear: () => {
    localStorage.removeItem("cart")
    return { items: [] }
  }
}))
