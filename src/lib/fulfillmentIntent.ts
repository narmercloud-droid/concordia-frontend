const STORAGE_KEY = "concordia-fulfillment-intent-v1";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type FulfillmentIntent = "pickup" | "delivery";

type StoredIntent = {
  branchId: string;
  fulfillment: FulfillmentIntent;
  ts: number;
};

export function parseFulfillmentParam(
  value: string | null | undefined
): FulfillmentIntent | null {
  if (value === "pickup" || value === "delivery") return value;
  return null;
}

export function saveFulfillmentIntent(branchId: string, fulfillment: FulfillmentIntent) {
  if (typeof window === "undefined" || !branchId) return;
  const payload: StoredIntent = { branchId, fulfillment, ts: Date.now() };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

export function loadFulfillmentIntent(branchId: string): FulfillmentIntent | null {
  if (typeof window === "undefined" || !branchId) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredIntent;
    if (parsed.branchId !== branchId) return null;
    if (Date.now() - parsed.ts > MAX_AGE_MS) return null;
    return parsed.fulfillment === "pickup" || parsed.fulfillment === "delivery"
      ? parsed.fulfillment
      : null;
  } catch {
    return null;
  }
}
