import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"

export type BranchOwnerBranding = {
  cartoonImage: string
  photoImage: string
}

const OWNER_BRANDING: Record<string, BranchOwnerBranding> = {
  [KEMPEN_BRANCH_ID]: {
    cartoonImage: "/images/owner-chef-cartoon.png",
    photoImage: "/images/owner-kempen-photo.png"
  }
}

export function getBranchOwnerBranding(branchId: string): BranchOwnerBranding | null {
  return OWNER_BRANDING[branchId] ?? null
}

export const OWNER_LOGO_IMAGE = "/images/owner-chef-cartoon.png"
