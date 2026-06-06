import { create } from "zustand";

export interface CartSelection {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartKey: string;
  id: number;
  branchId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  variants: CartSelection[];
  addOns: CartSelection[];
  notes?: string;
}

function buildCartKey(item: Omit<CartItem, "cartKey">) {
  const variantPart = item.variants
    .map((v) => v.id)
    .sort()
    .join(",");
  const addOnPart = item.addOns
    .map((a) => a.id)
    .sort()
    .join(",");
  return `${item.id}:${variantPart}:${addOnPart}:${item.notes?.trim() ?? ""}`;
}

interface CartState {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "cartKey">) => void;
  removeItem: (cartKey: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const cartKey = buildCartKey(item);
    const line = { ...item, cartKey };

    set((state) => {
      const existing = state.items.find((i) => i.cartKey === cartKey);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.cartKey === cartKey
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        };
      }
      return { items: [...state.items, line] };
    });
  },

  removeItem: (cartKey) =>
    set((state) => ({
      items: state.items.filter((i) => i.cartKey !== cartKey)
    })),

  clearCart: () => set({ items: [] }),

  total: () =>
    get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}));
