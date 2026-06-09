import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"

/** Header, footer, favicon — five owner-chefs mark (Option B). */
export const BRAND_LOGO_IMAGE = "/images/concordia-logo.png"
/** Homepage hero — includes both taglines in the artwork. */
export const BRAND_LOGO_HERO = "/images/concordia-logo-hero.png"

export type BranchOwnerBranding = {
  photoImage: string
}

const OWNER_BRANDING: Record<string, BranchOwnerBranding> = {
  [KEMPEN_BRANCH_ID]: {
    photoImage: "/images/owner-chefs-duo-cartoon.png"
  }
}

export function getBranchOwnerBranding(branchId: string): BranchOwnerBranding | null {
  return OWNER_BRANDING[branchId] ?? null
}
