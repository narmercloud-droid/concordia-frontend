import { create } from "zustand"

interface AdminAuthState {
  admin: any | null
  token: string | null
  setAdmin: (admin: any) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: JSON.parse(localStorage.getItem("admin") || "null"),
  token: localStorage.getItem("adminToken"),

  setAdmin: (admin) => {
    localStorage.setItem("admin", JSON.stringify(admin))
    set({ admin })
  },

  setToken: (token) => {
    if (token) localStorage.setItem("adminToken", token)
    else localStorage.removeItem("adminToken")
    set({ token })
  },

  logout: () => {
    localStorage.removeItem("admin")
    localStorage.removeItem("adminToken")
    set({ admin: null, token: null })
  }
}))
