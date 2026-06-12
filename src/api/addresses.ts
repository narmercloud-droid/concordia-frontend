import api from "./client"

function unwrap<T>(res: { data?: { data?: T; success?: boolean } }): T {
  const body = res.data
  if (body && "data" in body && body.data !== undefined) return body.data as T
  return body as T
}

export type SavedAddress = {
  id: string
  label: string
  street: string
  city: string
  postalCode: string
  lat?: number | null
  lng?: number | null
  instructions?: string | null
  isDefault?: boolean
}

export type AddressInput = {
  label?: string
  street: string
  city: string
  postalCode: string
  lat?: number
  lng?: number
  instructions?: string
  isDefault?: boolean
}

export const listAddresses = async () => {
  const res = await api.get("/api/v1/customers/addresses")
  return unwrap<SavedAddress[]>(res)
}

export const addAddress = async (data: AddressInput) => {
  const res = await api.post("/api/v1/customers/addresses", data)
  return unwrap<SavedAddress>(res)
}

export const updateAddress = async (id: string, data: Partial<AddressInput>) => {
  const res = await api.put(`/api/v1/customers/addresses/${id}`, data)
  return unwrap<{ success: boolean }>(res)
}

export const deleteAddress = async (id: string) => {
  const res = await api.delete(`/api/v1/customers/addresses/${id}`)
  return unwrap<{ success: boolean }>(res)
}
