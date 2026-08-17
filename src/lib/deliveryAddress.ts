export type DeliveryAddressFields = {
  street: string
  houseNumber: string
  floor: string
  city: string
  postalCode: string
  lat?: number
  lng?: number
}

export const EMPTY_DELIVERY_ADDRESS: DeliveryAddressFields = {
  street: "",
  houseNumber: "",
  floor: "",
  city: "",
  postalCode: ""
}

export function formatDeliveryAddress(
  fields: DeliveryAddressFields,
  options?: { includeInstructions?: boolean }
): string {
  const streetLine = [fields.street.trim(), fields.houseNumber.trim()]
    .filter(Boolean)
    .join(" ")
  const location = [fields.postalCode.trim(), fields.city.trim()].filter(Boolean).join(" ")
  const parts = [streetLine]
  if (options?.includeInstructions && fields.floor.trim()) {
    parts.push(fields.floor.trim())
  }
  if (location) parts.push(location)
  return parts.filter(Boolean).join(", ")
}

/** Street + PLZ/city only — extra Etage/Klingel notes break Google Maps routing. */
export function toNavigationAddress(address?: string | null, postalCode?: string | null): string {
  const raw = (address ?? "").trim()
  if (!raw) return ""

  const parts = raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  const navigable =
    parts.length <= 2 ? parts.join(", ") : `${parts[0]}, ${parts[parts.length - 1]}`

  const plz = (postalCode ?? "").trim()
  if (plz && !navigable.includes(plz)) {
    return `${navigable}, ${plz}`
  }
  return navigable
}

export function splitDeliveryAddress(address?: string | null): {
  streetLines: string[]
  hints: string[]
} {
  const parts = (address ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) return { streetLines: [], hints: [] }
  if (parts.length <= 2) return { streetLines: parts, hints: [] }

  return {
    streetLines: [parts[0], parts[parts.length - 1]],
    hints: parts.slice(1, -1)
  }
}

export function isDeliveryAddressComplete(fields: DeliveryAddressFields): boolean {
  return (
    /^\d{5}$/.test(fields.postalCode.trim()) &&
    fields.city.trim().length >= 2 &&
    fields.street.trim().length >= 2 &&
    fields.houseNumber.trim().length >= 1
  )
}

export function parseLegacyAddress(address: string): DeliveryAddressFields {
  const trimmed = address.trim()
  if (!trimmed) return { ...EMPTY_DELIVERY_ADDRESS }

  const postalMatch = trimmed.match(/\b(\d{5})\s+([^,]+?)\s*$/i)
  const postalCode = postalMatch?.[1] ?? ""
  const city = postalMatch?.[2]?.trim() ?? ""
  const beforeLocation = postalMatch
    ? trimmed.slice(0, postalMatch.index).replace(/,\s*$/, "").trim()
    : trimmed

  const commaParts = beforeLocation.split(",").map((part) => part.trim()).filter(Boolean)
  const streetPart = commaParts[0] ?? beforeLocation
  const floor = commaParts.slice(1).join(", ")

  const houseMatch = streetPart.match(/^(.+?)\s+(\d+\s*[a-zA-Z]?)$/)
  if (houseMatch) {
    return {
      street: houseMatch[1].trim(),
      houseNumber: houseMatch[2].trim(),
      floor,
      city,
      postalCode
    }
  }

  return {
    street: streetPart,
    houseNumber: "",
    floor,
    city,
    postalCode
  }
}

export function normalizeDeliveryAddressFields(
  fields: Partial<DeliveryAddressFields> | null | undefined
): DeliveryAddressFields {
  const source = fields ?? {}
  return {
    street: String(source.street ?? ""),
    houseNumber: String(source.houseNumber ?? ""),
    floor: String(source.floor ?? ""),
    city: String(source.city ?? ""),
    postalCode: String(source.postalCode ?? ""),
    lat: typeof source.lat === "number" ? source.lat : undefined,
    lng: typeof source.lng === "number" ? source.lng : undefined
  }
}

export function loadAddressFields(
  draft: { address?: string; addressFields?: DeliveryAddressFields } | null | undefined
): DeliveryAddressFields {
  if (draft?.addressFields) {
    return normalizeDeliveryAddressFields({
      ...EMPTY_DELIVERY_ADDRESS,
      ...draft.addressFields
    })
  }
  if (draft?.address?.trim()) {
    return normalizeDeliveryAddressFields(parseLegacyAddress(draft.address))
  }
  return { ...EMPTY_DELIVERY_ADDRESS }
}
