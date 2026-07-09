import { create } from "zustand"

function readStoredUser() {
  try {
    const raw = localStorage.getItem("user")
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem("user")
    return null
  }
}

interface AuthState {
  user: any | null
  token: string | null
  setUser: (user: any) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readStoredUser(),
  token: localStorage.getItem("accessToken"),

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user))
    set({ user })
  },

  setToken: (token) => {
    if (token) localStorage.setItem("accessToken", token)
    else localStorage.removeItem("accessToken")
    set({ token })
  },

  logout: () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
    set({ user: null, token: null })
  }
}))
