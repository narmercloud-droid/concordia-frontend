import api from "./client.js"

export const getStaff = () => api.get("/admin/staff")
export const createStaff = (data: any) => api.post("/admin/staff", data)
export const updateStaff = (id: string, data: any) =>
  api.put(`/admin/staff/${id}`, data)
export const deleteStaff = (id: string) =>
  api.delete(`/admin/staff/${id}`)
