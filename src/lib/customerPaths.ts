export const KEMPEN_BRANCH_ID = "concordia-kempen"
export const STRAELEN_BRANCH_ID = "concordia-straelen"

export const branchPath = (branchId: string) => `/branch/${branchId}`

export const branchItemPath = (branchId: string, itemId: string | number) =>
  `/branch/${branchId}/item/${itemId}`
