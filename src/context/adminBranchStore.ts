import { create } from "zustand"

interface AdminBranchState {
  selectedBranchId: string | null
  setSelectedBranchId: (branchId: string) => void
}

const stored = sessionStorage.getItem("adminSelectedBranchId")

export const useAdminBranchStore = create<AdminBranchState>((set) => ({
  selectedBranchId: stored || null,
  setSelectedBranchId: (branchId) => {
    sessionStorage.setItem("adminSelectedBranchId", branchId)
    set({ selectedBranchId: branchId })
  }
}))
