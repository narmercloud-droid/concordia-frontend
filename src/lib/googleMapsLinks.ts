/** Google Business Profile link targets (one listing per location). */
export const GOOGLE_MAPS_BRANCH_SLUG = {
  "concordia-straelen": "straelen",
  "concordia-kempen": "kempen"
} as const;

export type GoogleMapsBranchId = keyof typeof GOOGLE_MAPS_BRANCH_SLUG;

const SITE = "https://www.concordiapizza.de";

export function googleMapsMenuUrl(branchId: GoogleMapsBranchId): string {
  const slug = GOOGLE_MAPS_BRANCH_SLUG[branchId];
  return `${SITE}/${slug}/menu`;
}

export function googleMapsOrderUrl(branchId: GoogleMapsBranchId): string {
  return `${SITE}/branch/${branchId}`;
}

export function googleMapsPickupUrl(branchId: GoogleMapsBranchId): string {
  return `${SITE}/branch/${branchId}/checkout?fulfillment=pickup`;
}

export function googleMapsDeliveryUrl(branchId: GoogleMapsBranchId): string {
  return `${SITE}/branch/${branchId}/checkout?fulfillment=delivery`;
}

export const GOOGLE_MAPS_LINKS = {
  straelen: {
    menu: googleMapsMenuUrl("concordia-straelen"),
    order: googleMapsOrderUrl("concordia-straelen"),
    pickup: googleMapsPickupUrl("concordia-straelen"),
    delivery: googleMapsDeliveryUrl("concordia-straelen")
  },
  kempen: {
    menu: googleMapsMenuUrl("concordia-kempen"),
    order: googleMapsOrderUrl("concordia-kempen"),
    pickup: googleMapsPickupUrl("concordia-kempen"),
    delivery: googleMapsDeliveryUrl("concordia-kempen")
  }
} as const;
