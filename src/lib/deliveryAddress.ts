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

export function formatDeliveryAddress(fields: DeliveryAddressFields): string {
  const streetLine = [fields.street.trim(), fields.houseNumber.trim()]
    .filter(Boolean)
    .join(" ")
  const floor = fields.floor.trim()
  const location = [fields.postalCode.trim(), fields.city.trim()].filter(Boolean).join(" ")

  const parts = [streetLine]
  if (floor) parts.push(floor)
  if (location) parts.push(location)

  return parts.filter(Boolean).join(", ")
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

  const floorMatch = beforeLocation.match(/,\s*((?:\d+\.\s*)?(?:OG|Etage|Stock|Floor).*)$/i)
  const floor = floorMatch?.[1]?.trim() ?? ""
  const streetPart = floorMatch
    ? beforeLocation.slice(0, floorMatch.index).trim()
    : beforeLocation

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
