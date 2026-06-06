export const BRANCH_CHOICE_SECTION_ID = "order"

export function scrollToBranchChoice() {
  const el = document.getElementById(BRANCH_CHOICE_SECTION_ID)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "start" })
}
