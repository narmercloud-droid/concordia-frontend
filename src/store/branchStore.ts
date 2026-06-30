import { create } from "zustand"

const STORAGE_KEY = "concordia:selectedBranch"

function readStoredBranchId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

interface BranchState {
  selectedBranchId: string | null
  setSelectedBranchId: (branchId: string) => void
  clearSelectedBranchId: () => void
}

export const useBranchStore = create<BranchState>((set) => ({
  selectedBranchId: readStoredBranchId(),
  setSelectedBranchId: (branchId) => {
    try {
      localStorage.setItem(STORAGE_KEY, branchId)
    } catch {
      // ignore storage errors
    }
    set({ selectedBranchId: branchId })
  },
  clearSelectedBranchId: () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    set({ selectedBranchId: null })
  }
}))
