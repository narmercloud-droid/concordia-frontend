import api from "./client.js"

export const getBranches = () => api.get("/admin/api/branches")
export const createBranch = (data: any) => api.post("/admin/api/branches", data)
export const updateBranch = (id: string, data: any) =>
  api.put(`/admin/api/branches/${id}`, data)
export const deleteBranch = (id: string) =>
  api.delete(`/admin/api/branches/${id}`)
