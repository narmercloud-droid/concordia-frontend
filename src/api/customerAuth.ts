import api from "./client"

function unwrap<T>(res: { data?: { data?: T; success?: boolean } }): T {
  const body = res.data
  if (body && "data" in body && body.data !== undefined) return body.data as T
  return body as T
}

export type CustomerUser = {
  id: string
  name: string
  email: string
  phone?: string | null
  loyaltyPoints: number
  loyaltyTier: string
  lifetimePoints?: number
}

export const registerCustomer = async (data: {
  name: string
  email: string
  password: string
  phone?: string
}) => {
  const res = await api.post("/customer/register", data)
  return unwrap<{ accessToken: string; user: CustomerUser }>(res)
}

export const loginCustomer = async (data: { email: string; password: string }) => {
  const res = await api.post("/customer/login", data)
  return unwrap<{ accessToken: string; user: CustomerUser }>(res)
}

export const getCustomerProfile = async () => {
  const res = await api.get("/customer/me")
  return unwrap<CustomerUser & { addresses?: unknown[] }>(res)
}
