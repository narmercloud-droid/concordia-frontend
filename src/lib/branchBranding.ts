import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"

export const BRAND_LOGO_IMAGE = "/images/concordia-logo.png"

export type BranchOwnerBranding = {
  photoImage: string
}

const OWNER_BRANDING: Record<string, BranchOwnerBranding> = {
  [KEMPEN_BRANCH_ID]: {
    photoImage: "/images/owner-kempen-photo.png"
  }
}

export function getBranchOwnerBranding(branchId: string): BranchOwnerBranding | null {
  return OWNER_BRANDING[branchId] ?? null
}
