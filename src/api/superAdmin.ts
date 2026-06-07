import api from "./client.js"

function unwrap<T>(res: { data?: { data?: T } }): T {
  return (res.data?.data ?? res.data) as T
}

export const getSuperAdminPermissions = async () => {
  const res = await api.get("/api/v1/super-admin/permissions")
  return unwrap<{ permissions: Record<string, boolean>; keys: string[] }>(res)
}

export const updateSuperAdminPermissions = async (permissions: Record<string, boolean>) => {
  const res = await api.put("/api/v1/super-admin/permissions", { permissions })
  return unwrap<{ permissions: Record<string, boolean> }>(res)
}

export const getSuperAdminStaff = async () => {
  const res = await api.get("/api/v1/super-admin/staff")
  return unwrap<{ staff: any[] }>(res)
}

export const createSuperAdminStaff = async (data: {
  name: string
  email: string
  password: string
  role: "admin" | "manager"
  branchId?: string | null
}) => {
  const res = await api.post("/api/v1/super-admin/staff", data)
  return unwrap(res)
}

export const updateSuperAdminStaff = async (
  id: string,
  data: {
    name?: string
    email?: string
    password?: string
    role?: "admin" | "manager"
    branchId?: string | null
  }
) => {
  const res = await api.put(`/api/v1/super-admin/staff/${id}`, data)
  return unwrap(res)
}

export const deleteSuperAdminStaff = async (id: string) => {
  const res = await api.delete(`/api/v1/super-admin/staff/${id}`)
  return unwrap(res)
}

export const getSuperAdminBranches = async () => {
  const res = await api.get("/api/v1/super-admin/branches")
  return unwrap<any[]>(res)
}
